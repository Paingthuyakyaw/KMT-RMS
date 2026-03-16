import CardComponents from "@/features/dashboard/components/card";
import {
  mapStatsToDashboardItems,
  sampleDashboardStats,
} from "@/features/dashboard/data/dashboard-stats";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";
import {
  useMappingStore,
  getDisplayValue,
  type MappingState,
} from "@/features/mapping/store";
import { MultiSelectFilterDropdown } from "@/features/dashboard/components/multi-select-filter-dropdown";

type Row = Record<string, string | number>;

// simple fake rows – some with powerModel 50 so mapping rules can show e.g. ****
const rows: Row[] = Array.from({ length: 50 }, (_, i) => {
  const powerSources = [
    "Site On Grid",
    "Site On DG",
    "Site On BB",
    "Site On Solar",
  ];
  const modes = ["Manual", "Auto", "Stop"];

  return {
    siteId: `YN${5400 + i}`,
    viewDetail: "View",
    lastUpdateTime: "2026-03-09 15:30",
    siteStatus: i % 2 === 0 ? "Online" : "Offline",
    dgStatus: "OFF",
    cabinetStatus: "OK",
    batteryStatus: "OK",
    solarStatus: "OK",
    ioCardStatus: "OK",
    powerModel: i % 5 === 0 ? 50 : "Hybrid",
    powerSource: powerSources[i % powerSources.length],
    dgControllerMode: modes[i % modes.length],
  };
});

