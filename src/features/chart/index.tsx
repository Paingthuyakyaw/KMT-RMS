import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import dayjs from "dayjs";
import { Filter, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePickerWithRange } from "@/components/date-range";
import type { DateRange } from "react-day-picker";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  ChartContainer,
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

type BackendSeriesResponse = {
  date_rows: string[];
  data_rows: string[];
};

type BackendChartResponse = Partial<Record<SeriesKey, BackendSeriesResponse>>;

type ChartRow = {
  ts: number;
} & Partial<Record<SeriesKey, number>>;

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

/**
 * Demo backend response
 * တကယ် API ခေါ်တဲ့အခါ ဒီ object နေရာမှာ api response ထည့်လိုက်ရုံ
 */
const mockApiResponse: BackendChartResponse = {
  battVoltage: {
    date_rows: [
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56",
        "2026-01-08 10:13:56"
    ],
    data_rows: [
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4",
        "53.4"
    ]
},
  battCurrent: {
    date_rows: [
      "2026-03-22 00:00:00",
      "2026-03-22 01:00:00",
      "2026-03-22 02:00:00",
      "2026-03-22 03:00:00",
      "2026-03-22 04:00:00",
      "2026-03-22 05:00:00",
      "2026-03-22 06:00:00",
      "2026-03-22 07:00:00",
      "2026-03-22 08:00:00",
      "2026-03-22 09:00:00",
      "2026-03-22 10:00:00",
      "2026-03-22 11:00:00",
      "2026-03-22 12:00:00",
      "2026-03-22 13:00:00",
      "2026-03-22 14:00:00",
    ],
    data_rows: [
      "10.1",
      "10.5",
      "10.3",
      "10.2",
      "10.6",
      "10.8",
      "10.4",
      "10.1",
      "9.8",
      "9.6",
      "9.9",
      "10.2",
      "10.3",
      "10.6",
      "10.7",
    ],
  },
  roomTemp: {
    date_rows: [
      "2026-03-22 00:00:00",
      "2026-03-22 01:00:00",
      "2026-03-22 02:00:00",
      "2026-03-22 03:00:00",
      "2026-03-22 04:00:00",
      "2026-03-22 05:00:00",
      "2026-03-22 06:00:00",
      "2026-03-22 07:00:00",
      "2026-03-22 08:00:00",
      "2026-03-22 09:00:00",
      "2026-03-22 10:00:00",
      "2026-03-22 11:00:00",
      "2026-03-22 12:00:00",
      "2026-03-22 13:00:00",
      "2026-03-22 14:00:00",
    ],
    data_rows: [
      "26.2",
      "26.0",
      "25.9",
      "25.8",
      "25.7",
      "25.9",
      "26.4",
      "27.1",
      "27.8",
      "28.2",
      "28.4",
      "28.3",
      "28.0",
      "27.6",
      "27.2",
    ],
  },
  soc: {
    date_rows: [
      "2026-03-22 00:00:00",
      "2026-03-22 01:00:00",
      "2026-03-22 02:00:00",
      "2026-03-22 03:00:00",
      "2026-03-22 04:00:00",
      "2026-03-22 05:00:00",
      "2026-03-22 06:00:00",
      "2026-03-22 07:00:00",
      "2026-03-22 08:00:00",
      "2026-03-22 09:00:00",
      "2026-03-22 10:00:00",
      "2026-03-22 11:00:00",
      "2026-03-22 12:00:00",
      "2026-03-22 13:00:00",
      "2026-03-22 14:00:00",
    ],
    data_rows: [
      "78",
      "78",
      "77",
      "77",
      "76",
      "76",
      "75",
      "75",
      "74",
      "74",
      "73",
      "73",
      "72",
      "72",
      "71",
    ],
  },
  tenant2Load: {
    date_rows: [
      "2026-03-22 00:00:00",
      "2026-03-22 01:00:00",
      "2026-03-22 02:00:00",
      "2026-03-22 03:00:00",
      "2026-03-22 04:00:00",
      "2026-03-22 05:00:00",
      "2026-03-22 06:00:00",
      "2026-03-22 07:00:00",
      "2026-03-22 08:00:00",
      "2026-03-22 09:00:00",
      "2026-03-22 10:00:00",
      "2026-03-22 11:00:00",
      "2026-03-22 12:00:00",
      "2026-03-22 13:00:00",
      "2026-03-22 14:00:00",
    ],
    data_rows: [
      "0.20",
      "0.25",
      "0.30",
      "0.31",
      "0.29",
      "0.40",
      "0.50",
      "0.60",
      "0.58",
      "0.54",
      "0.59",
      "0.63",
      "0.57",
      "0.49",
      "0.45",
    ],
  },
  engineFQ: {
    date_rows: [
      "2026-03-22 00:00:00",
      "2026-03-22 01:00:00",
      "2026-03-22 02:00:00",
      "2026-03-22 03:00:00",
      "2026-03-22 04:00:00",
      "2026-03-22 05:00:00",
      "2026-03-22 06:00:00",
      "2026-03-22 07:00:00",
      "2026-03-22 08:00:00",
      "2026-03-22 09:00:00",
      "2026-03-22 10:00:00",
      "2026-03-22 11:00:00",
      "2026-03-22 12:00:00",
      "2026-03-22 13:00:00",
      "2026-03-22 14:00:00",
    ],
    data_rows: [
      "49.2",
      "49.3",
      "49.2",
      "49.4",
      "49.5",
      "49.6",
      "49.5",
      "49.6",
      "49.7",
      "49.6",
      "49.5",
      "49.6",
      "49.4",
      "49.5",
      "49.6",
    ],
  },
};

