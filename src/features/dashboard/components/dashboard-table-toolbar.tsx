import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  emptyDashboardFilter,
  type DashboardFilterState,
} from "@/features/dashboard/types";
import { Filter, Maximize2, Minimize2 } from "lucide-react";
import { scrollWindowToBottom } from "@/lib/utils";
import { useState } from "react";

type ProjectOption = { id: string | number; name: string };

type DashboardTableToolbarProps = {
  tableExpanded: boolean;
  onToggleExpand: () => void;
  /** Committed filters (table + card API) */
  filter: DashboardFilterState;
  projects: ProjectOption[];
  onFilterReset: () => void;
  onFilterApply: (next: DashboardFilterState) => void;
};

export function DashboardTableToolbar({
  tableExpanded,
  onToggleExpand,
  filter,
  projects,
  onFilterReset,
  onFilterApply,
}: DashboardTableToolbarProps) {
  /** Draft lives only while the filter popover is used — parent holds committed `filter`. */
  const [draft, setDraft] = useState<DashboardFilterState>(filter);

  return (
    <div className="flex items-center justify-between border-b bg-muted/60 px-3 py-2">
      <span className="text-sm font-medium text-muted-foreground">
        Site table
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs"
          aria-pressed={tableExpanded}
          aria-label={
            tableExpanded
              ? "Shrink site table height"
              : "Expand site table height"
          }
          title={
            tableExpanded ? "Table — smaller height" : "Table — larger height"
          }
          onClick={onToggleExpand}
        >
          {tableExpanded ? (
            <Minimize2 className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5 shrink-0" />
          )}
          {tableExpanded ? "Shrink" : "Expand"}
        </Button>
        <Popover
          onOpenChange={(open) => {
            if (open) setDraft({ ...filter });
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2 text-xs"
              onClick={() => scrollWindowToBottom()}
            >
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4" align="end" sideOffset={8}>
            <div className="space-y-4">
              <div className="text-sm font-semibold text-foreground">
                Filter Options
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Site ID</Label>
                  <Input
                    value={draft.siteId}
                    onChange={(e) =>
                      setDraft((pre) => ({ ...pre, siteId: e.target.value }))
                    }
                    placeholder="Enter Site ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select
                    value={draft.project_id || "all"}
                    onValueChange={(val) =>
                      setDraft((pre) => ({
                        ...pre,
                        project_id: val === "all" ? "" : val,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All projects" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="all">All projects</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Power Source Model</Label>
                  <Select
                    value={draft.power_source_type || "all"}
                    onValueChange={(val) =>
                      setDraft((pre) => ({
                        ...pre,
                        power_source_type: val === "all" ? "" : val,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Power Source" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="all">All models</SelectItem>
                      <SelectItem value="grid,battery">Grid + Battery</SelectItem>
                      <SelectItem value="dg,battery">DG + Battery</SelectItem>
                      <SelectItem value="grid,dg,battery">
                        Grid + DG + Battery
                      </SelectItem>
                      <SelectItem value="solar,grid">Solar + Grid</SelectItem>
                      <SelectItem value="solar,dg,battery">
                        Solar + DG + Battery
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Power Source</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Power Source" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="Site On Grid">Site On Grid</SelectItem>
                      <SelectItem value="Site On DG">Site On DG</SelectItem>
                      <SelectItem value="Site On BB">Site On BB</SelectItem>
                      <SelectItem value="Site On Solar">Site On Solar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={draft.status || "all"}
                    onValueChange={(val) =>
                      setDraft((pre) => ({
                        ...pre,
                        status: val === "all" ? "" : val,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="1">Online</SelectItem>
                      <SelectItem value="0">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => {
                    const cleared = emptyDashboardFilter();
                    setDraft(cleared);
                    onFilterReset();
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => onFilterApply({ ...draft })}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
