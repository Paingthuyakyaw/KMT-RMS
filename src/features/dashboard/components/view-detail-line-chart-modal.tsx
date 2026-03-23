import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
} from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";

type Candidate = {
  key: string;
  label: string;
};

const seriesColors = [
  "#60a5fa", // blue
  "#34d399", // green
  "#fbbf24", // amber
  "#f87171", // red
  "#a78bfa", // violet
  "#22c55e", // green2
  "#fb7185", // pink
  "#38bdf8", // sky
];

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

function formatTick(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ViewDetailLineChartModal({
  open,
  onClose,
  baseRow,
  candidates,
  defaultKeys,
}: {
  open: boolean;
  onClose: () => void;
  baseRow: Record<string, string | number> | null;
  candidates: Candidate[];
  defaultKeys: string[];
}) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    const defaults = defaultKeys.filter((k) => candidates.some((c) => c.key === k));
    const fallback = candidates.slice(0, 4).map((c) => c.key);
    setSelectedKeys(defaults.length > 0 ? defaults : fallback);
  }, [open, candidates, defaultKeys]);

  const chartX = useMemo(() => {
    const n = 50;
    const now = new Date();
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(now.getTime() - (n - 1 - i) * 86400000);
      // Use ISO for stable parsing in tickFormatter
      return d.toISOString().slice(0, 10);
    });
  }, []);

  const chartSeries = useMemo(() => {
    if (!baseRow) return [];
    const rowSiteId = String(baseRow.siteId ?? "");

    return selectedKeys.map((key, idx) => {
      const numericBase = Number(baseRow[key]);
      const base = Number.isFinite(numericBase)
        ? numericBase
        : 10 + (hashString(`${rowSiteId}-${key}`) % 90);

      const seed = hashString(`${rowSiteId}-${key}`);
      const rng = mulberry32(seed);
      const color = seriesColors[idx % seriesColors.length];

      const values = chartX.map((_, i) => {
        const t = i / (chartX.length - 1);
        const seasonal =
          Math.sin((i + 1) / 3) * 0.12 + Math.cos((i + 1) / 7) * 0.06;
        const noise = (rng() - 0.5) * 0.18;
        const trend = (t - 0.5) * 0.08;
        const factor = 0.75 + seasonal + noise + trend;
        return base * factor;
      });

      return { key, color, values };
    });
  }, [baseRow, selectedKeys, chartX]);

  const chartConfig: ChartConfig = useMemo(() => {
    const cfgEntries: Array<[string, { label: string; color: string }]> =
      selectedKeys.map((k, idx) => {
        const c = candidates.find((x) => x.key === k);
        return [k, { label: c?.label ?? k, color: seriesColors[idx % seriesColors.length] }];
      });
    return Object.fromEntries(cfgEntries) as ChartConfig;
  }, [selectedKeys, candidates]);

  const chartData = useMemo(() => {
    return chartX.map((iso, i) => {
      const entry: Record<string, string | number> = { date: iso };
      for (const s of chartSeries) {
        const v = s.values[i];
        entry[s.key] = Number.isFinite(v) ? Number(v.toFixed(2)) : 0;
      }
      return entry;
    });
  }, [chartX, chartSeries]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Line chart"
    >
      <div className="w-full max-w-7xl overflow-hidden rounded-xl border border-border bg-background">
        <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-3">
          <div>
            <div className="text-sm font-semibold">Line Chart</div>
            <div className="text-xs text-muted-foreground">
              {baseRow ? String(baseRow.siteId ?? "") : "-"}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="p-4">
          {/* Multi-select chips */}
          <div
            className="flex flex-row gap-4 items-center mb-6 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mb-4"
            style={{ scrollbarColor: "#d1d5db #f3f4f6" }}
          >
            {candidates.map((c, idx) => {
              const isSelected = selectedKeys.includes(c.key);
              const color = seriesColors[idx % seriesColors.length];
              return (
                <button
                  key={c.key}
                  type="button"
                  value={c.key}
                  onClick={() => {
                    setSelectedKeys((prev) =>
                      prev.includes(c.key)
                        ? prev.filter((k) => k !== c.key)
                        : [...prev, c.key],
                    );
                  }}
                  className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded shadow inline-block"
                  style={{
                    cursor: "pointer",
                    outline: isSelected ? `2px solid ${color}` : "2px solid transparent",
                    outlineOffset: 2,
                  }}
                >
                  {/* Heroicon: InformationCircle */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke={color}
                    className="w-6 h-6 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 9.75h.008v.008H11.25V9.75zm.75 3v3m-6.364 2.364a9 9 0 1112.728 0 9 9 0 01-12.728 0z"
                    />
                  </svg>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>

          <ChartContainer config={chartConfig} className="h-[340px] w-full" id="view-detail-line-chart">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={formatTick}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[180px]"
                    labelFormatter={(value) => {
                      const d = new Date(String(value));
                      return d.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                  />
                }
              />

              {chartSeries.map((s) => (
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
      </div>
    </div>
  );
}

