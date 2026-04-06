import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatInstantInTz } from "@/lib/app-timezone";

/**
 * Tablet/mobile: scroll parent must stay `overflow-x-auto`; this block is
 * `min-width: max(100%, total column mins)` so columns never squash below mins.
 * Wide desktop: table stretches to full row width (`w-full` inside the wrapper).
 */
export const ALARM_HISTORY_COLUMNS = [
  { key: "device", label: "Device Name", minWidthPx: 104, nowrap: true },
  { key: "project", label: "Project Name", minWidthPx: 120, nowrap: true },
  { key: "trigger", label: "Trigger", minWidthPx: 200, nowrap: true },
  {
    key: "content",
    label: "Content",
    minWidthPx: 240,
    // nowrap: false,
    // breakWords: true,
  },
  { key: "status", label: "Alarm Status", minWidthPx: 108, nowrap: false },
  { key: "time", label: "Alarm Time", minWidthPx: 176, nowrap: true },
] as const;

export const ALARM_HISTORY_TABLE_MIN_WIDTH_PX = ALARM_HISTORY_COLUMNS.reduce(
  (acc, c) => acc + c.minWidthPx,
  0,
);

export type AlarmHistoryRow = {
  device_name?: string | null;
  project_name?: string | null;
  trigger_name?: string | null;
  content?: string | null;
  status?: boolean;
  alarm_time?: string | number | null;
};

type AlarmHistoryDataTableProps = {
  rows: AlarmHistoryRow[] | undefined;
  timeZoneId: string;
};

export function AlarmHistoryDataTable({
  rows,
  timeZoneId,
}: AlarmHistoryDataTableProps) {
  const list = rows ?? [];

  return (
    <div
      className="w-full max-w-none"
      style={{
        minWidth: `max(100%, ${ALARM_HISTORY_TABLE_MIN_WIDTH_PX}px)`,
      }}
    >
      <Table className="table-auto w-full border-collapse bg-muted text-sm caption-bottom">
        <TableHeader>
          <TableRow className="sticky top-0 z-20 border-0 bg-muted hover:bg-muted">
            {ALARM_HISTORY_COLUMNS.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "border-border bg-muted px-2 py-2.5 text-xs font-semibold sm:text-sm",
                  col.key === "device" &&
                    "sticky left-0 z-30 border-border bg-muted",
                  // col.nowrap && "whitespace-nowrap",
                )}
                style={{ minWidth: col.minWidthPx, boxSizing: "border-box" }}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((item, idx) => (
            <TableRow key={idx} className="bg-muted hover:bg-muted/80">
              <TableCell
                className="sticky left-0 z-10 border-border bg-muted px-2 py-2 text-xs whitespace-nowrap sm:text-sm"
                style={{
                  minWidth: ALARM_HISTORY_COLUMNS[0].minWidthPx,
                  boxSizing: "border-box",
                }}
              >
                {item.device_name}
              </TableCell>
              <TableCell
                className="px-2 py-2 text-xs whitespace-nowrap sm:text-sm"
                style={{
                  minWidth: ALARM_HISTORY_COLUMNS[1].minWidthPx,
                  boxSizing: "border-box",
                }}
              >
                {item.project_name}
              </TableCell>
              <TableCell
                className="px-2 py-2 text-xs whitespace-nowrap sm:text-sm"
                style={{
                  minWidth: ALARM_HISTORY_COLUMNS[2].minWidthPx,
                  boxSizing: "border-box",
                }}
              >
                {item.trigger_name}
              </TableCell>
              <TableCell
                className={cn(
                  "px-2 py-2 text-xs align-top sm:text-sm",
            
                )}
                style={{
                  minWidth: ALARM_HISTORY_COLUMNS[3].minWidthPx,
                  boxSizing: "border-box",
                }}
              >
                {item.content || "-"}
              </TableCell>
              <TableCell
                className="px-2 py-2 text-xs sm:text-sm"
                style={{
                  minWidth: ALARM_HISTORY_COLUMNS[4].minWidthPx,
                  boxSizing: "border-box",
                }}
              >
                <Badge
                  className={
                    item.status === false
                      ? "whitespace-nowrap bg-green-600 hover:bg-green-600"
                      : "whitespace-nowrap bg-red-600 hover:bg-red-600"
                  }
                >
                  {item.status ? "Alarm" : "Normal"}
                </Badge>
              </TableCell>
              <TableCell
                className="px-2 py-2 text-xs whitespace-nowrap tabular-nums sm:text-sm"
                style={{
                  minWidth: ALARM_HISTORY_COLUMNS[5].minWidthPx,
                  boxSizing: "border-box",
                }}
              >
                {item.alarm_time
                  ? formatInstantInTz(
                      item.alarm_time,
                      timeZoneId,
                      "YYYY-MM-DD HH:mm:ss",
                    )
                  : ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
