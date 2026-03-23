import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/date-range";
import type { DateRange } from "react-day-picker";
import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type SeriesKey =
  | "battVoltage"
  | "battCurrent"
  | "roomTemp"
  | "soc"
  | "tenant2Load"
  | "engineFQ"
  | "gensetL1V"
  | "gensetL2V"
  | "gensetL3V"
  | "gensetL1A"
  | "gensetL2A"
  | "gensetL3A"
  | "gridFQ"
  | "gridL1V"
  | "gridL2V"
  | "gridL3V"
  | "pv1Input"
  | "pv2Input"
  | "pv3Input"
  | "pv4Input"
  | "batteryBackup";

const seriesMeta: Array<{ key: SeriesKey; label: string }> = [
  { key: "battVoltage", label: "Battery_Voltage" },
  { key: "battCurrent", label: "Battery_Current" },
  { key: "roomTemp", label: "Room_Temp" },
  { key: "soc", label: "SOC" },
  { key: "tenant2Load", label: "Operator2_Load" },
  { key: "engineFQ", label: "Generator_Frequency" },
  { key: "gensetL1V", label: "Generator_L1-N_Voltage" },
  { key: "gensetL2V", label: "Generator_L2-N_Voltage" },
  { key: "gensetL3V", label: "Generator_L3-N_Voltage" },
  { key: "gensetL1A", label: "Generator_L1_Current" },
  { key: "gensetL2A", label: "Generator_L2_Current" },
  { key: "gensetL3A", label: "Generator_L3_Current" },
  { key: "gridFQ", label: "Main_Frequency" },
  { key: "gridL1V", label: "Main_L1-N_Voltage" },
  { key: "gridL2V", label: "Main_L2-N_Voltage" },
  { key: "gridL3V", label: "Main_L3-N_Voltage" },
  { key: "pv1Input", label: "PV1_Input_Volt" },
  { key: "pv2Input", label: "PV2_Input_Volt" },
  { key: "pv3Input", label: "PV3_Input_Volt" },
  { key: "pv4Input", label: "PV4_Input_Volt" },
  { key: "batteryBackup", label: "Battery_Voltage2" },
];

const seriesColors = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#a78bfa",
  "#22c55e",
  "#fb7185",
  "#38bdf8",
  "#f472b6",
  "#4ade80",
  "#f59e0b",
  "#93c5fd",
] as const;

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function makeDateTimeSeries(n: number, seed: string) {
  const now = new Date();

  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getTime() - (n - 1 - i) * 86400000);
    const h = hashString(`${seed}-${i}-h`) % 24;
    const m = hashString(`${seed}-${i}-m`) % 60;
    d.setHours(h, m, 0, 0);
    return d.valueOf();
  });
}

const baseRowDemo: Record<SeriesKey, number> = {
  battVoltage: 48,
  battCurrent: 10,
  roomTemp: 22,
  soc: 65,
  tenant2Load: 0.6,
  engineFQ: 49.8,
  gensetL1V: 66,
  gensetL2V: 97,
  gensetL3V: 100,
  gensetL1A: 10,
  gensetL2A: 9.5,
  gensetL3A: 9.8,
  gridFQ: 50,
  gridL1V: 100,
  gridL2V: 99,
  gridL3V: 88,
  pv1Input: 100,
  pv2Input: 60,
  pv3Input: 15,
  pv4Input: 100,
  batteryBackup: 80,
};

const seriesRange: Record<SeriesKey, { min: number; max: number }> = {
  battVoltage: { min: 42, max: 58 },
  battCurrent: { min: 0, max: 30 },
  roomTemp: { min: 18, max: 40 },
  soc: { min: 0, max: 100 },
  tenant2Load: { min: 0, max: 2 },
  engineFQ: { min: 45, max: 55 },
  gensetL1V: { min: 1, max: 100 },
  gensetL2V: { min: 30, max: 100 },
  gensetL3V: { min: 50, max: 70 },
  gensetL1A: { min: 0, max: 50 },
  gensetL2A: { min: 0, max: 50 },
  gensetL3A: { min: 0, max: 50 },
  gridFQ: { min: 45, max: 55 },
  gridL1V: { min: 10, max: 100 },
  gridL2V: { min: 44, max: 90 },
  gridL3V: { min: 100, max: 100 },
  pv1Input: { min: 0, max: 100 },
  pv2Input: { min: 0, max: 100 },
  pv3Input: { min: 0, max: 100 },
  pv4Input: { min: 0, max: 100 },
  batteryBackup: { min: 0, max: 100 },
};

