import type { Device } from "@/store/server/dashboard/typed";
import type { EnergyRow } from "./types";

export function deviceOptionStub(rms_device_id: number, name: string): Device {
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

const parseTimelineValues = (value: unknown): number[] => {
  if (typeof value === "number" && Number.isFinite(value)) return [value];
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.values(parsed as Record<string, unknown>)
        .map((v) => Number(v))
        .filter((n) => Number.isFinite(n));
    }
  } catch {
    const asNumber = Number(trimmed);
    return Number.isFinite(asNumber) ? [asNumber] : [];
  }
  return [];
};

const startEndFromTimeline = (
  value: unknown,
): { start: number | "-"; end: number | "-" } => {
  const values = parseTimelineValues(value);
  if (!values.length) return { start: "-", end: "-" };
  return {
    start: round2OrDash(values[0]),
    end: round2OrDash(values[values.length - 1]),
  };
};

const diffFromStartEnd = (start: number | "-", end: number | "-"): number | "-" => {
  if (start === "-" || end === "-") return "-";
  return round2OrDash(Number(end) - Number(start));
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

const toNumberOrDashFromValue = (value: unknown): number | "-" => {
  const n = Number(value);
  return Number.isFinite(n) ? n : "-";
};

const sumOrDash = (...values: Array<number | "-">): number | "-" => {
  if (values.some((v) => v === "-")) return "-";
  return round2OrDash(values.reduce((acc: number, n) => acc + Number(n), 0));
};

const pickNumber = (...values: Array<unknown>): number | "-" => {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return "-";
};

const mapApiRowToEnergyRow = (row: any): EnergyRow => {
  const dgRh = startEndFromTimeline(row?.dgrh);
  const gridRhPerDay = round2OrDash(row?.grid_run_time_hrs);
  const batteryRhPerDay = round2OrDash(row?.batt_run_time_hrs);
  const solarRhPerDay = round2OrDash(row?.daily_generated_hour);
  const dgKwh = startEndFromTimeline(row?.gunset_kwh);
  const gridKwh = startEndFromTimeline(row?.grid_kwh);
  const batteryKwh = startEndFromTimeline(row?.battery_kwh);
  const solarGeneratedKwh = startEndFromTimeline(row?.daily_generated_energy);
  const solarLoadKwh = startEndFromTimeline(row?.daily_load_energy);
  const dgTotalRunHr = diffFromStartEnd(dgRh.start, dgRh.end);
  const totalRunHrPerDays =
    [dgTotalRunHr, gridRhPerDay, batteryRhPerDay, solarRhPerDay].every(
      (v) => v !== "-",
    )
      ? round2OrDash(
          Number(dgTotalRunHr) +
            Number(gridRhPerDay) +
            Number(batteryRhPerDay) +
            Number(solarRhPerDay),
        )
      : "-";

  return {
    siteName:
      row?.rms_name_label ??
      row?.rms_name ??
      row?.site_name ??
      row?.device_name ??
      String(row?.device_id ?? "-"),
    startTime: row?.create_date_mmtz ?? row?.create_date ?? "-",
    endTime: row?.last_updated_at ?? row?.last_time ?? "-",
    periodDays: row?.period_days ?? row?.period ?? "-",
    dgRunStart: dgRh.start,
    dgRunEnd: dgRh.end,
    dgRhPerDay: dgTotalRunHr !== "-" ? dgTotalRunHr : round2OrDash(row?.daily_dgrh),
    dgTotalRunHr: dgTotalRunHr !== "-" ? dgTotalRunHr : round2OrDash(row?.daily_dgrh),
    gridRunStart: "-",
    gridRunEnd: "-",
    gridRhPerDay,
    gridTotalRunHr: gridRhPerDay,
    batteryRunStart: "-",
    batteryRunEnd: "-",
    batteryRhPerDay,
    batteryTotalRunHr: batteryRhPerDay,
    solarRunStart: "-",
    solarRunEnd: "-",
    solarRhPerDay,
    solarTotalRunHr: solarRhPerDay,
    totalRunHrPerDays,
    dgKwhStart: dgKwh.start,
    dgKwhEnd: dgKwh.end,
    dgKwhPerDay: diffFromStartEnd(dgKwh.start, dgKwh.end),
    gridKwhStart: gridKwh.start,
    gridKwhEnd: gridKwh.end,
    gridKwhPerDay: diffFromStartEnd(gridKwh.start, gridKwh.end),
    batteryKwhStart: batteryKwh.start,
    batteryKwhEnd: batteryKwh.end,
    batteryKwhPerDay: diffFromStartEnd(batteryKwh.start, batteryKwh.end),
    solarGenKwhStart: solarGeneratedKwh.start,
    solarGenKwhEnd: solarGeneratedKwh.end,
    solarGenKwhPerDay: diffFromStartEnd(solarGeneratedKwh.start, solarGeneratedKwh.end),
    solarLoadKwhStart: solarLoadKwh.start,
    solarLoadKwhEnd: solarLoadKwh.end,
    solarLoadKwhPerDay: diffFromStartEnd(solarLoadKwh.start, solarLoadKwh.end),
  };
};

const rowCreateDate = (row: any): string =>
  String(row?.create_date_mmtz ?? row?.create_date ?? "");

export function buildEnergyRows(data: unknown, appliedDeviceName?: string): EnergyRow[] {
  if (!Array.isArray(data)) return [];
  const sorted = [...data].sort((a: any, b: any) =>
    rowCreateDate(a).localeCompare(rowCreateDate(b)),
  );

  if (sorted.length >= 2) {
    const firstRaw = sorted[0];
    const secondRaw = sorted[1];
    const first = mapApiRowToEnergyRow(firstRaw);
    const second = mapApiRowToEnergyRow(secondRaw);
    const dgRhPerDay = pickNumber(
      diffFromStartEnd(
        toNumberOrDashFromValue(first.dgRunStart),
        toNumberOrDashFromValue(second.dgRunEnd),
      ),
      second.dgRhPerDay,
      first.dgRhPerDay,
    );
    const gridRhPerDay = pickNumber(
      diffFromStartEnd(
        toNumberOrDashFromValue(first.gridRunStart),
        toNumberOrDashFromValue(second.gridRunEnd),
      ),
      second.gridRhPerDay,
      first.gridRhPerDay,
    );
    const batteryRhPerDay = pickNumber(
      diffFromStartEnd(
        toNumberOrDashFromValue(first.batteryRunStart),
        toNumberOrDashFromValue(second.batteryRunEnd),
      ),
      second.batteryRhPerDay,
      first.batteryRhPerDay,
    );
    const solarRhPerDay = pickNumber(
      diffFromStartEnd(
        toNumberOrDashFromValue(first.solarRunStart),
        toNumberOrDashFromValue(second.solarRunEnd),
      ),
      second.solarRhPerDay,
      first.solarRhPerDay,
    );

    return [
      {
        ...second,
        siteName: appliedDeviceName?.trim() || second.siteName,
        startTime: rowCreateDate(firstRaw) || "-",
        endTime: rowCreateDate(secondRaw) || "-",
        periodDays: computePeriodDays(rowCreateDate(firstRaw), rowCreateDate(secondRaw)),
        dgRunStart: first.dgRunStart,
        dgRunEnd: second.dgRunEnd,
        dgRhPerDay,
        dgTotalRunHr: dgRhPerDay,
        gridRunStart: first.gridRunStart,
        gridRunEnd: second.gridRunEnd,
        gridRhPerDay,
        gridTotalRunHr: gridRhPerDay,
        batteryRunStart: first.batteryRunStart,
        batteryRunEnd: second.batteryRunEnd,
        batteryRhPerDay,
        batteryTotalRunHr: batteryRhPerDay,
        solarRunStart: first.solarRunStart,
        solarRunEnd: second.solarRunEnd,
        solarRhPerDay,
        solarTotalRunHr: solarRhPerDay,
        totalRunHrPerDays: sumOrDash(
          dgRhPerDay,
          gridRhPerDay,
          batteryRhPerDay,
          solarRhPerDay,
        ),
        dgKwhStart: first.dgKwhStart,
        dgKwhEnd: second.dgKwhEnd,
        dgKwhPerDay: diffFromStartEnd(
          toNumberOrDashFromValue(first.dgKwhStart),
          toNumberOrDashFromValue(second.dgKwhEnd),
        ),
        gridKwhStart: first.gridKwhStart,
        gridKwhEnd: second.gridKwhEnd,
        gridKwhPerDay: diffFromStartEnd(
          toNumberOrDashFromValue(first.gridKwhStart),
          toNumberOrDashFromValue(second.gridKwhEnd),
        ),
        batteryKwhStart: first.batteryKwhStart,
        batteryKwhEnd: second.batteryKwhEnd,
        batteryKwhPerDay: diffFromStartEnd(
          toNumberOrDashFromValue(first.batteryKwhStart),
          toNumberOrDashFromValue(second.batteryKwhEnd),
        ),
        solarGenKwhStart: first.solarGenKwhStart,
        solarGenKwhEnd: second.solarGenKwhEnd,
        solarGenKwhPerDay: diffFromStartEnd(
          toNumberOrDashFromValue(first.solarGenKwhStart),
          toNumberOrDashFromValue(second.solarGenKwhEnd),
        ),
        solarLoadKwhStart: first.solarLoadKwhStart,
        solarLoadKwhEnd: second.solarLoadKwhEnd,
        solarLoadKwhPerDay: diffFromStartEnd(
          toNumberOrDashFromValue(first.solarLoadKwhStart),
          toNumberOrDashFromValue(second.solarLoadKwhEnd),
        ),
      },
    ];
  }

  return sorted.map((item) => {
    const mapped = mapApiRowToEnergyRow(item);
    return { ...mapped, siteName: appliedDeviceName?.trim() || mapped.siteName };
  });
}

export const toCellDisplay = (value: unknown): string => {
  if (value === "-" || value == null) return "";
  return String(value);
};
