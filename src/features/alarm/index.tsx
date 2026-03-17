import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelectFilterDropdown } from "@/components/multi-select-filter-dropdown";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import dayjs from "dayjs";
import { AlertCircle, AlertTriangle, Download, Filter, MapPin, OctagonAlert } from "lucide-react";
import { DatePickerWithRange } from "@/components/date-range";
import type { DateRange } from "react-day-picker";

const triggerOptions = [
  { label: "Trigger A", value: "a" },
  { label: "Trigger B", value: "b" },
  { label: "Trigger C", value: "c" },
];

const fakeAlarm = [
  {
    name: "MDY100",
    triiger: "a",
    site_type: "DY",
    time: "2026-03-15 13:58:3",
    state: "Alarm",
    type: "Online",
    duration: 0.04,
  },
  {
    name: "MDY200",
    triiger: "b",
    site_type: "YD",
    time: "2026-03-15 13:58:3",
    state: "Alarm",
    type: "Offline",
    duration: 0.06,
  },
];

const alarmSummary = [
  {
    id: "major",
    label: "Major",
    value: 0,
    icon: AlertTriangle,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  {
    id: "minor",
    label: "Minor",
    value: 0,
    icon: AlertCircle,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "critical",
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

const ActiveAlarm = () => {
  const [triggerValues, setTriggerValues] = useState<string[]>([]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: dayjs().startOf('day').toDate(),
    to: dayjs().endOf('day').toDate()
  });
  const [downloadDate, setDownloadDate] = useState<DateRange | undefined>({
    from: dayjs().startOf('day').toDate(),
    to: dayjs().endOf('day').toDate()
  });

  return (
    <div className="h-screen">
      <h4 className="text-sm font-semibold">Active Alarm</h4>
      <div className=" grid grid-cols-2 my-8 ">
        <div className="flex flex-wrap gap-3">
          {alarmSummary.map((item) => (
            <Card
              key={item.id}
              className="  min-w-30 px-2 border border-border bg-card  py-2 shadow-none"
            >
           <div className=" flex items-center gap-2">
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
                  {item.value}
                </span>
              </div>
           </div>
            </Card>
          ))}
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
            
            <div className=" space-y-2" >
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
            <DatePickerWithRange date={downloadDate} setDate={setDownloadDate} />
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
        <div className="border-b grid grid-cols-8 gap-2 last:border-b-0">
          <div className="border-r pl-2 py-2">Device Name</div>
          <div className="border-r py-2">Trigger Name</div>
          <div className="border-r py-2">Site Type</div>
          <div className="border-r py-2 col-span-2">Alarm Generate Time</div>
          <div className="border-r py-2">Alarm State</div>
          <div className="border-r py-2">Alarm Type</div>
          <div className=" text-end pr-2 py-2">Duration</div>
        </div>
        {fakeAlarm.map((item, idx) => (
          <div
            key={idx}
            className=" border-b grid grid-cols-8 gap-2 last:border-b-0"
          >
            <div className=" border-r pl-2 py-2">{item.name}</div>
            <div className="border-r py-2">{item.triiger}</div>
            <div className="border-r py-2">{item.site_type}</div>
            <div className="border-r py-2 col-span-2">{item.time}</div>
            <div className="border-r py-2">
              <Badge>{item.state}</Badge>
            </div>
            <div className="border-r py-2">
              <Badge
                className={
                  item.type == "Online" ? "bg-green-600" : "bg-red-600"
                }
              >
                {item.type}
              </Badge>
            </div>
            <div className=" text-end pr-2 py-2">{item.duration}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveAlarm;
