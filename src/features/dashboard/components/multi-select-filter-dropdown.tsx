import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

type MultiSelectFilterDropdownProps = {
  label: string;
  placeholder: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
};

export const MultiSelectFilterDropdown = ({
  label,
  placeholder,
  options,
  values,
  onChange,
}: MultiSelectFilterDropdownProps) => {
  const selectedLabel =
    values.length === 0 ? placeholder : `${values.length} selected`;

  const handleToggleOption = (option: string, checked: boolean | string) => {
    if (checked) {
      if (!values.includes(option)) {
        onChange([...values, option]);
      }
    } else {
      onChange(values.filter((v) => v !== option));
    }
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full justify-between px-2 text-xs"
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronDown className="ml-2 h-3 w-3 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-1">
            {options.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  id={`${label}-${option}`}
                  checked={values.includes(option)}
                  onCheckedChange={(checked) =>
                    handleToggleOption(option, checked)
                  }
                />
                <label
                  htmlFor={`${label}-${option}`}
                  className="cursor-pointer text-xs"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

