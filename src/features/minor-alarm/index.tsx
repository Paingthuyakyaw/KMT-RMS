import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useEffect, useMemo, useState } from "react";
import {
  dateToApiYmd,
  formatInstantInTz,
  todayBoundsInTz,
} from "@/lib/app-timezone";
import { useTimezoneStore } from "@/store/client/timezone-store";
import { AlertCircle, Filter, Maximize2, Minimize2 } from "lucide-react";
import { useMinorAlarm } from "@/store/server/alarm/query";
import { useTriggerList, type TriggerListItem } from "@/store/server/alarm/query";
import { DatePicker } from "@/components/date-picker";
import { scrollWindowToBottom } from "@/lib/utils";
import { useProjectList } from "@/store/server/project/query";

const MinorAlarm = () => {
  const timeZoneId = useTimezoneStore((s) => s.timeZoneId);
  const [tableExpanded, setTableExpanded] = useState(false);
  const [draftFilter, setDraftFilter] = useState<{
    device_name: string;
    status: string;
    trigger: string;
    project_id: string;
    from_date: Date | undefined;
    to_date: Date | undefined;
  }>(() => {
    const { from, to } = todayBoundsInTz(useTimezoneStore.getState().timeZoneId);
    return {
      device_name: "",
      status: "",
      trigger: "",
      project_id: "",
      from_date: from,
      to_date: to,
    };
  });
  const [appliedFilter, setAppliedFilter] = useState(draftFilter);

  useEffect(() => {
    const { from, to } = todayBoundsInTz(timeZoneId);
    queueMicrotask(() => {
      setDraftFilter((prev) => ({ ...prev, from_date: from, to_date: to }));
      setAppliedFilter((prev) => ({ ...prev, from_date: from, to_date: to }));
    });
  }, [timeZoneId]);
  const { data: projectData } = useProjectList({});
  const projects = projectData?.projects ?? [];

  const { data: triggerData } = useTriggerList({
    alarm_type: "minor_alarm",
  });
  const triggers = triggerData?.triggers ?? [];
  const selectedTrigger = useMemo((): TriggerListItem | null => {
    const v = draftFilter.trigger.trim();
    if (!v) return null;
    return (
      triggers.find((t) => t.name === v) ?? {
        id: 0,
        name: v,
        alarm_type: "minor_alarm",
      }
    );
  }, [draftFilter.trigger, triggers]);

  const { data } = useMinorAlarm({
    ...appliedFilter,
    from_date: dateToApiYmd(appliedFilter.from_date, timeZoneId),
    to_date: dateToApiYmd(appliedFilter.to_date, timeZoneId),
  });

  const minorCount = useMemo(() => data?.alarm_counts || 0, [data?.alarm_counts]);
  const scrollClassName = tableExpanded ? "flex-1 min-h-0" : "h-[70vh]";

  const handleReset = () => {
    const { from, to } = todayBoundsInTz(timeZoneId);
    const resetFilter = {
      device_name: "",
      status: "",
      trigger: "",
      project_id: "",
      from_date: from,
      to_date: to,
    };
    setDraftFilter(resetFilter);
    setAppliedFilter(resetFilter);
  };

  const handleApply = () => {
    const { from, to } = todayBoundsInTz(timeZoneId);
    setAppliedFilter({
      ...draftFilter,
      from_date: draftFilter.from_date || from,
      to_date: draftFilter.to_date || to,
    });
  };

  return (
    <div className="flex h-screen flex-col min-h-0">
      <h4 className="text-lg font-semibold tracking-tight shrink-0">
        Minor Alarm
      </h4>

      {!tableExpanded ? (
        <div className="my-8 flex flex-wrap gap-3">
          <Card className="min-w-30 border border-border bg-card px-2 py-2 shadow-none">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">
                  Alarm Count
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {minorCount}
                </span>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      <div
        className={`bg-white dark:bg-muted border rounded-md text-sm flex flex-col min-h-0 ${
          tableExpanded ? "flex-1" : ""
        }`}
      >
        <div className="flex items-center justify-end px-3 py-2">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 px-2 text-xs"
                    onClick={() => scrollWindowToBottom()}
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end" sideOffset={8}>
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-foreground">
                    Filter Options
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Device Name</Label>
                      <Input
                        placeholder="Enter device name"
                        value={draftFilter.device_name}
                        onChange={(e) =>
                          setDraftFilter((prev) => ({
                            ...prev,
                            device_name: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Project</Label>
                      <Select
                        value={draftFilter.project_id || "all"}
                        onValueChange={(val) =>
                          setDraftFilter((prev) => ({
                            ...prev,
                            project_id: val === "all" ? "" : val,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All projects" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="all">All projects</SelectItem>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Trigger Name</Label>
                      <Combobox
                        items={triggers}
                        value={selectedTrigger}
                        itemToStringLabel={(t) => t.name}
                        itemToStringValue={(t) => t.name}
                        isItemEqualToValue={(a, b) => a.name === b.name}
                        onValueChange={(t) => {
                          setDraftFilter((prev) => ({
                            ...prev,
                            trigger: t?.name ?? "",
                          }));
                        }}
                      >
                        <ComboboxInput
                          placeholder="Search and select trigger"
                          showClear
                          className="w-full min-w-0 h-9"
                        />
                        <ComboboxContent className="w-[var(--anchor-width)] min-w-[min(100%,18rem)]">
                          <ComboboxEmpty>No triggers found.</ComboboxEmpty>
                          <ComboboxList>
                            {(t: TriggerListItem) => (
                              <ComboboxItem key={t.id} value={t}>
                                {t.name}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Input
                        placeholder="Enter status (true/false)"
                        value={draftFilter.status}
                        onChange={(e) =>
                          setDraftFilter((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>From Date</Label>
                      <DatePicker
                        date={draftFilter.from_date}
                        setDate={(val) =>
                          setDraftFilter((pre) => ({ ...pre, from_date: val }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>To Date</Label>
                      <DatePicker
                        date={draftFilter.to_date}
                        setDate={(val) =>
                          setDraftFilter((pre) => ({ ...pre, to_date: val }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={handleReset}
                    >
                      Reset
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={handleApply}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs"
              aria-pressed={tableExpanded}
              aria-label={
                tableExpanded
                  ? "Shrink minor alarm table"
                  : "Expand minor alarm table"
              }
              title={
                tableExpanded ? "Table — smaller height" : "Table — larger height"
              }
              onClick={() => setTableExpanded((v) => !v)}
            >
              {tableExpanded ? (
                <Minimize2 className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5 shrink-0" />
              )}
              {tableExpanded ? "Shrink" : "Expand"}
            </Button>
          </div>
        </div>

        <ScrollArea className={scrollClassName}>
          <Table className="table-fixed w-full text-sm">
            <TableHeader className="sticky top-0 z-10 bg-muted">
              <TableRow>
                <TableHead className="w-[11%] border-r">Device Name</TableHead>
                <TableHead className="w-[11%] border-r">Project Name</TableHead>
                <TableHead className="w-[16%] border-r">Trigger</TableHead>
                <TableHead className="w-[30%] border-r">Content</TableHead>
                <TableHead className="w-[10%] border-r">Alarm Status</TableHead>
                <TableHead className="w-[22%]">Alarm Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.alarms.map((item, idx) => (
                <TableRow key={idx}>
                  <td className="border-r px-2 py-2">{item.device_name}</td>
                  <td className="border-r px-2 py-2">{item.project_name}</td>
                  <td className="border-r px-2 py-2">{item.trigger_name}</td>
                  <td className="border-r px-2 py-2 truncate">{item.content || "-"}</td>
                  <td className="border-r px-2 py-2">
                    <Badge
                      className={
                        item.status === false
                          ? "bg-green-600 hover:bg-green-600"
                          : "bg-red-600 hover:bg-red-600"
                      }
                    >
                      {item.status ? "Alarm" : "Normal"}
                    </Badge>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    {item.alarm_time
                      ? formatInstantInTz(
                          item.alarm_time,
                          timeZoneId,
                          "YYYY-MM-DD HH:mm:ss",
                        )
                      : ""}
                  </td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
};

export default MinorAlarm