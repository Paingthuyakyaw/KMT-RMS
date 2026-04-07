import dayjs from "@/lib/dayjs";
import type { DateRange } from "react-day-picker";

/** Backend / filter dates are expressed in Myanmar (Yangon) civil calendar. */
export const API_DATE_FILTER_TIMEZONE = "Asia/Rangoon";

/** Map legacy labels to IANA identifiers understood by Intl / dayjs.tz */
export function normalizeTimeZoneId(id: string): string {
  if (id === "GMT") return "Etc/UTC";
  return id;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Calendar Y-M-D from a `Date` in the browser’s local calendar (matches the day cell in the picker). */
export function civilYmdLocalCalendar(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Civil Y-M-D for an instant as shown in the app’s selected timezone (matches date picker labels). */
export function civilYmdInTz(d: Date, timeZoneId: string): string {
  const tz = normalizeTimeZoneId(timeZoneId);
  return dayjs(d).tz(tz).format("YYYY-MM-DD");
}

export function defaultDateRangeInTz(timeZoneId: string): DateRange {
  const tz = normalizeTimeZoneId(timeZoneId);
  const now = dayjs().tz(tz);
  return {
    from: now.startOf("day").toDate(),
    to: now.endOf("day").toDate(),
  };
}

export function todayBoundsInTz(timeZoneId: string): { from: Date; to: Date } {
  const r = defaultDateRangeInTz(timeZoneId);
  return { from: r.from!, to: r.to! };
}

export function todayYmdInTz(timeZoneId: string): string {
  const tz = normalizeTimeZoneId(timeZoneId);
  return dayjs().tz(tz).format("YYYY-MM-DD");
}

/**
 * Inclusive calendar bounds for API: days are read in the app display timezone, then
 * converted to Myanmar (Yangon) civil dates for `from_date` / `to_date` (e.g. UTC mode → MM filter).
 */
export function dateRangeToApiDates(
  range: DateRange | undefined,
  timeZoneId: string,
): { from_date?: string; to_date?: string } {
  if (!range?.from) return {};
  const displayTz = normalizeTimeZoneId(timeZoneId);
  const apiTz = normalizeTimeZoneId(API_DATE_FILTER_TIMEZONE);
  const from = range.from;
  const to = range.to ?? from;
  const ymdFrom = civilYmdInTz(from, timeZoneId);
  const ymdTo = civilYmdInTz(to, timeZoneId);
  const start = dayjs.tz(`${ymdFrom} 00:00:00`, displayTz);
  const end = dayjs.tz(`${ymdTo} 23:59:59`, displayTz).millisecond(999);
  return {
    from_date: start.tz(apiTz).format("YYYY-MM-DD"),
    to_date: end.tz(apiTz).format("YYYY-MM-DD"),
  };
}

/** Single date from picker → API string (display TZ civil day → Myanmar YYYY-MM-DD). */
export function dateToApiYmd(d: Date | undefined, timeZoneId: string): string | undefined {
  if (!d) return undefined;
  const displayTz = normalizeTimeZoneId(timeZoneId);
  const apiTz = normalizeTimeZoneId(API_DATE_FILTER_TIMEZONE);
  const ymd = civilYmdInTz(d, timeZoneId);
  return dayjs.tz(`${ymd} 12:00:00`, displayTz).tz(apiTz).format("YYYY-MM-DD");
}

/** Typed `YYYY-MM-DD` (civil date in display timezone) → Myanmar API date; non-ISO input returned unchanged. */
export function ymdStringToApiYmd(
  ymd: string | undefined | null,
  timeZoneId: string,
): string | undefined {
  if (ymd === undefined || ymd === null) return undefined;
  const trimmed = ymd.trim();
  if (!trimmed) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const displayTz = normalizeTimeZoneId(timeZoneId);
  const apiTz = normalizeTimeZoneId(API_DATE_FILTER_TIMEZONE);
  return dayjs.tz(`${trimmed} 12:00:00`, displayTz).tz(apiTz).format("YYYY-MM-DD");
}

export function formatInstantInTz(
  value: string | number | Date | undefined | null,
  timeZoneId: string,
  pattern = "YYYY-MM-DD HH:mm:ss",
): string {
  if (value === undefined || value === null || value === "") return "";
  const tz = normalizeTimeZoneId(timeZoneId);
  const parsed = dayjs(value);
  if (!parsed.isValid()) return String(value);
  return parsed.tz(tz).format(pattern);
}