export default function ChartPage({ chartId }: { chartId?: string }) {
  const chartSeed = String(chartId ?? "1");

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
    from: dayjs().subtract(49, "day").startOf("day").toDate(),
    to: dayjs().endOf("day").toDate(),
  }));

  const defaultSelectedKeys = useMemo<SeriesKey[]>(() => {
    const n = Number(chartSeed);
    const isOdd = Number.isNaN(n) ? hashString(chartSeed) % 2 === 1 : n % 2 === 1;

    return isOdd
      ? ["battVoltage", "battCurrent", "roomTemp", "soc"]
      : ["tenant2Load", "engineFQ", "gridFQ", "gensetL1V"];
  }, [chartSeed]);

  const [selectedKeys, setSelectedKeys] = useState<SeriesKey[]>(
    defaultSelectedKeys,
  );

  useEffect(() => {
    setSelectedKeys(defaultSelectedKeys);
  }, [defaultSelectedKeys]);

  const chartX = useMemo(() => makeDateTimeSeries(50, chartSeed), [chartSeed]);

  const filteredChartX = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return chartX;

    const fromTs = dateRange?.from
      ? dayjs(dateRange.from).startOf("day").valueOf()
      : -Infinity;

    const toTs = dateRange?.to
      ? dayjs(dateRange.to).endOf("day").valueOf()
      : Infinity;

    return chartX.filter((ts) => ts >= fromTs && ts <= toTs);
  }, [chartX, dateRange]);

  const [brushRange, setBrushRange] = useState<[number, number] | null>(null);

  useEffect(() => {
    setBrushRange(null);
  }, [filteredChartX, selectedKeys.join("|"), chartSeed]);

  const chartOffset = useMemo(() => (hashString(chartSeed) % 1000) / 1000, [
    chartSeed,
  ]);

  const selectedSeries = useMemo(() => {
    return selectedKeys.map((key, idx) => {
      const meta = seriesMeta.find((s) => s.key === key)!;
      const color = seriesColors[idx % seriesColors.length];
      return { key, label: meta.label, color };
    });
  }, [selectedKeys]);

  const chartConfig = useMemo(() => {
    const entries = selectedSeries.map((s) => [
      s.key,
      { label: s.label, color: s.color },
    ]);
    return Object.fromEntries(entries) as ChartConfig;
  }, [selectedSeries]);

  const chartData = useMemo(() => {
    return filteredChartX.map((ts, i) => {
      const item: Record<string, string | number> = { ts };

      for (const s of selectedSeries) {
        const base = baseRowDemo[s.key] ?? 0;
        const { min, max } = seriesRange[s.key];
        const seed = hashString(`${chartSeed}-${ts}-${s.key}`);
        const rng = mulberry32(seed);
        const t = i / Math.max(1, filteredChartX.length - 1);

        const seasonal =
          Math.sin((i + 1) / 3 + chartOffset) * 0.12 +
          Math.cos((i + 1) / 7 + chartOffset) * 0.06;

        const noise = (rng() - 0.5) * 0.18;
        const trend = (t - 0.5) * 0.08;
        const factor = 0.75 + seasonal + noise + trend;

        const rawValue = base * factor;
        const clampedValue = clamp(rawValue, min, max);

        item[s.key] = Number(clampedValue.toFixed(2));
      }

      return item;
    });
  }, [filteredChartX, selectedSeries, chartSeed, chartOffset]);

  const visibleChartData = useMemo(() => {
    if (!brushRange) return chartData;

    const [start, end] = brushRange;
    const safeStart = Math.max(0, Math.min(start, end));
    const safeEnd = Math.min(chartData.length - 1, Math.max(start, end));

    return chartData.slice(safeStart, safeEnd + 1);
  }, [brushRange, chartData]);

  const onToggle = (key: SeriesKey) => {
    setSelectedKeys((prev) => {
      const exists = prev.includes(key);
      if (exists) return prev.filter((k) => k !== key);
      return [...prev, key];
    });
  };

  const selectedCount = selectedKeys.length;

  const yTicks = useMemo(
    () => Array.from({ length: 11 }, (_, i) => i * 10),
    [],
  );

  const formatTs = (value: unknown) => {
    const ts =
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? Number(value)
          : value instanceof Date
            ? value.getTime()
            : NaN;

    if (!Number.isFinite(ts)) return "--";

    const d = dayjs(ts);
    return d.isValid() ? d.format("YYYY-MM-DD HH:mm") : "--";
  };

  return (
    <div className="h-screen">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h4 className="font-semibold">Chart</h4>

       
          <div className="">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
      </div>

      <div className="mt-5 overflow-hidden border border-border bg-card text-sm">
        <div className="flex items-center justify-between border-b bg-muted/60 px-3 py-2">
          <span className="text-sm font-medium text-muted-foreground">
            Line chart series selection
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setSelectedKeys(defaultSelectedKeys)}
            >
              Reset
            </Button>

            <span className="text-xs text-muted-foreground">
              Selected: {selectedCount}
            </span>
          </div>
        </div>

        <div className="p-3">
          <ScrollArea className="w-full whitespace-nowrap">
            <div
              className="scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 flex flex-row items-center gap-4 overflow-x-auto whitespace-nowrap px-1 py-4"
              style={{ scrollbarColor: "#d1d5db #f3f4f6" }}
            >
              {seriesMeta.map((s, idx) => {
                const selected = selectedKeys.includes(s.key);
                const color = seriesColors[idx % seriesColors.length];

                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => onToggle(s.key)}
                    className="inline-block rounded-xl border border-border bg-card px-4 py-2 transition-all"
                    style={{
                      cursor: "pointer",
                      outline: selected
                        ? `2px solid ${color}`
                        : "2px solid transparent",
                      outlineOffset: 2,
                    }}
                    aria-label={`Toggle ${s.label}`}
                  >
                    <span
                      className="mr-2 inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
            <ChartContainer
              config={chartConfig}
              className="h-[340px] w-full"
              id="chart-page"
            >
              <LineChart
                accessibilityLayer
                data={visibleChartData}
                margin={{ left: 0, right: 12 }}
              >
                <CartesianGrid vertical={false} />

                <YAxis
                  ticks={yTicks}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  domain={[0, 100]}
                  allowDecimals={false}
                />

                <XAxis
                  dataKey="ts"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => formatTs(value)}
                />

                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[210px]"
                      labelFormatter={(value) => formatTs(value)}
                    />
                  }
                />

                {selectedSeries.map((s) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    stroke={`var(--color-${s.key})`}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </div>

          {/* <div className="mt-4">
            <Table className="w-full bg-card text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead>Series</TableHead>
                  <TableHead className="text-center">Key</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {selectedSeries.map((s) => (
                  <TableRow key={s.key}>
                    <TableCell>
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        {s.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{s.key}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div> */}
        </div>
      </div>
    </div>
  );
}