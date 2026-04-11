import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { DatePickerWithRange } from "@/components/date-range";
import type { DateRange } from "react-day-picker";
import { Download, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  civilYmdLocalCalendar,
  dateRangeToApiDates,
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
import { useTweLog } from "@/store/server/log/query";
import useDebounce from "@/hooks/use-debounce";
import { useDeviceListSearch } from "@/store/server/device/query";
import type { Device } from "@/store/server/dashboard/typed";
import { Spinner } from "@/components/ui/spinner";
import { formatTimestampInTz, getFormatDate } from "@/lib/get-format-date";

const leafColumns = [
  { key: "siteName", label: "Site Name" },
  { key: "startTime", label: "Start Time" },
  { key: "endTime", label: "End Time" },
  { key: "periodDays", label: "Period (Days)" },
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
  { key: "avgLoadWT1", label: "Tenant1" },
  { key: "avgLoadWT2", label: "Tenant2" },
  { key: "avgLoadWT3", label: "Tenant3" },
  { key: "avgLoadWT4", label: "Tenant4" },
  { key: "avgLoadAT1", label: "Tenant1" },
  { key: "avgLoadAT2", label: "Tenant2" },
  { key: "avgLoadAT3", label: "Tenant3" },
  { key: "avgLoadAT4", label: "Tenant4" },
  { key: "avgBatteryVoltage", label: "Average Battery Voltage" },
] as const;

type LoadRow = Record<(typeof leafColumns)[number]["key"], string | number | "-">;

function defaultDateRange(): DateRange {
  return defaultDateRangeInTz(useTimezoneStore.getState().timeZoneId);
}

function deviceOptionStub(rms_device_id: number, name: string): Device {
  return {
    id: 0,
    name,
    device_id: 0,
    rms_device_id,
    last_active_alarm: "",
    last_update_time: "",
    source_type: "",
    status: false,
    alarm_status: false,
    external_url: "",
    access_device_url: false,
    project_name: "",
    power_source: "",
    battery_backup_value: "",
    rms_name: "",
    rms_name_label: "",
    json: [],
  };
}

const round2OrDash = (value: unknown): number | "-" => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return Math.round(n * 100) / 100;
};

/** Tenant kWh JSON: keys are epoch seconds, values are meter readings — sort by key. */
const startEndFromTenantKwhJson = (
  value: unknown,
): { start: number | "-"; end: number | "-" } => {
  if (typeof value === "number" && Number.isFinite(value)) {
    const v = round2OrDash(value);
    return { start: v, end: v };
  }
  if (typeof value !== "string") return { start: "-", end: "-" };
  const trimmed = value.trim();
  if (!trimmed) return { start: "-", end: "-" };
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const entries = Object.entries(parsed as Record<string, unknown>)
        .map(([k, val]) => ({ k: Number(k), v: Number(val) }))
        .filter((x) => Number.isFinite(x.k) && Number.isFinite(x.v));
      if (!entries.length) return { start: "-", end: "-" };
      entries.sort((a, b) => a.k - b.k);
      return {
        start: round2OrDash(entries[0]!.v),
        end: round2OrDash(entries[entries.length - 1]!.v),
      };
    }
  } catch {
    const n = Number(trimmed);
    if (Number.isFinite(n)) {
      const v = round2OrDash(n);
      return { start: v, end: v };
    }
  }
  return { start: "-", end: "-" };
};

const scalarMetric = (value: unknown): number | "-" => {
  if (value == null) return "-";
  if (typeof value === "number") return round2OrDash(value);
  const s = String(value).trim();
  if (!s) return "-";
  if (
    (s.startsWith("{") && s.endsWith("}")) ||
    (s.startsWith("[") && s.endsWith("]"))
  ) {
    try {
      const parsed = JSON.parse(s) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const vals = Object.values(parsed as Record<string, unknown>)
          .map((x) => Number(x))
          .filter((n) => Number.isFinite(n));
        if (vals.length) return round2OrDash(vals[vals.length - 1]!);
      }
    } catch {
      // fall through
    }
  }
  const n = Number(s);
  return Number.isFinite(n) ? round2OrDash(n) : "-";
};

