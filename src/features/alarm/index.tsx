import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import dayjs from "dayjs";
import { useState } from "react";
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

export default function ActiveAlarm() {
  const today = dayjs().format("YYYY-MM-DD");
  const [tableExpanded, setTableExpanded] = useState(false);
  const [draftFilter, setDraftFilter] = useState<{
    alarm_type: string;
    device_name: string;
    from_date: string;
    project_id: string;
  }>(() => ({
    alarm_type: "",
    device_name: "",
    from_date: today,
    project_id: "",
  }));
  const [appliedFilter, setAppliedFilter] = useState(draftFilter);
  const { data: projectData } = useProjectList({});
  const projects = projectData?.projects ?? [];

  const { data } = useActiveAlarm(appliedFilter);
  const card: any = data;

  const scrollClassName = tableExpanded ? "flex-1 min-h-0" : "h-[70vh]";

  const handleReset = () => {
    const resetFilter = {
      alarm_type: "",
      device_name: "",
      from_date: today,
      project_id: "",
    };
    setDraftFilter(resetFilter);
    setAppliedFilter(resetFilter);
  };

  const handleApply = () => {
    // date input ကို user က clear လုပ်နိုင်လို့ `from_date` blank ဖြစ်လာရင် backend error ဖြစ်နိုင်တာကြောင့် fallback ထားတယ်။
    setAppliedFilter({
      ...draftFilter,
      from_date: draftFilter.from_date || today,
    });
  };

  return (
    <div className="flex h-screen flex-col min-h-0">
      <h4 className="text-lg font-semibold tracking-tight shrink-0">
        Active Alarm
      </h4>

      {!tableExpanded ? (
        <div className="my-8 flex flex-wrap gap-3">
          {alarmSummary.map((item: any) => (
            <Card
              key={item.id}
              className="min-w-30 border border-border bg-card px-2 py-2 shadow-none"
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
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filter
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-80 p-4"
                align="end"
                sideOffset={8}
              >
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-foreground">
                    Filter Options
                  </div>

                  <div className="space-y-4">
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

        <div className="border-b border-t grid grid-cols-7 gap-2 last:border-b-0">
          <div className="border-r pl-2 py-2">Device Name</div>
          <div className="border-r py-2">Trigger Name</div>
          <div className="border-r py-2 col-span-2">Alarm Generate Time</div>
          <div className="border-r py-2">Alarm State</div>
          <div className="border-r py-2">Alarm Type</div>
          <div className="text-end pr-2 py-2">Duration</div>
        </div>

        <ScrollArea className={scrollClassName}>
          {data?.alarms?.map((item) => (
            <div
              key={item.id}
              className="border-b grid grid-cols-7 gap-2 last:border-b-0"
            >
              <div className="border-r pl-2 py-2">{item.device_name}</div>
              <div className="border-r py-2">{item.trigger_name}</div>
              <div className="border-r py-2 col-span-2">{item.alarm_time}</div>
              <div className="border-r py-2">
                <Badge className="bg-green-500 dark:bg-green-600">
                  Alarm
                </Badge>
              </div>
              <div className="border-r py-2">
                <Badge
                  className={`capitalize ${
                    alarmTypeColorMap[item.alarm_type?.toLowerCase() || ""] ||
                    "bg-gray-500 dark:bg-gray-600"
                  }`}
                >
                  {item.alarm_type}
                </Badge>
              </div>
              <div className="text-end pr-2 py-2">{item.duration ? parseFloat(item.duration.toString()).toFixed(2) : "0.00"}</div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}