export const columnGroups = [
  {
    label: "Site Info",
    columns: [
      { key: "siteId", label: "Site ID", minWidth: "72px" },
      { key: "viewDetail", label: "View Detail", minWidth: "88px" },
      { key: "lastUpdateTime", label: "Last Update Time", minWidth: "136px" },
      { key: "siteStatus", label: "Site Status", minWidth: "88px" },
      { key: "dgStatus", label: "DG", minWidth: "36px" },
      { key: "cabinetStatus", label: "Cabinet", minWidth: "72px" },
      { key: "batteryStatus", label: "Battery", minWidth: "64px" },
      { key: "solarStatus", label: "Solar", minWidth: "54px" },
      { key: "ioCardStatus", label: "IO Card", minWidth: "66px" },
      { key: "powerModel", label: "Power Model", minWidth: "92px" },
      { key: "powerSource", label: "Power Source", minWidth: "96px" },
    ],
  },
  {
    label: "Cabinet Info",
    columns: [
      { key: "roomTemp", label: "Room Temp(°C)", minWidth: "102px" },
      { key: "batteryTemp", label: "Battery Temp(°C)", minWidth: "120px" },
      { key: "battVoltage", label: "Batt Voltage(V)", minWidth: "108px" },
      { key: "battCurrent", label: "Batt Current(A)", minWidth: "108px" },
      {
        key: "rectifierCurrent",
        label: "Rectifier Current(A)",
        minWidth: "144px",
      },
      { key: "soc", label: "SOC (%)", minWidth: "64px" },
    ],
  },
  {
    label: "Tenant 1 (MYTEL)",
    columns: [
      { key: "tenant1Load", label: "Load(A)", minWidth: "66px" },
      { key: "tenant1Power", label: "Power(W)", minWidth: "76px" },
    ],
  },
  {
    label: "Tenant 2 (ATOM)",
    columns: [
      { key: "tenant2Load", label: "Load(A)", minWidth: "66px" },
      { key: "tenant2Power", label: "Power(W)", minWidth: "76px" },
    ],
  },
  {
    label: "Tenant 3 (OML)",
    columns: [
      { key: "tenant3Load", label: "Load(A)", minWidth: "66px" },
      { key: "tenant3Power", label: "Power(W)", minWidth: "76px" },
    ],
  },
  {
    label: "Tenant 4 (MPT)",
    columns: [
      { key: "tenant4Load", label: "Load(A)", minWidth: "66px" },
      { key: "tenant4Power", label: "Power(W)", minWidth: "76px" },
    ],
  },
  {
    label: "DG Info",
    columns: [
      { key: "fuelLevel", label: "Fuel Level(L)", minWidth: "96px" },
      {
        key: "engineRunTime",
        label: "Engine Run Time(Hrs)",
        minWidth: "144px",
      },
      { key: "gensetEnergy", label: "Genset Energy(kWh)", minWidth: "132px" },
      {
        key: "dgControllerMode",
        label: "DG Controller Mode",
        minWidth: "132px",
      },
      { key: "gensetL1V", label: "Genset L1(V)", minWidth: "88px" },
      { key: "gensetL2V", label: "Genset L2(V)", minWidth: "88px" },
      { key: "gensetL3V", label: "Genset L3(V)", minWidth: "88px" },
      { key: "gensetL1A", label: "Genset L1(A)", minWidth: "88px" },
      { key: "gensetL2A", label: "Genset L2(A)", minWidth: "88px" },
      { key: "gensetL3A", label: "Genset L3(A)", minWidth: "88px" },
      { key: "dgbVoltage", label: "DGB Voltage(V)", minWidth: "108px" },
      { key: "chargeVoltage", label: "Charge Voltage(V)", minWidth: "128px" },
      { key: "oilBar", label: "Oil Bar", minWidth: "68px" },
      { key: "engineTemp", label: "Engine Temp", minWidth: "98px" },
      { key: "engineFQ", label: "Engine FQ", minWidth: "80px" },
      { key: "gridL1V", label: "Grid L1V", minWidth: "80px" },
      { key: "gridL2V", label: "Grid L2V", minWidth: "80px" },
      { key: "gridL3V", label: "Grid L3V", minWidth: "80px" },
      { key: "gridL1A", label: "Grid L1-A", minWidth: "84px" },
      { key: "gridL2A", label: "Grid L2-A", minWidth: "84px" },
      { key: "gridL3A", label: "Grid L3-A", minWidth: "84px" },
      { key: "gridFQ", label: "Grid FQ", minWidth: "70px" },
      { key: "gridEnergy", label: "Grid Energy(kWh)", minWidth: "128px" },
      { key: "dgDoorOpen", label: "DG Door Open", minWidth: "108px" },
    ],
  },
  {
    label: "IO Card Info",
    columns: [
      { key: "gridRunTime", label: "Grid Run Time(Hrs)", minWidth: "144px" },
      { key: "battRunTime", label: "Batt Run Time(Hrs)", minWidth: "144px" },
      { key: "cabinetDoor1", label: "Cabinet Door 1", minWidth: "108px" },
      { key: "cabinetDoor2", label: "Cabinet Door 2", minWidth: "108px" },
    ],
  },
  {
    label: "Solar Info",
    columns: [
      { key: "pv1Input", label: "PV1 Input(V)", minWidth: "88px" },
      { key: "pv2Input", label: "PV2 Input(V)", minWidth: "88px" },
      { key: "pv3Input", label: "PV3 Input(V)", minWidth: "88px" },
      { key: "pv4Input", label: "PV4 Input(V)", minWidth: "88px" },
      { key: "pv1Current", label: "PV1 Current(A)", minWidth: "108px" },
      { key: "pv2Current", label: "PV2 Current(A)", minWidth: "108px" },
      { key: "pv3Current", label: "PV3 Current(A)", minWidth: "108px" },
      { key: "pv4Current", label: "PV4 Current(A)", minWidth: "108px" },
      {
        key: "chargingCurrent",
        label: "Charging Current (A)",
        minWidth: "144px",
      },
      {
        key: "solarOutputVolt",
        label: "Solar Output Volt(V)",
        minWidth: "144px",
      },
      {
        key: "solarOutputAmps",
        label: "Solar Output Amps (A)",
        minWidth: "148px",
      },
      {
        key: "dailyGeneratedEnergy",
        label: "Daily Generated Energy (kWh)",
        minWidth: "188px",
      },
      {
        key: "monthlyGeneratedEnergy",
        label: "Monthly Generated Energy(kWh)",
        minWidth: "200px",
      },
      {
        key: "totalGeneratedEnergy",
        label: "Total Generated Energy(kWh)",
        minWidth: "196px",
      },
      {
        key: "dailyLoadEnergy",
        label: "Daily Load Energy(kWh)",
        minWidth: "162px",
      },
      {
        key: "monthlyLoadEnergy",
        label: "Monthly Load Energy(kWh)",
        minWidth: "178px",
      },
      {
        key: "totalLoadEnergy",
        label: "Total Load Energy(kWh)",
        minWidth: "174px",
      },
    ],
  },
  {
    label: "System Generated Data",
    columns: [
      { key: "batteryBackup", label: "Battery Backup", minWidth: "108px" },
      { key: "dailyRunTime", label: "Daily Run Time", minWidth: "108px" },
      { key: "cph", label: "CPH", minWidth: "42px" },
      { key: "lastActiveAlarm", label: "Last Active Alarm", minWidth: "128px" },
    ],
  },
];

