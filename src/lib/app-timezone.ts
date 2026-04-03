import dayjs from "@/lib/dayjs";
import type { DateRange } from "react-day-picker";

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

/** Inclusive UTC calendar bounds for API when the user picked local calendar days in the app timezone. */
export function dateRangeToApiDates(
  range: DateRange | undefined,
  timeZoneId: string,
): { from_date?: string; to_date?: string } {
  if (!range?.from) return {};
  const tz = normalizeTimeZoneId(timeZoneId);
  const from = range.from;
  const to = range.to ?? from;
  const ymdFrom = civilYmdLocalCalendar(from);
  const ymdTo = civilYmdLocalCalendar(to);
  const startUtc = dayjs.tz(`${ymdFrom} 00:00:00`, tz).utc();
  const endUtc = dayjs.tz(`${ymdTo} 23:59:59`, tz).utc().millisecond(999);
  return {
    from_date: startUtc.format("YYYY-MM-DD"),
    to_date: endUtc.format("YYYY-MM-DD"),
  };
}

/** Single date from picker → API string (civil day from picker, anchored in app timezone). */
export function dateToApiYmd(d: Date | undefined, timeZoneId: string): string | undefined {
  if (!d) return undefined;
  const tz = normalizeTimeZoneId(timeZoneId);
  const ymd = civilYmdLocalCalendar(d);
  return dayjs.tz(`${ymd} 12:00:00`, tz).format("YYYY-MM-DD");
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
