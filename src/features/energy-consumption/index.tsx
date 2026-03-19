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
import dayjs from "dayjs";
import { Download, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { downloadCsv } from "@/lib/csv";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EnergyRow = Record<string, string | number>;

const leafColumns = [
  { key: "siteName", label: "Site Name" },
  { key: "startTime", label: "Start Time" },
  { key: "endTime", label: "End Time" },
  { key: "periodDays", label: "Period (Days)" },

  // DG Run Hours
  { key: "dgRunStart", label: "Start" },
  { key: "dgRunEnd", label: "End" },
  { key: "dgRhPerDay", label: "DGRH Per Day" },
  { key: "dgTotalRunHr", label: "DG Total Run Hr" },

  // Grid Run Hours
  { key: "gridRunStart", label: "Start" },
  { key: "gridRunEnd", label: "End" },
  { key: "gridRhPerDay", label: "Grid RH Per Day" },
  { key: "gridTotalRunHr", label: "Grid Total Run Hr" },

  // Battery Run Hours
  { key: "batteryRunStart", label: "Start" },
  { key: "batteryRunEnd", label: "End" },
  { key: "batteryRhPerDay", label: "Battery RH Per Day" },
  { key: "batteryTotalRunHr", label: "Battery Total Run Hr" },

  // Solar Run Hours
  { key: "solarRunStart", label: "Start" },
  { key: "solarRunEnd", label: "End" },
  { key: "solarRhPerDay", label: "Solar RH Per Day" },
  { key: "solarTotalRunHr", label: "Solar Total Run Hr" },

  // Total run hr
  { key: "totalRunHrPerDays", label: "Total Run Hr per days" },

  // DG kWh
  { key: "dgKwhStart", label: "Start" },
  { key: "dgKwhEnd", label: "End" },
  { key: "dgKwhPerDay", label: "DG KWH Per Day" },

  // Grid kWh
  { key: "gridKwhStart", label: "Start" },
  { key: "gridKwhEnd", label: "End" },
  { key: "gridKwhPerDay", label: "Grid KWH Per Day" },

  // Battery kWh
  { key: "batteryKwhStart", label: "Start" },
  { key: "batteryKwhEnd", label: "End" },
  { key: "batteryKwhPerDay", label: "Battery KWH Per Day" },

  // Solar Generated kWh
  { key: "solarGenKwhStart", label: "Start" },
  { key: "solarGenKwhEnd", label: "End" },
  { key: "solarGenKwhPerDay", label: "Solar KWH Per Day" },

  // Solar Load kWh
  { key: "solarLoadKwhStart", label: "Start" },
  { key: "solarLoadKwhEnd", label: "End" },
  { key: "solarLoadKwhPerDay", label: "Solar Load Per Day" },
] as const;

const demoRows: EnergyRow[] = [
  {
    siteName: "SITE-001-NYC",
    startTime: "2026-03-01",
    endTime: "2026-03-07",
    periodDays: "7",

    dgRunStart: "08:10",
    dgRunEnd: "17:45",
    dgRhPerDay: "3.2",
    dgTotalRunHr: "22.4",

    gridRunStart: "00:00",
    gridRunEnd: "23:59",
    gridRhPerDay: "24.0",
    gridTotalRunHr: "168.0",

    batteryRunStart: "00:20",
    batteryRunEnd: "18:10",
    batteryRhPerDay: "5.1",
    batteryTotalRunHr: "35.7",

    solarRunStart: "06:12",
    solarRunEnd: "18:05",
    solarRhPerDay: "6.0",
    solarTotalRunHr: "42.0",

    totalRunHrPerDays: "78.0",

    dgKwhStart: "01:00",
    dgKwhEnd: "06:00",
    dgKwhPerDay: "120.5",

    gridKwhStart: "00:00",
    gridKwhEnd: "23:00",
    gridKwhPerDay: "880.2",

    batteryKwhStart: "00:30",
    batteryKwhEnd: "17:30",
    batteryKwhPerDay: "210.7",

    solarGenKwhStart: "06:00",
    solarGenKwhEnd: "18:00",
    solarGenKwhPerDay: "540.4",

    solarLoadKwhStart: "06:00",
    solarLoadKwhEnd: "18:00",
    solarLoadKwhPerDay: "460.1",
  },
  {
    siteName: "SITE-002-LAX",
    startTime: "2026-03-08",
    endTime: "2026-03-14",
    periodDays: "7",

    dgRunStart: "09:00",
    dgRunEnd: "16:55",
    dgRhPerDay: "2.8",
    dgTotalRunHr: "19.6",

    gridRunStart: "00:00",
    gridRunEnd: "23:50",
    gridRhPerDay: "23.8",
    gridTotalRunHr: "166.6",

    batteryRunStart: "01:10",
    batteryRunEnd: "19:20",
    batteryRhPerDay: "5.4",
    batteryTotalRunHr: "37.8",

    solarRunStart: "06:20",
    solarRunEnd: "18:40",
    solarRhPerDay: "6.4",
    solarTotalRunHr: "44.8",

    totalRunHrPerDays: "79.2",

    dgKwhStart: "01:10",
    dgKwhEnd: "05:40",
    dgKwhPerDay: "108.3",

    gridKwhStart: "00:10",
    gridKwhEnd: "22:50",
    gridKwhPerDay: "905.6",

    batteryKwhStart: "00:40",
    batteryKwhEnd: "17:10",
    batteryKwhPerDay: "198.4",

    solarGenKwhStart: "06:05",
    solarGenKwhEnd: "18:15",
    solarGenKwhPerDay: "560.0",

    solarLoadKwhStart: "06:05",
    solarLoadKwhEnd: "18:15",
    solarLoadKwhPerDay: "472.5",
  },
];

export default function EnergyConsumption() {
  const [siteQuery, setSiteQuery] = useState("");
  const [siteValues, setSiteValues] = useState<string[]>([]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: dayjs().startOf("day").toDate(),
    to: dayjs().endOf("day").toDate(),
  });
  const [downloadDate, setDownloadDate] = useState<DateRange | undefined>({
    from: dayjs().startOf("day").toDate(),
    to: dayjs().endOf("day").toDate(),
  });

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
      <h4 className="font-semibold">Energy Consumption</h4>

      <div className="mt-5 text-sm overflow-hidden border border-border bg-card ">
        <div className="flex items-center justify-between border-b bg-muted/60 px-3 py-2">
          <span className="text-sm font-medium text-muted-foreground">
            Energy consumption report
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
                            ? dayjs(downloadDate.from).format("YYYY-MM-DD")
                            : "all";
                        const to =
                          downloadDate?.to
                            ? dayjs(downloadDate.to).format("YYYY-MM-DD")
                            : "all";
                        downloadCsv({
                          filename: `energy-consumption_${from}_${to}.csv`,
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
          <div className="min-w-max">
            <Table className="log-table bg-white w-max text-sm table-auto border-collapse dark:bg-muted!">
              <TableHeader className="text-xs uppercase bg-muted">
                {/* Header row 1 (rowspan/colspan groups) */}
                <TableRow className="sticky top-0 z-30 hover:bg-neutral-300 dark:hover:bg-muted bg-neutral-300 dark:bg-muted">
                  <TableHead
                    scope="col"
                    rowSpan={2}
                    className="px-4 py-3 font-medium border-border  sticky left-0 z-10 hover:bg-neutral-300! dark:hover:bg-muted bg-neutral-300 dark:bg-muted text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Site Name
                  </TableHead>
                  <TableHead
                    scope="col"
                    rowSpan={2}
                    className="px-4 py-3 font-medium border-border text-left"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Start Time
                  </TableHead>
                  <TableHead
                    scope="col"
                    rowSpan={2}
                    className="px-4 py-3 font-medium border-border text-left"
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
                    colSpan={4}
                    className="px-4 py-3 font-medium border-border text-center"
                  >
                    DG Run Hours
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={4}
                    className="px-4 py-3 font-medium border-border text-center"
                  >
                    Grid Run Hours
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={4}
                    className="px-4 py-3 font-medium border-border text-center"
                  >
                    Battery Run Hours
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={4}
                    className="px-4 py-3 font-medium border-border text-center"
                  >
                    Solar Run Hours
                  </TableHead>

                  <TableHead
                    scope="col"
                    rowSpan={2}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Total Run Hr per days
                  </TableHead>

                  <TableHead
                    scope="col"
                    colSpan={3}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    DG kWh
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={3}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Grid kWh
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={3}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Battery kWh
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={3}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Solar Generated kWh
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={3}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Solar Load kWh
                  </TableHead>
                </TableRow>

                {/* Header row 2 (leaf columns) */}
                <TableRow className="sticky top-9 hover:bg-neutral-300 dark:hover:bg-muted bg-neutral-300 z-20 dark:bg-muted">
                  {/* DG */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="px-4 py-3 border-border text-center"
                  >
                    DGRH Per Day
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="px-4 py-3 border-border text-center"
                  >
                    DG Total Run Hr
                  </TableHead>

                  {/* Grid */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Grid RH Per Day
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Grid Total Run Hr
                  </TableHead>

                  {/* Battery */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Battery RH Per Day
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Battery Total Run Hr
                  </TableHead>

                  {/* Solar */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Solar RH Per Day
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Solar Total Run Hr
                  </TableHead>

                  {/* DG kWh */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    DG KWH Per Day
                  </TableHead>

                  {/* Grid kWh */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Grid KWH Per Day
                  </TableHead>

                  {/* Battery kWh */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Battery KWH Per Day
                  </TableHead>

                  {/* Solar Generated kWh */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Solar KWH Per Day
                  </TableHead>

                  {/* Solar Load kWh */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Solar Load Per Day
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredRows.map((row, rowIndex) => (
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
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}