function parseDateToTs(value: string) {
  const parsed = dayjs(value);
  if (parsed.isValid()) return parsed.valueOf();

  const fallback = dayjs(value.replace(" ", "T"));
  return fallback.isValid() ? fallback.valueOf() : NaN;
}

function transformBackendData(
  apiData: BackendChartResponse,
  selectedKeys: SeriesKey[],
): ChartRow[] {
  const rowMap = new Map<number, ChartRow>();

  for (const key of selectedKeys) {
    const series = apiData[key];
    if (!series) continue;

    const maxLength = Math.min(series.date_rows.length, series.data_rows.length);

    for (let i = 0; i < maxLength; i++) {
      const ts = parseDateToTs(series.date_rows[i]);
      const value = Number(series.data_rows[i]);

      if (!Number.isFinite(ts) || !Number.isFinite(value)) continue;

      const existing = rowMap.get(ts) ?? { ts };
      existing[key] = value;
      rowMap.set(ts, existing);
    }
  }

  return Array.from(rowMap.values()).sort((a, b) => a.ts - b.ts);
}

export default function ChartPage({ chartId }: { chartId?: string }) {
  const [refreshNonce, setRefreshNonce] = useState(0);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
    from: dayjs().subtract(1, "day").startOf("day").toDate(),
    to: dayjs().endOf("day").toDate(),
  }));

  const defaultSelectedKeys = useMemo<SeriesKey[]>(() => {
    const id = Number(chartId ?? "0");
    return id % 2 === 0
      ? ["battVoltage", "tenant2Load", "engineFQ", "gensetL1V"]
      : ["battVoltage", "battCurrent", "roomTemp", "soc"];
  }, [chartId]);

  const [selectedKeys, setSelectedKeys] =
    useState<SeriesKey[]>(defaultSelectedKeys);

  const apiData = useMemo(() => {
    // တကယ် api ခေါ်ရင် refreshNonce ကို refetch trigger အဖြစ်သုံး
    return mockApiResponse;
  }, [refreshNonce]);

  const selectedSeries = useMemo(() => {
    return selectedKeys.map((key, idx) => {
      const meta = seriesMeta.find((item) => item.key === key)!;
      return {
        key,
        label: meta.label,
        color: seriesColors[idx % seriesColors.length],
      };
    });
  }, [selectedKeys]);

  const chartConfig = useMemo(() => {
    return Object.fromEntries(
      selectedSeries.map((item) => [
        item.key,
        {
          label: item.label,
          color: item.color,
        },
      ]),
    ) as ChartConfig;
  }, [selectedSeries]);

  const rawChartData = useMemo(() => {
    return transformBackendData(apiData, selectedKeys);
  }, [apiData, selectedKeys]);

  const filteredChartData = useMemo(() => {
    const fromTs = dateRange?.from
      ? dayjs(dateRange.from).startOf("day").valueOf()
      : -Infinity;

    const toTs = dateRange?.to
      ? dayjs(dateRange.to).endOf("day").valueOf()
      : Infinity;

    return rawChartData.filter((row) => row.ts >= fromTs && row.ts <= toTs);
  }, [rawChartData, dateRange]);

  const selectedCount = selectedKeys.length;

  const yDomain = useMemo<[number, number]>(() => {
    const values = filteredChartData.flatMap((row) =>
      selectedKeys
        .map((key) => row[key])
        .filter((value): value is number => typeof value === "number"),
    );

    if (!values.length) return [0, 100];

    const min = Math.min(...values);
    const max = Math.max(...values);

    if (min === max) return [Math.floor(min - 10), Math.ceil(max + 10)];

    const padding = (max - min) * 0.1;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [filteredChartData, selectedKeys]);

  const xTickInterval = useMemo(() => {
    if (filteredChartData.length <= 8) return 0;
    return Math.ceil(filteredChartData.length / 8);
  }, [filteredChartData.length]);

  const onToggle = (key: SeriesKey) => {
    setSelectedKeys((prev) => {
      const exists = prev.includes(key);

      if (exists) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== key);
      }

      return [...prev, key];
    });
  };

  const TooltipContent = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ dataKey?: string; value?: number | string }>;
    label?: number | string;
  }) => {
    if (!active || !payload?.length) return null;

    const ts = typeof label === "number" ? label : Number(label);

    

    return (
      <div className="grid min-w-44 gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-xl">
        <div className="font-medium">
          {Number.isFinite(ts) ? dayjs(ts).format("YYYY-MM-DD HH:mm:ss") : "--"}
        </div>

        <div className="space-y-1">
          {payload.map((item, idx) => {
            const key = String(item.dataKey ?? "");
            const meta = selectedSeries.find((series) => series.key === key);

            if (!meta) return null;

            const value =
              typeof item.value === "number"
                ? item.value
                : Number(item.value ?? NaN);

            if (!Number.isFinite(value)) return null;

            return (
              <div key={`${key}-${idx}`} className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                <span className="text-muted-foreground">{meta.label}</span>
                <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
                  {value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const yTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  return (
    <div className="h-screen overflow-hidden">
      <div className="flex h-full flex-col px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h4 className="truncate font-semibold">Device Detail Graph</h4>
            <div className="text-xs text-muted-foreground">
              Device Detail &gt; Graph
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setRefreshNonce((n) => n + 1)}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-3" align="end">
                <Label className="text-xs font-medium text-muted-foreground">
                  Date Range
                </Label>

                <div className="mt-3">
                  <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="mt-5 flex-1 overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-2">
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

            <div className="flex flex-1 flex-col overflow-hidden p-3">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex flex-row items-center gap-3 px-1 py-3">
                  {seriesMeta.map((series, idx) => {
                    const selected = selectedKeys.includes(series.key);
                    const color = seriesColors[idx % seriesColors.length];

                    return (
                      <button
                        key={series.key}
                        type="button"
                        onClick={() => onToggle(series.key)}
                        className="inline-flex items-center rounded-xl border border-border bg-card px-4 py-2 text-sm transition-all"
                        style={{
                          outline: selected
                            ? `2px solid ${color}`
                            : "2px solid transparent",
                          outlineOffset: 2,
                        }}
                      >
                        <span
                          className="mr-2 inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {series.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>

              <div className="mt-3 flex-1 overflow-hidden rounded-xl border border-border bg-muted/30 p-3">
                <ChartContainer
                  config={chartConfig}
                  className="h-full w-full"
                  id="device-detail-graph"
                >
                  <LineChart
                    accessibilityLayer
                    data={filteredChartData}
                    margin={{ top: 10, right: 16, left: 6, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="2 2" vertical={false} />

                <YAxis
  tickLine={false}
  axisLine={false}
  tickMargin={8}
  width={40}
  domain={[0, 100]}
  ticks={yTicks}
  allowDecimals={false}
/>

                    <XAxis
                      dataKey="ts"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={14}
                      minTickGap={24}
                      interval={xTickInterval}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                      tickFormatter={(value) =>
                        dayjs(Number(value)).format("MM-DD HH:mm")
                      }
                    />

                    <Tooltip content={<TooltipContent />} />

                    {selectedSeries.map((series) => (
                      <Line
                        key={series.key}
                        type="monotone"
                        dataKey={series.key}
                        stroke={`var(--color-${series.key})`}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                        isAnimationActive={false}
                      />
                    ))}
                  </LineChart>
                </ChartContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}