import dayjs from "@/lib/dayjs";
import { normalizeTimeZoneId } from "@/lib/app-timezone";

/**
 * Display format: `YYYY-MM-DD HH:mm:ss` in the app-selected timezone (global selector).
 * Use for API `create_date` strings and epoch-based `getFormatDate` output.
 */
export function formatTimestampInTz(input: unknown, timeZoneId: string): string {
  const tz = normalizeTimeZoneId(timeZoneId);
  if (input == null) return "";
  if (typeof input === "number" && Number.isFinite(input)) {
    const sec = input > 1e12 ? Math.floor(input / 1000) : Math.floor(input);
    return dayjs.unix(sec).tz(tz).format("YYYY-MM-DD HH:mm:ss");
  }
  const s0 = String(input).trim();
  if (!s0 || s0 === "-") return "";

  if (/^\d{10}$/.test(s0)) {
    return dayjs.unix(Number(s0)).tz(tz).format("YYYY-MM-DD HH:mm:ss");
  }
  if (/^\d{13}$/.test(s0)) {
    return dayjs(Number(s0)).tz(tz).format("YYYY-MM-DD HH:mm:ss");
  }

  const normalized = normalizeSqlDatetimeString(s0);
  const parsed = dayjs.tz(normalized, "YYYY-MM-DD HH:mm:ss", tz);
  if (parsed.isValid()) return parsed.format("YYYY-MM-DD HH:mm:ss");

  const loose = dayjs(s0);
  if (loose.isValid()) return loose.tz(tz).format("YYYY-MM-DD HH:mm:ss");

  return s0;
}

function normalizeSqlDatetimeString(s: string): string {
  const m = s.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{1,2}):(\d{1,2})/,
  );
  if (!m) return s;
  const [, y, mo, d, h, mi, se] = m;
  return `${y}-${mo}-${d} ${h.padStart(2, "0")}:${mi.padStart(2, "0")}:${se.padStart(2, "0")}`;
}

function formatEpochSecondsInTz(sec: number, timeZoneId: string): string {
  return dayjs
    .unix(sec)
    .tz(normalizeTimeZoneId(timeZoneId))
    .format("YYYY-MM-DD HH:mm:ss");
}

/**
 * `getFormatDate(json1, json2, lasttime)` — first key from json1, then first key from json2
 * overwrites; if still unset, use `lasttime`. Epoch seconds → wall time in `timeZoneId`.
 */
export function getFormatDate(
  json1: unknown,
  json2: unknown,
  lasttime: unknown,
  timeZoneId: string,
): string {
  let latestTime: string | number = 0;

  const firstKeyFromJson = (raw: unknown): string | null => {
    if (raw == null) return null;
    const s = String(raw).trim();
    if (!s || s === " ") return null;
    try {
      const parsed = JSON.parse(s) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const keys = Object.keys(parsed as Record<string, unknown>);
        if (keys.length) return keys[0]!;
      }
    } catch {
      return null;
    }
    return null;
  };

  const k1 = firstKeyFromJson(json1);
  if (k1 != null) latestTime = k1;
  const k2 = firstKeyFromJson(json2);
  if (k2 != null) latestTime = k2;

  if (latestTime === 0 || latestTime === "0") {
    if (lasttime != null && String(lasttime).trim() !== "") {
      latestTime = lasttime as string | number;
    }
  }

  if (latestTime === 0 || latestTime === "0") return "";

  let sec = Number(String(latestTime).slice(0, 10));
  if (!Number.isFinite(sec) || sec <= 0) {
    const parsed = parseLastTimeToEpochSeconds(latestTime);
    if (parsed == null) return "";
    sec = parsed;
  }

  return formatEpochSecondsInTz(sec, timeZoneId);
}

/**
 * For `genset_l1_v`, `batt_voltage_v`, etc.: JSON `{"epochSeconds": value}` → show value at latest key.
 */
export function latestScalarFromJsonTimeline(
  raw: unknown,
): string | number | null {
  if (raw == null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "boolean") return raw ? 1 : 0;
  const s = String(raw).trim();
  if (!s) return null;
  if (!s.startsWith("{")) {
    const n = Number(s);
    return Number.isFinite(n) ? n : s;
  }
  try {
    const parsed = JSON.parse(s) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return null;
    const entries = Object.entries(parsed)
      .map(([k, v]) => ({ k: Number(k), v }))
      .filter((x) => Number.isFinite(x.k));
    if (!entries.length) return null;
    entries.sort((a, b) => a.k - b.k);
    const val = entries[entries.length - 1]!.v;
    const num = Number(val);
    return Number.isFinite(num) ? num : String(val);
  } catch {
    return null;
  }
}

function parseLastTimeToEpochSeconds(lasttime: unknown): number | null {
  if (lasttime == null) return null;
  if (typeof lasttime === "number" && Number.isFinite(lasttime)) {
    const s = String(lasttime).trim();
    if (!s) return null;
    const n = Number(s.length > 10 ? s.slice(0, 10) : s);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  const s = String(lasttime).trim();
  if (!s) return null;
  if (/^\d{10,13}$/.test(s)) {
    const sec = s.length > 10 ? Math.floor(Number(s) / 1000) : Number(s);
    return Number.isFinite(sec) && sec > 0 ? sec : null;
  }
  const ms = Date.parse(s);
  if (!Number.isFinite(ms)) return null;
  return Math.floor(ms / 1000);
}
