import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import { Download, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  civilYmdLocalCalendar,
  defaultDateRangeInTz,
} from "@/lib/app-timezone";
import { useTimezoneStore } from "@/store/client/timezone-store";
import { downloadCsv } from "@/lib/csv";
import { scrollWindowToBottom } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type LoadRow = Record<string, string | number>;

const leafColumns = [
  { key: "siteName", label: "Site Name" },
  { key: "startTime", label: "Start Time" },
  { key: "endTime", label: "End Time" },
  { key: "periodDays", label: "Period (Days)" },

  // Tenant 1..4 (Start/End/kWh Per Day)
  { key: "t1Start", label: "Start" },
  { key: "t1End", label: "End" },
  { key: "t1KwhPerDay", label: "kWH Per Day" },

  { key: "t2Start", label: "Start" },
  { key: "t2End", label: "End" },
  { key: "t2KwhPerDay", label: "kWH Per Day" },

  { key: "t3Start", label: "Start" },
  { key: "t3End", label: "End" },
  { key: "t3KwhPerDay", label: "kWH Per Day" },

  { key: "t4Start", label: "Start" },
  { key: "t4End", label: "End" },
  { key: "t4KwhPerDay", label: "kWH Per Day" },

  // Average Load(W) (Tenant1..4)
  { key: "avgLoadWT1", label: "Tenant1" },
  { key: "avgLoadWT2", label: "Tenant2" },
  { key: "avgLoadWT3", label: "Tenant3" },
  { key: "avgLoadWT4", label: "Tenant4" },

  // Average Load(A) (Tenant1..4)
  { key: "avgLoadAT1", label: "Tenant1" },
  { key: "avgLoadAT2", label: "Tenant2" },
  { key: "avgLoadAT3", label: "Tenant3" },
  { key: "avgLoadAT4", label: "Tenant4" },

  { key: "avgBatteryVoltage", label: "Average Battery Voltage" },
] as const;

const demoRows: LoadRow[] = [
  {
    siteName: "SITE-001-NYC",
    startTime: "2026-03-01",
    endTime: "2026-03-07",
    periodDays: "7",

    t1Start: "0",
    t1End: "840",
    t1KwhPerDay: "120.5",
    t2Start: "0",
    t2End: "840",
    t2KwhPerDay: "98.2",
    t3Start: "0",
    t3End: "840",
    t3KwhPerDay: "75.6",
    t4Start: "0",
    t4End: "840",
    t4KwhPerDay: "61.4",

    avgLoadWT1: "820",
    avgLoadWT2: "690",
    avgLoadWT3: "540",
    avgLoadWT4: "410",
    avgLoadAT1: "17.2",
    avgLoadAT2: "14.5",
    avgLoadAT3: "11.3",
    avgLoadAT4: "8.6",

    avgBatteryVoltage: "48.1",
  },
  {
    siteName: "SITE-002-LAX",
    startTime: "2026-03-08",
    endTime: "2026-03-14",
    periodDays: "7",

    t1Start: "0",
    t1End: "840",
    t1KwhPerDay: "110.3",
    t2Start: "0",
    t2End: "840",
    t2KwhPerDay: "90.0",
    t3Start: "0",
    t3End: "840",
    t3KwhPerDay: "71.5",
    t4Start: "0",
    t4End: "840",
    t4KwhPerDay: "58.8",

    avgLoadWT1: "780",
    avgLoadWT2: "650",
    avgLoadWT3: "520",
    avgLoadWT4: "395",
    avgLoadAT1: "16.4",
    avgLoadAT2: "13.7",
    avgLoadAT3: "10.9",
    avgLoadAT4: "8.2",

    avgBatteryVoltage: "47.8",
  },
];

