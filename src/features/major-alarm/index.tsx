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
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { AlertTriangle, Filter, Maximize2, Minimize2 } from "lucide-react";
import { useMajorAlarm } from "@/store/server/alarm/query";
import { DatePicker } from "@/components/date-picker";
import { useProjectList } from "@/store/server/project/query";

const MajorAlarm = () => {
  const today = new Date();
  const [tableExpanded, setTableExpanded] = useState(false);
  const [draftFilter, setDraftFilter] = useState<{
    device_name: string;
    status: string;
    trigger: string;
    project_id: string;
    from_date: Date | undefined;
    to_date: Date | undefined;
  }>(() => ({
    device_name: "",
    status: "",
    trigger: "",
    project_id: "",
    from_date: today,
    to_date: today,
  }));
  const [appliedFilter, setAppliedFilter] = useState(draftFilter);
  const { data: projectData } = useProjectList({});
  const projects = projectData?.projects ?? [];

  const { data } = useMajorAlarm({
    ...appliedFilter,
    from_date : appliedFilter.from_date ? dayjs(appliedFilter.from_date).format("YYYY-MM-DD") : undefined,
    to_date : appliedFilter.to_date ? dayjs(appliedFilter.to_date).format("YYYY-MM-DD") : undefined,
  });

  const majorCount = useMemo(() => data?.alarm_counts || 0, [data?.alarm_counts]);
  const scrollClassName = tableExpanded ? "flex-1 min-h-0" : "h-[70vh]";

  const handleReset = () => {
    const resetFilter = {
      device_name: "",
      status: "",
      trigger: "",
      project_id: "",
      from_date: today,
      to_date: today,
    };
    setDraftFilter(resetFilter);
    setAppliedFilter(resetFilter);
  };

  const handleApply = () => {
    setAppliedFilter({
      ...draftFilter,
      from_date: draftFilter.from_date || today,
      to_date: draftFilter.to_date || today,
    });
  };

  return (
    <div className="flex h-screen flex-col min-h-0">
      <h4 className="text-lg font-semibold tracking-tight shrink-0">
        Major Alarm
      </h4>

      {!tableExpanded ? (
        <div className="my-8 flex flex-wrap gap-3">
          <Card className="min-w-30 border border-border bg-card px-2 py-2 shadow-none">
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
                      <Input
                        placeholder="Enter trigger name"
                        value={draftFilter.trigger}
                        onChange={(e) =>
                          setDraftFilter((prev) => ({
                            ...prev,
                            trigger: e.target.value,
                          }))
                        }
                      />
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
                     
                      <DatePicker date={draftFilter.from_date} setDate={(val) => setDraftFilter(pre => ({...pre , from_date : val})) } />
                    </div>

                    <div className="space-y-2">
                      <Label>To Date</Label>
                     
                    <DatePicker date={draftFilter.to_date} setDate={(val) => setDraftFilter(pre => ({...pre , to_date : val})) } />

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
                      ? dayjs(item.alarm_time).format("YYYY-MM-DD hh:mm:ss")
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

export default MajorAlarm