function pickPrimaryTenantKwhJson(row: any): string {
  const keys = [
    "tenant_2_kwh",
    "tenant_1_kwh",
    "tenant_3_kwh",
    "tenant_4_kwh",
  ] as const;
  for (const k of keys) {
    const v = row?.[k];
    const t = v != null ? String(v).trim() : "";
    if (t && t !== "{}" && t !== " ") return t;
  }
  return "";
}

function pickMergedMetric(
  a: string | number | "-",
  b: string | number | "-",
): string | number | "-" {
  if (b !== "-") return b;
  return a;
}

const diffFromStartEnd = (
  start: string | number | "-",
  end: string | number | "-",
): number | "-" => {
  if (start === "-" || end === "-") return "-";
  const a = Number(start);
  const b = Number(end);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return "-";
  return round2OrDash(b - a);
};

const toDateMs = (value: unknown): number | null => {
  if (typeof value !== "string" || !value.trim()) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
};

const computePeriodDays = (from: unknown, to: unknown): number | "-" => {
  const fromMs = toDateMs(from);
  const toMs = toDateMs(to);
  if (fromMs == null || toMs == null || toMs < fromMs) return "-";
  return round2OrDash((toMs - fromMs) / (1000 * 60 * 60 * 24));
};

const pickNumber = (...values: unknown[]): number | "-" => {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return "-";
};

const rowCreateDate = (row: any): string =>
  String(row?.create_date_mmtz ?? row?.create_date ?? "");

const mapApiRowToLoadRow = (row: any, timeZoneId: string): LoadRow => {
  const t1 = startEndFromTenantKwhJson(row?.tenant_1_kwh);
  const t2 = startEndFromTenantKwhJson(row?.tenant_2_kwh);
  const t3 = startEndFromTenantKwhJson(row?.tenant_3_kwh);
  const t4 = startEndFromTenantKwhJson(row?.tenant_4_kwh);
  const lastFallback = row?.last_updated_at ?? row?.last_time ?? "";
  const endFromJson = getFormatDate(
    row?.tenant_1_kwh,
    row?.tenant_2_kwh,
    lastFallback,
    timeZoneId,
  );
  const startRaw = row?.create_date_mmtz ?? row?.create_date ?? "";
  return {
    siteName:
      row?.rms_name_label ??
      row?.rms_name ??
      row?.site_name ??
      row?.device_name ??
      String(row?.device_id ?? "-"),
    startTime: formatTimestampInTz(startRaw, timeZoneId) || "-",
    endTime:
      endFromJson ||
      formatTimestampInTz(lastFallback, timeZoneId) ||
      "-",
    periodDays: row?.period_days ?? row?.period ?? "-",
    t1Start: t1.start,
    t1End: t1.end,
    t1KwhPerDay: diffFromStartEnd(t1.start, t1.end),
    t2Start: t2.start,
    t2End: t2.end,
    t2KwhPerDay: diffFromStartEnd(t2.start, t2.end),
    t3Start: t3.start,
    t3End: t3.end,
    t3KwhPerDay: diffFromStartEnd(t3.start, t3.end),
    t4Start: t4.start,
    t4End: t4.end,
    t4KwhPerDay: diffFromStartEnd(t4.start, t4.end),
    avgLoadWT1: scalarMetric(row?.tenant_1_w),
    avgLoadWT2: scalarMetric(row?.tenant_2_w),
    avgLoadWT3: scalarMetric(row?.tenant_3_w),
    avgLoadWT4: scalarMetric(row?.tenant_4_w),
    avgLoadAT1: scalarMetric(row?.tenant_1_a_value ?? row?.tenant_1_a),
    avgLoadAT2: scalarMetric(row?.tenant_2_a),
    avgLoadAT3: scalarMetric(row?.tenant_3_a),
    avgLoadAT4: scalarMetric(row?.tenant_4_a),
    avgBatteryVoltage: scalarMetric(row?.batt_voltage_v),
  };
};

const toCellDisplay = (value: unknown): string => {
  if (value === "-" || value == null) return "";
  return String(value);
};

