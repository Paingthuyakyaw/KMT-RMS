import dayjs from "@/lib/dayjs";
import { normalizeTimeZoneId } from "@/lib/app-timezone";
import { TZ_LABELS } from "@/lib/tz-labels";

export type TimeZoneOption = {
  id: string;
  label: string;
  offsetLabel: string;
  displayLine: string;
  utcOffsetMinutes: number;
};

function formatGmtOffsetFromMinutes(totalMinutes: number): string {
  const sign = totalMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(totalMinutes);
  const hh = Math.floor(abs / 60);
  const mm = abs % 60;
  return `GMT${sign}${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** Build selectable rows: `GMT±HH:MM - Label (IANA)` sorted by offset, then label. */
export function buildTimeZoneOptions(at: Date = new Date()): TimeZoneOption[] {
  const entries = Object.entries(TZ_LABELS).map(([id, label]) => {
    const tz = normalizeTimeZoneId(id);
    let utcOffsetMinutes = 0;
    try {
      utcOffsetMinutes = dayjs(at).tz(tz).utcOffset();
    } catch {
      utcOffsetMinutes = 0;
    }
    const offsetLabel = formatGmtOffsetFromMinutes(utcOffsetMinutes);
    const displayLine = `${offsetLabel} - ${label} (${id})`;
    return { id, label, offsetLabel, displayLine, utcOffsetMinutes };
  });
  return entries.sort(
    (a, b) =>
      a.utcOffsetMinutes - b.utcOffsetMinutes ||
      a.label.localeCompare(b.label),
  );
}
