import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import type { DashboardColumnGroup } from "@/features/dashboard/data/column-groups";
import { getDeviceTableRowModel } from "@/features/dashboard/lib/build-device-table-row";
import { Link } from "@tanstack/react-router";
import { BarChart3Icon, EyeIcon } from "lucide-react";
import type { RefObject } from "react";

type SiteDevicesTableProps = {
  columnGroups: DashboardColumnGroup[];
  devices: any[];
  isFetchingNextPage: boolean;
  setScrollRootEl: (node: HTMLDivElement | null) => void;
  sentinelRef: RefObject<HTMLDivElement | null>;
};

export function SiteDevicesTable({
  columnGroups,
  devices,
  isFetchingNextPage,
  setScrollRootEl,
  sentinelRef,
}: SiteDevicesTableProps) {
  return (
    <ScrollArea
      className="h-full w-full whitespace-nowrap"
      viewportRef={(node) => setScrollRootEl(node)}
    >
      <div className="min-w-max">
        <Table className="table w-max text-sm table-auto border-collapse bg-muted!">
          <TableHeader>
            <TableRow className="sticky top-0 z-30 border-0 bg-muted">
              {columnGroups.map((group) => (
                <TableHead
                  key={group.label}
                  colSpan={group.columns.length}
                  className="border-r bg-[#94A3B8] dark:bg-muted text-stone-800 dark:text-stone-200 text-sm border-border px-2 py-2.5 text-center font-semibold tracking-tight"
                >
                  {group.label}
                </TableHead>
              ))}
            </TableRow>

            <TableRow className="sticky top-9 z-20 border-0 bg-muted">
              {columnGroups.flatMap((group) =>
                group.columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={
                      col.key === "siteId"
                        ? "sticky left-0 z-20 border-border bg-muted px-2 py-2 text-sm font-medium"
                        : "border-border bg-muted px-2 py-2 text-sm font-medium"
                    }
                    style={{
                      minWidth: col.minWidth,
                      boxSizing: "border-box",
                    }}
                  >
                    {col.label}
                  </TableHead>
                )),
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {devices.map((d: any, rowIndex: number) => {
              const {
                rowKey,
                siteId,
                chartId,
                logRmsDeviceId,
                row,
              } = getDeviceTableRowModel(d, rowIndex);

              const logSearch: {
                rms_device_id?: string;
                device_name?: string;
              } = {};
              if (logRmsDeviceId) logSearch.rms_device_id = logRmsDeviceId;
              const nameForLog =  siteId;
              if (nameForLog) logSearch.device_name = String(nameForLog);

              return (
                <TableRow key={String(rowKey)}>
                  {columnGroups.flatMap((group) =>
                    group.columns.map((col) => (
                      <td
                        key={col.key}
                        className={
                          col.key === "siteId"
                            ? "sticky left-0 z-10 bg-muted px-2 py-2 text-sm border-border border"
                            : "px-2 py-2 text-sm border-border border"
                        }
                        style={{
                          minWidth: col.minWidth,
                          boxSizing: "border-box",
                        }}
                      >
                        {col.key === "logDetail" ? (
                          Object.keys(logSearch).length > 0 ? (
                            <div className="flex items-center justify-center gap-2">
                              <Link
                                to="/log"
                                search={logSearch}
                                className="inline-flex items-center justify-center rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                aria-label="View log"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Link>

                              <Link
                                to="/chart/$id"
                                params={{ id: chartId }}
                                className="inline-flex items-center justify-center rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                aria-label="View chart"
                              >
                                <BarChart3Icon className="h-4 w-4" />
                              </Link>
                            </div>
                          ) : null
                        ) : col.key === "viewDetail" ? null : (
                          ((row[col.key] ?? "") as string | number)
                        )}
                      </td>
                    )),
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div
          ref={sentinelRef}
          className="h-7.5 flex items-center justify-start w-full"
        >
          {isFetchingNextPage ? (
            <Spinner className="dark:text-white text-black" />
          ) : null}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
