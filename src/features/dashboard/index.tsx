import CardComponents from "@/features/dashboard/components/card";
import { DashboardTableToolbar } from "@/features/dashboard/components/dashboard-table-toolbar";
import { SiteDevicesTable } from "@/features/dashboard/components/site-devices-table";
import { columnGroups } from "@/features/dashboard/data/column-groups";
import { useDashboardPage } from "@/features/dashboard/hooks/use-dashboard-page";
import { cn } from "@/lib/utils";

export { columnGroups };

export default function Dashboard() {
  const {
    setScrollRootEl,
    sentinelRef,
    tableExpanded,
    setTableExpanded,
    filter,
    projects,
    resetFilters,
    applyFilters,
    stats,
    devices,
    isFetchingNextPage,
  } = useDashboardPage();

  return (
    <div
      className={cn(
        tableExpanded && "flex min-h-0 flex-col h-[calc(100dvh-6.25rem)]",
      )}
    >
      <h4 className="text-lg font-semibold tracking-tight">Dashboard</h4>

      {!tableExpanded ? (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Stats
            </span>
          </div>
          <CardComponents stats={stats} className="rounded-xl bg-card/40" />
        </div>
      ) : null}

      <div
        className={cn(
          "mt-5 text-sm overflow-hidden border border-border bg-card flex flex-col",
          tableExpanded && "mt-0 min-h-0 flex-1",
        )}
      >
        <DashboardTableToolbar
          tableExpanded={tableExpanded}
          onToggleExpand={() => setTableExpanded((v) => !v)}
          filter={filter}
          projects={projects}
          onFilterReset={resetFilters}
          onFilterApply={applyFilters}
        />

        <div className={cn(tableExpanded ? "min-h-0 flex-1" : "h-130")}>
          <SiteDevicesTable
            columnGroups={columnGroups}
            devices={devices}
            isFetchingNextPage={isFetchingNextPage}
            setScrollRootEl={setScrollRootEl}
            sentinelRef={sentinelRef}
          />
        </div>
      </div>
    </div>
  );
}
