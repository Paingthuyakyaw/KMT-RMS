import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MultiSelectFilterDropdown } from "@/components/multi-select-filter-dropdown";
import { DatePickerWithRange } from "@/components/date-range";
import type { DateRange } from "react-day-picker";
import dayjs from "dayjs";
import { Download, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { downloadCsv } from "@/lib/csv";
import {
  LOG_DEMO_ROWS,
  LOG_LEAF_COLUMN_KEYS,
  LogTable,
} from "./components/table";

export function LogComponent() {
  const [deviceQuery, setDeviceQuery] = useState("");
  const [deviceValues, setDeviceValues] = useState<string[]>([]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: dayjs().startOf("day").toDate(),
    to: dayjs().endOf("day").toDate(),
  });
  const [downloadDate, setDownloadDate] = useState<DateRange | undefined>({
    from: dayjs().startOf("day").toDate(),
    to: dayjs().endOf("day").toDate(),
  });

  const deviceOptions = useMemo(
    () =>
      Array.from(new Set(LOG_DEMO_ROWS.map((r) => String(r.deviceName)))).map(
        (v) => ({ label: v, value: v }),
      ),
    [],
  );

  const filteredRows = useMemo(() => {
    return LOG_DEMO_ROWS.filter((r) => {
      const name = String(r.deviceName ?? "");
      if (deviceQuery && !name.toLowerCase().includes(deviceQuery.toLowerCase()))
        return false;
      if (deviceValues.length > 0 && !deviceValues.includes(name)) return false;
      return true;
    });
  }, [deviceQuery, deviceValues]);

  const csvColumns = useMemo(
    () =>
      LOG_LEAF_COLUMN_KEYS.map((k) => ({
        key: k,
        label: k,
      })),
    [],
  );

  return (
    <div className="h-screen">
      <h4 className="font-semibold">Device Detail Log</h4>

      <div className="mt-5 text-sm overflow-hidden border border-border bg-card ">
        <div className="flex items-center justify-between border-b bg-muted/60 px-3 py-2">
          <span className="text-sm font-medium text-muted-foreground">
            Device log table
          </span>

          <div className="flex items-center gap-2">
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
                      <Input
                        placeholder="Enter Device Name"
                        value={deviceQuery}
                        onChange={(e) => setDeviceQuery(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Date Range</Label>
                      <DatePickerWithRange date={date} setDate={setDate} />
                    </div>

                    <MultiSelectFilterDropdown
                      label="Device List"
                      placeholder="Select devices"
                      options={deviceOptions}
                      values={deviceValues}
                      onChange={setDeviceValues}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() => {
                        setDeviceQuery("");
                        setDeviceValues([]);
                      }}
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
                    <Button
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() => {
                        const from =
                          downloadDate?.from
                            ? dayjs(downloadDate.from).format("YYYY-MM-DD")
                            : "all";
                        const to =
                          downloadDate?.to
                            ? dayjs(downloadDate.to).format("YYYY-MM-DD")
                            : "all";
                        downloadCsv({
                          filename: `device-log_${from}_${to}.csv`,
                          columns: csvColumns,
                          rows: filteredRows,
                        });
                      }}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="">
          <LogTable rows={filteredRows} />
        </div>
      </div>
    </div>
  );
}