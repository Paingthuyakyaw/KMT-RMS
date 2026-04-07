import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveAlarm } from "@/store/server/alarm/query";
import { useProjectList } from "@/store/server/project/query";
import { useEffect, useMemo, useState } from "react";
import {
  formatInstantInTz,
  todayYmdInTz,
  ymdStringToApiYmd,
} from "@/lib/app-timezone";
import { useTimezoneStore } from "@/store/client/timezone-store";
import { scrollWindowToBottom } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  Filter,
  Maximize2,
  Minimize2,
  MapPin,
  OctagonAlert,
} from "lucide-react";

const alarmSummary = [
  {
    id: "major_alarm_counts",
    label: "Major",
    value: 0,
    icon: AlertTriangle,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  {
    id: "minor_alarm_counts",
    label: "Minor",
    value: 0,
    icon: AlertCircle,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "critical_alarm_counts",
    label: "Critical",
    value: 0,
    icon: OctagonAlert,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    id: "critical-site",
    label: "Critical Site",
    value: 0,
    icon: MapPin,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

const alarmTypeColorMap: Record<string, string> = {
  major_alarm: "bg-yellow-500 dark:bg-yellow-700",
  minor_alarm: "bg-blue-500 dark:bg-blue-600",
  critical_alarm: "bg-red-500 dark:bg-red-700",
};

/**
 * Device + Trigger: min-width floor + nowrap → column grows with longest line (no wrap).
 * Other columns: min-width so they stay readable; table-auto + w-max + parent overflow scroll.
 */
const ACTIVE_ALARM_COLUMNS = [
  { key: "device", label: "Device Name", minWidthPx: 104, nowrap: true },
  { key: "trigger", label: "Trigger Name", minWidthPx: 200, nowrap: true },
  { key: "time", label: "Alarm Generate Time", minWidthPx: 176, nowrap: true },
  { key: "state", label: "Alarm State", minWidthPx: 100, nowrap: false },
  { key: "type", label: "Alarm Type", minWidthPx: 132, nowrap: false },
  { key: "duration", label: "Duration", minWidthPx: 80, nowrap: true },
] as const;

export default function ActiveAlarm() {
  const timeZoneId = useTimezoneStore((s) => s.timeZoneId);
  const [tableExpanded, setTableExpanded] = useState(false);
  const [draftFilter, setDraftFilter] = useState<{
    alarm_type: string;
    device_name: string;
    from_date: string;
    project_id: string;
  }>(() => ({
    alarm_type: "",
    device_name: "",
    from_date: todayYmdInTz(useTimezoneStore.getState().timeZoneId),
    project_id: "",
  }));
  const [appliedFilter, setAppliedFilter] = useState(draftFilter);

  useEffect(() => {
    const ymd = todayYmdInTz(timeZoneId);
    queueMicrotask(() => {
      setDraftFilter((prev) => ({ ...prev, from_date: ymd }));
      setAppliedFilter((prev) => ({ ...prev, from_date: ymd }));
    });
  }, [timeZoneId]);
  const { data: projectData } = useProjectList({});
  const projects = projectData?.projects ?? [];

  const activeAlarmApiPayload = useMemo(() => {
    const raw =
      appliedFilter.from_date.trim() || todayYmdInTz(timeZoneId);
    return {
      ...appliedFilter,
      from_date: ymdStringToApiYmd(raw, timeZoneId) ?? raw,
    };
  }, [appliedFilter, timeZoneId]);

  const { data } = useActiveAlarm(activeAlarmApiPayload);
  const card: any = data;

  const tableScrollClassName = tableExpanded
    ? "min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
    : "h-[min(58dvh,26rem)] overflow-x-auto overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] sm:h-[min(62dvh,30rem)] md:h-[70vh]";

  const handleReset = () => {
    const resetFilter = {
      alarm_type: "",
      device_name: "",
      from_date: todayYmdInTz(timeZoneId),
      project_id: "",
    };
    setDraftFilter(resetFilter);
    setAppliedFilter(resetFilter);
  };

  const handleApply = () => {
    // date input ကို user က clear လုပ်နိုင်လို့ `from_date` blank ဖြစ်လာရင် backend error ဖြစ်နိုင်တာကြောင့် fallback ထားတယ်။
    setAppliedFilter({
      ...draftFilter,
      from_date: draftFilter.from_date || todayYmdInTz(timeZoneId),
    });
  };

  return (
    <div className="flex h-screen min-h-0 flex-col px-2 pb-3 sm:px-3 sm:pb-4 md:px-0 md:pb-6">
      <h4 className="shrink-0 text-base font-semibold tracking-tight sm:text-lg">
        Active Alarm
      </h4>

      {!tableExpanded ? (
        <div className="my-4 grid grid-cols-2 gap-2 sm:my-6 sm:gap-3 lg:grid-cols-4">
          {alarmSummary.map((item: any) => (
            <Card
              key={item.id}
              className="min-w-0 border border-border bg-card px-2 py-2 shadow-none sm:min-w-30"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor}`}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {card?.[item.id] || "0"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
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
                      <Label>Alarm Type</Label>
                    </div>

                    <div className="space-y-2">
                      <Label>Device Name</Label>
                      <Input
                        placeholder="Enter device name"
                        value={draftFilter.device_name}
                        onChange={(e) =>
                          setDraftFilter((pre) => ({
                            ...pre,
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
                          setDraftFilter((pre) => ({
                            ...pre,
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
                      <Label>From Date</Label>
                      <Input
                        type="date"
                        value={draftFilter.from_date}
                        onChange={(e) =>
                          setDraftFilter((pre) => ({
                            ...pre,
                            from_date: e.target.value,
                          }))
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
                  ? "Shrink active alarm table"
                  : "Expand active alarm table"
              }
              title={
                tableExpanded
                  ? "Table — smaller height"
                  : "Table — larger height"
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
          <div className={cn("w-full min-h-0", tableScrollClassName)}>
            <Table className="table-auto border-collapse bg-muted text-sm caption-bottom">
              <TableHeader>
                <TableRow className="sticky top-0 z-20 border-0 bg-muted hover:bg-muted">
                  {ACTIVE_ALARM_COLUMNS.map((col) => (
                    <TableHead
                      key={col.key}
                      className={cn(
                        "border-border bg-muted px-2 py-2.5 text-xs font-semibold ",
                        col.key === "device" &&
                          "sticky left-0 z-30 border-border bg-muted",
                        col.nowrap && "whitespace-nowrap",
                        col.key == "duration" && "text-end"
                      )}
                      style={{ minWidth: col.minWidthPx, boxSizing: "border-box" }}
                    >
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.alarms?.map((item) => (
                  <TableRow
                    key={item.id}
                    className="bg-muted hover:bg-muted/80"
                  >
                    <TableCell
                      className="sticky left-0 z-10 border-border bg-muted px-2 py-2 text-xs whitespace-nowrap sm:text-sm"
                      style={{
                        minWidth: ACTIVE_ALARM_COLUMNS[0].minWidthPx,
                        boxSizing: "border-box",
                      }}
                    >
                      {item.device_name}
                    </TableCell>
                    <TableCell
                      className="px-2 py-2 text-xs whitespace-nowrap sm:text-sm"
                      style={{
                        minWidth: ACTIVE_ALARM_COLUMNS[1].minWidthPx,
                        boxSizing: "border-box",
                      }}
                    >
                      {item.trigger_name}
                    </TableCell>
                    <TableCell
                      className="px-2 py-2 text-xs whitespace-nowrap tabular-nums sm:text-sm"
                      style={{
                        minWidth: ACTIVE_ALARM_COLUMNS[2].minWidthPx,
                        boxSizing: "border-box",
                      }}
                    >
                      {item.alarm_time
                        ? formatInstantInTz(
                            item.alarm_time,
                            timeZoneId,
                            "YYYY-MM-DD HH:mm:ss",
                          )
                        : ""}
                    </TableCell>
                    <TableCell
                      className="px-2 py-2 text-xs sm:text-sm"
                      style={{
                        minWidth: ACTIVE_ALARM_COLUMNS[3].minWidthPx,
                        boxSizing: "border-box",
                      }}
                    >
                      <Badge className="whitespace-nowrap bg-green-500 text-[10px] sm:text-xs dark:bg-green-600">
                        Alarm
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="px-2 py-2 text-xs sm:text-sm"
                      style={{
                        minWidth: ACTIVE_ALARM_COLUMNS[4].minWidthPx,
                        boxSizing: "border-box",
                      }}
                    >
                      <Badge
                        className={`inline-block whitespace-nowrap text-left text-[10px] capitalize sm:text-xs ${
                          alarmTypeColorMap[
                            item.alarm_type?.toLowerCase() || ""
                          ] || "bg-gray-500 dark:bg-gray-600"
                        }`}
                      >
                        {item.alarm_type}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="px-2 py-2 text-end text-xs whitespace-nowrap tabular-nums sm:text-sm"
                      style={{
                        minWidth: ACTIVE_ALARM_COLUMNS[5].minWidthPx,
                        boxSizing: "border-box",
                      }}
                    >
                      {item.duration
                        ? parseFloat(item.duration.toString()).toFixed(2)
                        : "0.00"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