export default function LoadConsumption() {
  const timeZoneId = useTimezoneStore((s) => s.timeZoneId);
  const leafCount = leafColumns.length;
  const [siteQuery, setSiteQuery] = useState("");
  const [siteValues, setSiteValues] = useState<string[]>([]);
  const [date, setDate] = useState<DateRange | undefined>(() =>
    defaultDateRangeInTz(useTimezoneStore.getState().timeZoneId),
  );
  const [downloadDate, setDownloadDate] = useState<DateRange | undefined>(() =>
    defaultDateRangeInTz(useTimezoneStore.getState().timeZoneId),
  );

  useEffect(() => {
    const next = defaultDateRangeInTz(timeZoneId);
    queueMicrotask(() => {
      setDate(next);
      setDownloadDate(next);
    });
  }, [timeZoneId]);

  const siteOptions = useMemo(
    () =>
      Array.from(new Set(demoRows.map((r) => String(r.siteName)))).map((v) => ({
        label: v,
        value: v,
      })),
    [],
  );

  const filteredRows = useMemo(() => {
    return demoRows.filter((r) => {
      const name = String(r.siteName ?? "");
      if (siteQuery && !name.toLowerCase().includes(siteQuery.toLowerCase()))
        return false;
      if (siteValues.length > 0 && !siteValues.includes(name)) return false;
      return true;
    });
  }, [siteQuery, siteValues]);

  const csvColumns = useMemo(
    () => leafColumns.map((c) => ({ key: c.key, label: c.label })),
    [],
  );

  return (
    <div className=" h-screen">
      <h4 className="font-semibold">Load Consumption</h4>

      <div className="mt-5 text-sm overflow-hidden border border-border bg-card ">
        <div className="flex items-center justify-between border-b bg-muted/60 px-3 py-2">
          <span className="text-sm font-medium text-muted-foreground">
            Load consumption report
          </span>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 px-2 text-xs"
                  onClick={() => scrollWindowToBottom()}
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
                      <Label>Site Name</Label>
                      <Input
                        placeholder="Enter Site Name"
                        value={siteQuery}
                        onChange={(e) => setSiteQuery(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date Range</Label>
                      <DatePickerWithRange date={date} setDate={setDate} />
                    </div>
                    <MultiSelectFilterDropdown
                      label="Site List"
                      placeholder="Select sites"
                      options={siteOptions}
                      values={siteValues}
                      onChange={setSiteValues}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() => {
                        setSiteQuery("");
                        setSiteValues([]);
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
                            ? civilYmdLocalCalendar(downloadDate.from)
                            : "all";
                        const to =
                          downloadDate?.to
                            ? civilYmdLocalCalendar(downloadDate.to)
                            : "all";
                        downloadCsv({
                          filename: `load-consumption_${from}_${to}.csv`,
                          columns: csvColumns as any,
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

        <ScrollArea className=" w-full whitespace-nowrap">
          <div className="min-w-max bg-white">
            <Table className="log-table w-max text-sm table-auto border-collapse bg-muted!">
              <TableHeader className="text-xs uppercase bg-muted">
                {/* Header row 1 */}
                <TableRow className="sticky bg-neutral-300 hover:bg-neutral-300 dark:hover:bg-muted top-0 z-20 dark:bg-muted">
                  <TableHead
                    scope="col"
                    rowSpan={2}
                    className="px-4 py-3 font-medium border-border sticky left-0 z-10 hover:bg-neutral-300! dark:hover:bg-muted bg-neutral-300 dark:bg-muted text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Site Name
                  </TableHead>
                  <TableHead
                    scope="col"
                    rowSpan={2}
                    className="px-4 py-3 font-medium border-border"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Start Time
                  </TableHead>
                  <TableHead
                    scope="col"
                    rowSpan={2}
                    className="px-4 py-3 font-medium border-border"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    End Time
                  </TableHead>
                  <TableHead
                    scope="col"
                    rowSpan={2}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Period (Days)
                  </TableHead>

                  <TableHead
                    scope="col"
                    colSpan={3}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Tenant 1
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={3}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Tenant 2
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={3}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Tenant 3
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={3}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Tenant 4
                  </TableHead>

                  <TableHead
                    scope="col"
                    colSpan={4}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Average Load(W)
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={4}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Average Load(A)
                  </TableHead>

                  <TableHead
                    scope="col"
                    rowSpan={2}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Average Battery Voltage
                  </TableHead>
                </TableRow>

                {/* Header row 2 */}
                <TableRow className="sticky top-9 z-10 bg-neutral-300 hover:bg-neutral-300 dark:hover:bg-muted dark:bg-muted">
                  {/* Tenant 1..4 sub columns */}
                  {["Tenant 1", "Tenant 2", "Tenant 3", "Tenant 4"].flatMap(
                    (t) => [
                      <TableHead
                        key={`${t}-start`}
                        scope="col"
                        className="px-4 py-3 border-border text-center"
                      >
                        Start
                      </TableHead>,
                      <TableHead
                        key={`${t}-end`}
                        scope="col"
                        className="px-4 py-3 border-border text-center"
                      >
                        End
                      </TableHead>,
                      <TableHead
                        key={`${t}-kwh`}
                        scope="col"
                        className="px-4 py-3 border-border text-center"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        kWH Per Day
                      </TableHead>,
                    ],
                  )}

                  {/* Avg Load(W) Tenant1..4 */}
                  {["Tenant1", "Tenant2", "Tenant3", "Tenant4"].map((t) => (
                    <TableHead
                      key={`avgW-${t}`}
                      scope="col"
                      className="px-4 py-3 border-border text-center"
                    >
                      {t}
                    </TableHead>
                  ))}

                  {/* Avg Load(A) Tenant1..4 */}
                  {["Tenant1", "Tenant2", "Tenant3", "Tenant4"].map((t) => (
                    <TableHead
                      key={`avgA-${t}`}
                      scope="col"
                      className="px-4 py-3 border-border text-center"
                    >
                      {t}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {leafColumns.map((col) => (
                        <TableCell
                          key={col.key}
                          className={
                            col.key === "siteName"
                              ? "sticky left-0 z-10 bg-muted text-center"
                              : "text-center"
                          }
                          style={{ whiteSpace: "nowrap" }}
                        >
                          {String(row[col.key] ?? "-")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={leafCount}
                      className="text-center py-6 text-sm text-muted-foreground"
                    >
                      No data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}