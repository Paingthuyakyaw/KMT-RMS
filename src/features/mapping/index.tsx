import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Plus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { columnGroups } from "@/features/dashboard";
import { useMappingStore } from "./store";

const COLUMN_OPTIONS = columnGroups.flatMap((group) =>
  group.columns.map((col) => ({ value: col.key, label: col.label })),
);

const CONDITION_OPTIONS = [
  { value: ">", label: "Greater than (>)" },
  { value: "<", label: "Less than (<)" },
  { value: "=", label: "Equal (=)" },
  { value: ">=", label: "Greater than or equal (>=)" },
  { value: "<=", label: "Less than or equal (<=)" },
];

const INITIAL_FORM = {
  column: "",
  condition: "",
  compareValue: "",
  displayValue: "",
};

const COMMON_EXAMPLES = [
  { text: 'Room Temp > 30 → Display "High Temperature"' },
  { text: 'Battery Voltage < 45 → Display "Low Battery"' },
  { text: 'Rectifier Current = 0 → Display "*...*"' },
  { text: 'SOC < 20 → Display "***" or "Critical"' },
];

const Mapping = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const rules = useMappingStore((s) => s.rules);
  const addRule = useMappingStore((s) => s.addRule);
  // const removeRule = useMappingStore((s) => s.removeRule);

  const updateForm = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const columnLabel =
    COLUMN_OPTIONS.find((c) => c.value === form.column)?.label ?? form.column;
  const conditionLabel =
    CONDITION_OPTIONS.find((c) => c.value === form.condition)?.label ??
    form.condition;

  const preview =
    form.column && form.condition && form.compareValue && form.displayValue
      ? `If ${columnLabel} ${form.condition} ${form.compareValue} then display "${form.displayValue}"`
      : null;

  const onAddRule = () => {
    if (
      !form.column ||
      !form.condition ||
      !form.compareValue.trim() ||
      !form.displayValue.trim()
    )
      return;
    addRule({
      column: form.column,
      columnLabel,
      condition: form.condition,
      conditionLabel,
      compareValue: form.compareValue.trim(),
      displayValue: form.displayValue.trim(),
    });
    setForm(INITIAL_FORM);
  };

  return (
    <div className="">
      <div className=" mb-5">
        <h1 className=" text-lg font-semibold tracking-tight">
          Variable Mapping
        </h1>
        <p className="text-xs text-muted-foreground">
          Configure translation rules for dashboard column values based on
          conditions.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-2">
        {/* Left: Create Translation Rule */}
        <Card className="flex flex-col overflow-hidden border border-border bg-card shadow-sm px-3 py-5">
          <CardHeader className="flex flex-row items-center gap-2 ">
            <Settings className="size-5 text-muted-foreground" />
            <CardTitle className="text-base text-foreground">
              Create Translation Rule
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-5 overflow-y-auto  pt-4">
            <div className="space-y-2">
              <Label className=" text-sm ">Select Column*</Label>
              <Select
                value={form.column}
                onValueChange={(v) => updateForm("column", v)}
              >
                <SelectTrigger className=" w-full">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {COLUMN_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select which column value you want to translate
              </p>
            </div>

            <div className="space-y-2">
              <Label className=" text-sm">Condition*</Label>
              <Select
                value={form.condition}
                onValueChange={(v) => updateForm("condition", v)}
              >
                <SelectTrigger className=" w-full">
                  <SelectValue placeholder="Choose operator" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {CONDITION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose the comparison operator
              </p>
            </div>

            <div className="space-y-2">
              <Label className=" text-sm">Compare Value*</Label>
              <Input
                className=""
                value={form.compareValue}
                onChange={(e) => updateForm("compareValue", e.target.value)}
                placeholder="e.g. 50"
              />
              <p className="text-xs text-muted-foreground">
                Enter the threshold value for comparison
              </p>
            </div>

            <div className="space-y-2">
              <Label className=" text-sm">Translate to (Display Value)*</Label>
              <Input
                className=""
                value={form.displayValue}
                onChange={(e) => updateForm("displayValue", e.target.value)}
                placeholder="e.g. ****"
              />
              <p className="text-xs text-muted-foreground">
                Enter what should be displayed when condition is met
              </p>
            </div>

            {preview && (
              <div className="rounded-lg bg-sky-50 px-4 py-3  text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
                <p className=" font-semibold">Preview: </p> {preview}
              </div>
            )}

            <Button
              onClick={onAddRule}
              className="w-full  gap-2"
            >
              <Plus className="size-4" />
              Add Rule
            </Button>

            <div
              className={cn(
                "flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30",
              )}
            >
              <AlertCircle className="size-5 shrink-0 text-amber-600 dark:text-amber-500" />
              <div className="space-y-1 ">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Common Examples
                </p>
                <ul className="list-inside list-disc space-y-0.5 text-amber-700 dark:text-amber-300">
                  {COMMON_EXAMPLES.map((ex, i) => (
                    <li key={i}>{ex.text}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Active Rules */}
        <Card className="border border-border bg-card p-5 shadow-sm">
          <CardContent className="flex flex-1 flex-col overflow-y-auto ">
            <div className="mb-5 text-sm font-semibold text-foreground">
              Active Rules ({rules.length})
            </div>
            {rules.length === 0 ? (
              <div className="flex h-40 items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-muted/40 py-16">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Settings size={44} className="text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No translation rules yet
                  </p>
                  <p className="text-center  text-muted-foreground">
                    Create your first rule using the form on the left
                  </p>
                </div>
              </div>
            ) : (
              <div></div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Mapping;