const buildLoadRows = (
  data: unknown,
  appliedDeviceName: string | undefined,
  timeZoneId: string,
): LoadRow[] => {
  if (!Array.isArray(data)) return [];
  const sorted = [...data].sort((a: any, b: any) =>
    rowCreateDate(a).localeCompare(rowCreateDate(b)),
  );
  if (sorted.length >= 2) {
    const firstRaw = sorted[0];
    const secondRaw = sorted[1];
    const first = mapApiRowToLoadRow(firstRaw, timeZoneId);
    const second = mapApiRowToLoadRow(secondRaw, timeZoneId);
    const mergedEndTime = getFormatDate(
      pickPrimaryTenantKwhJson(firstRaw),
      pickPrimaryTenantKwhJson(secondRaw),
      secondRaw?.last_updated_at ?? secondRaw?.last_time,
      timeZoneId,
    );
    const startRaw = rowCreateDate(firstRaw);
    const endRaw = rowCreateDate(secondRaw);
    return [
      {
        ...second,
        siteName: appliedDeviceName?.trim() || second.siteName,
        startTime: formatTimestampInTz(startRaw, timeZoneId) || "-",
        endTime:
          mergedEndTime ||
          formatTimestampInTz(
            secondRaw?.last_updated_at ?? secondRaw?.last_time,
            timeZoneId,
          ) ||
          "-",
        periodDays: computePeriodDays(startRaw, endRaw),
        t1Start: first.t1Start,
        t1End: second.t1End,
        t1KwhPerDay: pickNumber(
          diffFromStartEnd(first.t1Start, second.t1End),
          second.t1KwhPerDay,
          first.t1KwhPerDay,
        ),
        t2Start: first.t2Start,
        t2End: second.t2End,
        t2KwhPerDay: pickNumber(
          diffFromStartEnd(first.t2Start, second.t2End),
          second.t2KwhPerDay,
          first.t2KwhPerDay,
        ),
        t3Start: first.t3Start,
        t3End: second.t3End,
        t3KwhPerDay: pickNumber(
          diffFromStartEnd(first.t3Start, second.t3End),
          second.t3KwhPerDay,
          first.t3KwhPerDay,
        ),
        t4Start: first.t4Start,
        t4End: second.t4End,
        t4KwhPerDay: pickNumber(
          diffFromStartEnd(first.t4Start, second.t4End),
          second.t4KwhPerDay,
          first.t4KwhPerDay,
        ),
        avgLoadWT1: pickMergedMetric(first.avgLoadWT1, second.avgLoadWT1),
        avgLoadWT2: pickMergedMetric(first.avgLoadWT2, second.avgLoadWT2),
        avgLoadWT3: pickMergedMetric(first.avgLoadWT3, second.avgLoadWT3),
        avgLoadWT4: pickMergedMetric(first.avgLoadWT4, second.avgLoadWT4),
        avgLoadAT1: pickMergedMetric(first.avgLoadAT1, second.avgLoadAT1),
        avgLoadAT2: pickMergedMetric(first.avgLoadAT2, second.avgLoadAT2),
        avgLoadAT3: pickMergedMetric(first.avgLoadAT3, second.avgLoadAT3),
        avgLoadAT4: pickMergedMetric(first.avgLoadAT4, second.avgLoadAT4),
        avgBatteryVoltage: pickMergedMetric(
          first.avgBatteryVoltage,
          second.avgBatteryVoltage,
        ),
      },
    ];
  }
  return sorted.map((item) => {
    const mapped = mapApiRowToLoadRow(item, timeZoneId);
    return { ...mapped, siteName: appliedDeviceName?.trim() || mapped.siteName };
  });
};

