import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlarmHistoryDataTable } from "@/features/alarm/components/alarm-history-data-table";
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
import { dateToApiYmd, todayBoundsInTz } from "@/lib/app-timezone";
import { useTimezoneStore } from "@/store/client/timezone-store";
import { AlertTriangle, Filter, Maximize2, Minimize2 } from "lucide-react";
import { useMajorAlarm } from "@/store/server/alarm/query";
import { useTriggerList, type TriggerListItem } from "@/store/server/alarm/query";
import { DatePicker } from "@/components/date-picker";
import { cn, scrollWindowToBottom } from "@/lib/utils";
import { useProjectList } from "@/store/server/project/query";

const MajorAlarm = () => {
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
    alarm_type: "major_alarm",
  });
  const triggers = triggerData?.triggers ?? [];
  const selectedTrigger = useMemo((): TriggerListItem | null => {
    const v = draftFilter.trigger.trim();
    if (!v) return null;
    return (
      triggers.find((t) => t.name === v) ?? {
        id: 0,
        name: v,
        alarm_type: "major_alarm",
      }
    );
  }, [draftFilter.trigger, triggers]);

  const { data } = useMajorAlarm({
    ...appliedFilter,
    from_date: dateToApiYmd(appliedFilter.from_date, timeZoneId),
    to_date: dateToApiYmd(appliedFilter.to_date, timeZoneId),
  });

  const majorCount = useMemo(() => data?.alarm_counts || 0, [data?.alarm_counts]);
  const tableScrollClassName = tableExpanded
    ? "min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
    : "h-[min(58dvh,26rem)] overflow-x-auto overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] sm:h-[min(62dvh,30rem)] md:h-[70vh]";

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
    <div className="flex h-screen min-h-0 flex-col px-2 pb-3 sm:px-3 sm:pb-4 md:px-0 md:pb-6">
      <h4 className="shrink-0 text-base font-semibold tracking-tight sm:text-lg">
        Major Alarm
      </h4>

      {!tableExpanded ? (
        <div className="my-4 sm:my-6">
          <Card className="min-w-0 max-w-sm border border-border bg-card px-2 py-2 shadow-none sm:min-w-30">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">
                  Alarm Count
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {majorCount}
                </span>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      <div
        className={`flex min-h-0 flex-col rounded-md border bg-white text-xs sm:text-sm dark:bg-muted ${
          tableExpanded ? "flex-1" : ""
        }`}
      >
        <div className="flex flex-wrap items-center justify-end gap-2 px-2 py-2 sm:px-3">
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
              <PopoverContent
                className="flex w-[min(100vw-1.5rem,20rem)] max-w-[calc(100vw-1rem)] max-h-[min(32rem,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:w-80"
                align="end"
                sideOffset={8}
                collisionPadding={12}
              >
                <div className="shrink-0 border-b border-border px-4 py-3">
                  <div className="text-sm font-semibold text-foreground">
                    Filter Options
                  </div>
                </div>

                <div className="max-h-[min(22rem,calc(100dvh-8rem))] overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-gutter:stable]">
                  <div className="space-y-4 p-4 pr-3">
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
                          className="h-9 min-w-0 w-full"
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
                </div>

                <div className="flex shrink-0 justify-end gap-2 border-t border-border bg-popover px-4 py-3">
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
                  ? "Shrink major alarm table"
                  : "Expand major alarm table"
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

        <div
          className={cn(
            "w-full min-h-0",
            tableExpanded && "flex min-h-0 flex-1 flex-col",
          )}
        >
          <div
            className={cn(
              "w-full min-h-0 min-w-0 touch-pan-x",
              tableScrollClassName,
            )}
          >
            <AlarmHistoryDataTable rows={data?.alarms} timeZoneId={timeZoneId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MajorAlarm