const powerSourceModelOptions = [
  "Grid + Battery",
  "DG + Battery",
  "Grid + DG + Battery",
  "Solar + Grid",
  "Solar + DG + Battery",
  "Solar + Grid + Battery",
] as const;

const powerSourceOptions = [
  "Site On Grid",
  "Site On DG",
  "Site On BB",
  "Site On Solar",
] as const;

const modeOptions = ["Manual", "Auto", "Stop"] as const;

const statusOptions = ["Online", "Offline"] as const;

type FilterState = {
  filterColumn: string;
  filterQuery: string;
  powerSourceModels: string[];
  powerSources: string[];
  modes: string[];
  statuses: string[];
};

type ViewState = {
  cardsExpanded: boolean;
  tableExpanded: boolean;
};

const Dashboard = () => {
  const stats = mapStatsToDashboardItems(sampleDashboardStats);
  const [viewState, setViewState] = useState<ViewState>({
    cardsExpanded: false,
    tableExpanded: false,
  });
  const [filters, setFilters] = useState<FilterState>({
    filterColumn: "siteId",
    filterQuery: "",
    powerSourceModels: [],
    powerSources: [],
    modes: [],
    statuses: [],
  });
  const rules = useMappingStore((s: MappingState) => s.rules);

  const filteredRows = rows.filter((row) => {
    const {
      filterColumn,
      filterQuery,
      powerSourceModels,
      powerSources,
      modes,
      statuses,
    } = filters;
    // text / column filter
    if (filterQuery) {
      const value = row[filterColumn as keyof typeof row];
      if (value === undefined || value === null) return false;
      const matchesText = String(value)
        .toLowerCase()
        .includes(filterQuery.toLowerCase());
      if (!matchesText) return false;
    }

    // Power Source Model multi-select filter
    if (powerSourceModels.length > 0) {
      const model = row.powerModel;
      if (!powerSourceModels.includes(String(model))) {
        return false;
      }
    }

    // Power Source multi-select filter
    if (powerSources.length > 0) {
      const source = row.powerSource;
      if (!powerSources.includes(String(source))) {
        return false;
      }
    }

    // Mode multi-select filter (mapped to dgControllerMode)
    if (modes.length > 0) {
      const mode = (row as Row)["dgControllerMode"];
      if (!modes.includes(String(mode))) {
        return false;
      }
    }

    // Status multi-select filter (mapped to siteStatus)
    if (statuses.length > 0) {
      const status = row.siteStatus;
      if (!statuses.includes(String(status))) {
        return false;
      }
    }

    return true;
  });

  const tableContent = (
    <ScrollArea className="h-full w-full whitespace-nowrap">
      <div className="min-w-max">
        <Table className="table w-max text-sm table-auto border-collapse">
          <TableHeader>
            {/* Group header row */}
            <TableRow className="sticky  top-0 z-30 border-0 bg-muted">
              {columnGroups.map((group) => (
                <TableHead
                  key={group.label}
                  colSpan={group.columns.length}
                  className="border-r bg-[#94A3B8] dark:bg-muted text-stone-800 dark:text-stone-200 text-sm border-border  px-2 py-2.5 text-center  font-semibold tracking-tight "
                >
                  {group.label}
                </TableHead>
              ))}
            </TableRow>
            {/* Column header row */}
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
            {filteredRows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columnGroups.flatMap((group) =>
                  group.columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={
                        col.key === "siteId"
                          ? "sticky left-0 z-10 bg-card text-sm"
                          : "text-sm"
                      }
                      style={{
                        minWidth: col.minWidth,
                        boxSizing: "border-box",
                      }}
                    >
                      {getDisplayValue(
                        col.key,
                        row[col.key as keyof typeof row],
                        rules,
                      ) ?? "-"}
                    </TableCell>
                  )),
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ScrollBar orientation="horizontal" />
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );

  const filterControls = (
    <div className="flex items-center gap-2">
      <Combobox
        items={columnGroups.flatMap((group) =>
          group.columns.map((col) => col.key),
        )}
      >
        <ComboboxInput
          placeholder="Filter column"
          aria-label="Filter column"
          className="h-9 w-40"
        />
        <ComboboxContent>
          <ComboboxEmpty>No columns found.</ComboboxEmpty>
          <ComboboxList>
            {(key) => {
              const col = columnGroups
                .flatMap((group) => group.columns)
                .find((c) => c.key === key);
              if (!col) return null;
              return (
                <ComboboxItem
                  key={col.key}
                  value={col.key}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      filterColumn: col.key,
                    }))
                  }
                >
                  {col.label}
                </ComboboxItem>
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <Input
        placeholder="Search…"
        className="h-9 w-52"
        value={filters.filterQuery}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            filterQuery: e.target.value,
          }))
        }
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 px-2 text-xs"
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

            <div className="space-y-3">
              <MultiSelectFilterDropdown
                label="Power Source Model"
                placeholder="Choose Power Source Model"
                options={[...powerSourceModelOptions]}
                values={filters.powerSourceModels}
                onChange={(values) =>
                  setFilters((prev) => ({
                    ...prev,
                    powerSourceModels: values,
                  }))
                }
              />
              <MultiSelectFilterDropdown
                label="Power Source"
                placeholder="Choose Power Source"
                options={[...powerSourceOptions]}
                values={filters.powerSources}
                onChange={(values) =>
                  setFilters((prev) => ({
                    ...prev,
                    powerSources: values,
                  }))
                }
              />
              <MultiSelectFilterDropdown
                label="Mode"
                placeholder="Choose Mode"
                options={[...modeOptions]}
                values={filters.modes}
                onChange={(values) =>
                  setFilters((prev) => ({ ...prev, modes: values }))
                }
              />
              <MultiSelectFilterDropdown
                label="Status"
                placeholder="Choose Device Status"
                options={[...statusOptions]}
                values={filters.statuses}
                onChange={(values) =>
                  setFilters((prev) => ({ ...prev, statuses: values }))
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    powerSourceModels: [],
                    powerSources: [],
                    modes: [],
                    statuses: [],
                  }));
                }}
              >
                Reset
              </Button>
              <Button size="sm" className="h-7 px-3 text-xs">
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div>
      <h4 className="font-semibold">Dashboard</h4>

      {/* cards row with expand */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Stats
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-foreground"
            onClick={() =>
              setViewState((prev) => ({ ...prev, cardsExpanded: true }))
            }
            title="Full screen"
            aria-label="Expand cards to full screen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        <CardComponents stats={stats} className="rounded-xl bg-card/40" />
      </div>

      {/* table section with expand */}
      <div className="mt-5 text-sm overflow-hidden border border-border bg-card ">
        <div className="flex items-center justify-between border-b bg-muted/60 px-3 py-2">
          <span className="text-sm font-medium text-muted-foreground">
            Site inventory table
          </span>
          <div className="flex  items-center gap-2">
            {filterControls}
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-foreground"
              onClick={() =>
                setViewState((prev) => ({ ...prev, tableExpanded: true }))
              }
              title="Full screen"
              aria-label="Expand table to full screen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="h-130">{tableContent}</div>
      </div>

      {/* Full screen overlay - Cards */}
      {viewState.cardsExpanded && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background"
          role="dialog"
          aria-modal="true"
          aria-label="Cards full screen view"
        >
          <div className="flex shrink-0 items-center justify-between border-b bg-muted/60 px-4 py-2">
            <span className="text-sm font-medium">Stats — Full screen</span>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                setViewState((prev) => ({ ...prev, cardsExpanded: false }))
              }
              aria-label="Exit full screen"
            >
              <Minimize2 className="h-3.5 w-3.5" />
              Exit full screen
            </Button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
            <CardComponents
              stats={stats}
              fullScreen
              className="h-full w-full rounded-xl bg-background"
            />
          </div>
        </div>
      )}

      {/* Full screen overlay - Table */}
      {viewState.tableExpanded && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background"
          role="dialog"
          aria-modal="true"
          aria-label="Table full screen view"
        >
          <div className="flex shrink-0 items-center justify-between border-b bg-muted/60 px-4 py-2">
            <span className="text-sm font-medium">
              Site inventory table — Full screen
            </span>
            <div className="flex items-center gap-2">
              {filterControls}
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  setViewState((prev) => ({ ...prev, tableExpanded: false }))
                }
                aria-label="Exit full screen"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                Exit full screen
              </Button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden border-t">
            {tableContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