export default function LoadConsumption() {
  const timeZoneId = useTimezoneStore((s) => s.timeZoneId);
  const leafCount = leafColumns.length;
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedDate, setAppliedDate] = useState<DateRange | undefined>(defaultDateRange);
  const [appliedDeviceId, setAppliedDeviceId] = useState<string | undefined>();
  const [appliedDeviceName, setAppliedDeviceName] = useState<string | undefined>();
  const [date, setDate] = useState<DateRange | undefined>(defaultDateRange);
  const [draftDeviceId, setDraftDeviceId] = useState<string | undefined>(undefined);
  const [draftDeviceName, setDraftDeviceName] = useState<string | undefined>(undefined);
  const [deviceSearchInput, setDeviceSearchInput] = useState("");
  const { debounced: debouncedDeviceName } = useDebounce({ value: deviceSearchInput });
  const { data: deviceSearchData, isFetching: deviceSearchLoading } =
    useDeviceListSearch({ name: debouncedDeviceName }, { enabled: filterOpen });
  const [downloadDate, setDownloadDate] = useState<DateRange | undefined>(() =>
    defaultDateRangeInTz(useTimezoneStore.getState().timeZoneId),
  );

  const deviceList = deviceSearchData?.devices ?? [];
  const draftSelectedDevice = useMemo((): Device | null => {
    const raw = draftDeviceId?.trim();
    if (!raw) return null;
    const idNum = Number(raw);
    if (!Number.isFinite(idNum)) return null;
    const fromList = deviceList.find((d) => String(d.rms_device_id) === raw);
    if (fromList) return fromList;
    return deviceOptionStub(idNum, draftDeviceName?.trim() || raw);
  }, [draftDeviceId, draftDeviceName, deviceList]);

  const logPayload = useMemo(() => {
    const { from_date, to_date } = dateRangeToApiDates(appliedDate, timeZoneId);
    return { device_id: appliedDeviceId, from_date, to_date };
  }, [appliedDate, appliedDeviceId, timeZoneId]);
  const { data } = useTweLog(logPayload);

  useEffect(() => {
    const next = defaultDateRangeInTz(timeZoneId);
    queueMicrotask(() => {
      setDate(next);
      setAppliedDate(next);
      setDownloadDate(next);
    });
  }, [timeZoneId]);

  const filteredRows = useMemo(
    () => buildLoadRows(data, appliedDeviceName, timeZoneId),
    [data, appliedDeviceName, timeZoneId],
  );
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
            <Popover
              open={filterOpen}
              onOpenChange={(open) => {
                setFilterOpen(open);
                if (open) {
                  setDate(appliedDate ? { ...appliedDate } : defaultDateRange());
                  setDraftDeviceId(appliedDeviceId);
                  setDraftDeviceName(appliedDeviceName);
                  setDeviceSearchInput(appliedDeviceName ?? "");
                }
              }}
            >
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
              <PopoverContent className="w-72 gap-0 p-3" align="end" sideOffset={8}>
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-semibold leading-none text-foreground">
                    Filter Options
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm" htmlFor="load-device-combobox">
                      Site Name
                    </Label>
                    <Combobox
                      filter={null}
                      items={deviceList}
                      value={draftSelectedDevice}
                      itemToStringLabel={(d) => d.name}
                      itemToStringValue={(d) => String(d.rms_device_id)}
                      isItemEqualToValue={(a, b) =>
                        a.rms_device_id === b.rms_device_id
                      }
                      inputValue={deviceSearchInput}
                      onInputValueChange={(v) => setDeviceSearchInput(v)}
                      onValueChange={(d) => {
                        if (d == null) {
                          setDraftDeviceId(undefined);
                          setDraftDeviceName(undefined);
                          setDeviceSearchInput("");
                          return;
                        }
                        setDraftDeviceId(String(d.rms_device_id));
                        setDraftDeviceName(d.name);
                        setDeviceSearchInput(d.name);
                      }}
                    >
                      <ComboboxInput
                        id="load-device-combobox"
                        placeholder="Search and select device"
                        showClear
                        className="h-9 w-full min-w-0 text-sm"
                      />
                      <ComboboxContent className="w-full">
                        {deviceSearchLoading ? (
                          <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                            <Spinner className="size-3.5" />
                            Loading...
                          </div>
                        ) : (
                          <>
                            <ComboboxEmpty>
                              {debouncedDeviceName.trim().length >= 1
                                ? "No devices found."
                                : "Type to search devices."}
                            </ComboboxEmpty>
                            <ComboboxList>
                              {(device: Device) => (
                                <ComboboxItem key={device.rms_device_id} value={device}>
                                  {device.name}
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                          </>
                        )}
                      </ComboboxContent>
                    </Combobox>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Date Range</Label>
                    <DatePickerWithRange date={date} setDate={setDate} />
                  </div>
                  <div className="flex justify-end gap-2 border-t border-border/70 pt-2.5">
                    <Button
                      variant="outline"
                      className="h-9 px-3 text-sm"
                      type="button"
                      onClick={() => {
                        const next = defaultDateRange();
                        setDate(next);
                        setDraftDeviceId(undefined);
                        setDraftDeviceName(undefined);
                        setDeviceSearchInput("");
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      className="h-9 px-3 text-sm"
                      type="button"
                      onClick={() => {
                        setAppliedDate(date ? { ...date } : defaultDateRange());
                        setAppliedDeviceId(draftDeviceId);
                        setAppliedDeviceName(draftDeviceName);
                        setFilterOpen(false);
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 px-2 text-xs">
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
                    <Button
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() => {
                        const from = downloadDate?.from
                          ? civilYmdLocalCalendar(downloadDate.from)
                          : "all";
                        const to = downloadDate?.to
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
                <TableRow className="sticky bg-neutral-300 hover:bg-neutral-300 dark:hover:bg-muted top-0 z-20 dark:bg-muted">
                  <TableHead scope="col" rowSpan={2} className="px-4 py-3 font-medium border-border sticky left-0 z-10 hover:bg-neutral-300! dark:hover:bg-muted bg-neutral-300 dark:bg-muted text-center" style={{ whiteSpace: "nowrap" }}>Site Name</TableHead>
                  <TableHead scope="col" rowSpan={2} className="px-4 py-3 font-medium border-border" style={{ whiteSpace: "nowrap" }}>Start Time</TableHead>
                  <TableHead scope="col" rowSpan={2} className="px-4 py-3 font-medium border-border" style={{ whiteSpace: "nowrap" }}>End Time</TableHead>
                  <TableHead scope="col" rowSpan={2} className="px-4 py-3 font-medium border-border text-center" style={{ whiteSpace: "nowrap" }}>Period (Days)</TableHead>
                  <TableHead scope="col" colSpan={3} className="px-4 py-3 font-medium border-border text-center" style={{ whiteSpace: "nowrap" }}>Tenant 1</TableHead>
                  <TableHead scope="col" colSpan={3} className="px-4 py-3 font-medium border-border text-center" style={{ whiteSpace: "nowrap" }}>Tenant 2</TableHead>
                  <TableHead scope="col" colSpan={3} className="px-4 py-3 font-medium border-border text-center" style={{ whiteSpace: "nowrap" }}>Tenant 3</TableHead>
                  <TableHead scope="col" colSpan={3} className="px-4 py-3 font-medium border-border text-center" style={{ whiteSpace: "nowrap" }}>Tenant 4</TableHead>
                  <TableHead scope="col" colSpan={4} className="px-4 py-3 font-medium border-border text-center" style={{ whiteSpace: "nowrap" }}>Average Load(W)</TableHead>
                  <TableHead scope="col" colSpan={4} className="px-4 py-3 font-medium border-border text-center" style={{ whiteSpace: "nowrap" }}>Average Load(A)</TableHead>
                  <TableHead scope="col" rowSpan={2} className="px-4 py-3 font-medium border-border text-center" style={{ whiteSpace: "nowrap" }}>Average Battery Voltage</TableHead>
                </TableRow>
                <TableRow className="sticky top-9 z-10 bg-neutral-300 hover:bg-neutral-300 dark:hover:bg-muted dark:bg-muted">
                  {["Tenant 1", "Tenant 2", "Tenant 3", "Tenant 4"].flatMap((t) => [
                    <TableHead key={`${t}-start`} scope="col" className="px-4 py-3 border-border text-center">Start</TableHead>,
                    <TableHead key={`${t}-end`} scope="col" className="px-4 py-3 border-border text-center">End</TableHead>,
                    <TableHead key={`${t}-kwh`} scope="col" className="px-4 py-3 border-border text-center" style={{ whiteSpace: "nowrap" }}>kWH Per Day</TableHead>,
                  ])}
                  {["Tenant1", "Tenant2", "Tenant3", "Tenant4"].map((t) => (
                    <TableHead key={`avgW-${t}`} scope="col" className="px-4 py-3 border-border text-center">{t}</TableHead>
                  ))}
                  {["Tenant1", "Tenant2", "Tenant3", "Tenant4"].map((t) => (
                    <TableHead key={`avgA-${t}`} scope="col" className="px-4 py-3 border-border text-center">{t}</TableHead>
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
                          {toCellDisplay(row[col.key])}
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
