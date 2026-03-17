import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelectFilterDropdown } from "@/components/multi-select-filter-dropdown";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { AlertTriangle, Download, Filter } from "lucide-react";
import { DatePickerWithRange } from "@/components/date-range";
import type { DateRange } from "react-day-picker";

const MajorAlarm = () => {
  const triggerOptions = useMemo(
    () => [
      { label: "Trigger A", value: "a" },
      { label: "Trigger B", value: "b" },
      { label: "Trigger C", value: "c" },
    ],
    [],
  );

  const fakeMajorAlarm = useMemo(
    () => [
      {
        deviceName: "MDY100",
        trigger: "Trigger A",
        alarmStatus: "Alarm" as const,
        alarmTime: "2026-03-15 13:58:03",
      },
      {
        deviceName: "MDY200",
        trigger: "Trigger B",
        alarmStatus: "Normal" as const,
        alarmTime: "2026-03-15 14:12:44",
      },
    ],
    [],
  );

  const majorCount = useMemo(
    () => fakeMajorAlarm.filter((x) => x.alarmStatus === "Alarm").length,
    [fakeMajorAlarm],
  );

  const [triggerValues, setTriggerValues] = useState<string[]>([]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: dayjs().startOf("day").toDate(),
    to: dayjs().endOf("day").toDate(),
  });
  const [downloadDate, setDownloadDate] = useState<DateRange | undefined>({
    from: dayjs().startOf("day").toDate(),
    to: dayjs().endOf("day").toDate(),
  });

  return (
    <div className="h-screen">
      <h4 className="text-sm font-semibold">Major Alarm</h4>

      <div className=" grid grid-cols-2 my-8 ">
        <div className="flex flex-wrap gap-3">
          <Card className="min-w-30 px-2 border border-border bg-card py-2 shadow-none">
            <div className=" flex items-center gap-2">
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

        <div className=" flex justify-end items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-2 text-xs"
              >
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end" sideOffset={8}>
              <div className="space-y-4">
                <div className="text-sm font-semibold text-foreground">
                  Filter Options
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Device Name</Label>
                    <Input placeholder="Enter Device Name" />
                  </div>

                  <div className=" space-y-2">
                    <Label>Date Range</Label>
                    <DatePickerWithRange date={date} setDate={setDate} />
                  </div>

                  <MultiSelectFilterDropdown
                    label="Trigger Name"
                    placeholder="Select triggers"
                    options={triggerOptions}
                    values={triggerValues}
                    onChange={setTriggerValues}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => setTriggerValues([])}
                  >
                    Reset
                  </Button>
                  <Button size="sm" className="h-7 px-3 text-xs">
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-2 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end" sideOffset={8}>
              <div className="space-y-4">
                <div className="text-sm font-semibold text-foreground">
                  Select date range to download
                </div>
                <DatePickerWithRange
                  date={downloadDate}
                  setDate={setDownloadDate}
                />
                <div className="flex justify-end">
                  <Button size="sm" className="h-7 px-3 text-xs">
                    Download
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="bg-white dark:bg-muted border rounded-md text-sm">
        <div className="border-b grid grid-cols-7 gap-2 last:border-b-0">
          <div className="border-r pl-2 py-2 col-span-2">Device Name</div>
          <div className="border-r py-2 col-span-2">Trigger</div>
          <div className="border-r py-2">Alarm Status</div>
          <div className="py-2 col-span-2">Alarm Time</div>
        </div>

        {fakeMajorAlarm.map((item, idx) => (
          <div
            key={idx}
            className="border-b grid grid-cols-7 gap-2 last:border-b-0"
          >
            <div className="border-r pl-2 py-2 col-span-2">
              {item.deviceName}
            </div>
            <div className="border-r py-2 col-span-2">{item.trigger}</div>
            <div className="border-r py-2">
              <Badge
                className={
                  item.alarmStatus === "Normal"
                    ? "bg-green-600 hover:bg-green-600"
                    : "bg-red-600 hover:bg-red-600"
                }
              >
                {item.alarmStatus}
              </Badge>
            </div>
            <div className="py-2 col-span-2">{item.alarmTime}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MajorAlarm