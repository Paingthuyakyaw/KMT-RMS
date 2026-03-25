import CardComponents, {
  type DashboardStatItem,
} from "@/features/dashboard/components/card";
import {
  mapStatsToDashboardItems,
  type DashboardStatsFromBackend,
} from "@/features/dashboard/data/dashboard-stats";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeviceDetailInfinite } from "@/store/server/dashboard/mutation";
import { useInfiniteScrollObserver } from "@/hooks/use-infinite-scroll-observer";
import { Link } from "@tanstack/react-router";
import { useMemo, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";

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
      { key: "engineRunTime", label: "Engine Run Time(Hrs)", minWidth: "144px" },
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
      { key: "chargingCurrent", label: "Charging Current (A)", minWidth: "144px" },
      { key: "solarOutputVolt", label: "Solar Output Volt(V)", minWidth: "144px" },
      { key: "solarOutputAmps", label: "Solar Output Amps (A)", minWidth: "148px" },
      { key: "dailyGeneratedEnergy", label: "Daily Generated Energy (kWh)", minWidth: "188px" },
      { key: "monthlyGeneratedEnergy", label: "Monthly Generated Energy(kWh)", minWidth: "200px" },
      { key: "totalGeneratedEnergy", label: "Total Generated Energy(kWh)", minWidth: "196px" },
      { key: "dailyLoadEnergy", label: "Daily Load Energy(kWh)", minWidth: "162px" },
      { key: "monthlyLoadEnergy", label: "Monthly Load Energy(kWh)", minWidth: "178px" },
      { key: "totalLoadEnergy", label: "Total Load Energy(kWh)", minWidth: "174px" },
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

export default function Dashboard() {
  const scrollRootRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useDeviceDetailInfinite(undefined, 20);

  useInfiniteScrollObserver({
    rootRef: scrollRootRef,
    targetRef: sentinelRef,
    enabled: Boolean(hasNextPage) && !isError,
    isLoading: Boolean(isFetchingNextPage),
    onLoadMore: () => fetchNextPage(),
    rootMargin: "250px",
    threshold: 0.1,
  });

  const devices = useMemo(() => {
    const pages = infiniteData?.pages ?? [];
    return pages.flatMap((p: any) => {
      const list = p?.devices ?? p?.data ?? [];
      return Array.isArray(list) ? list : [];
    });
  }, [infiniteData]);

  const totalSites = useMemo(() => {
    const first = infiniteData?.pages?.[0] as any | undefined;
    const total = first?.device_detail_count;
    return typeof total === "number" ? total : 0;
  }, [infiniteData]);

  const onlineCount = useMemo(
    () => devices.filter((d: any) => d?.status === true).length,
    [devices],
  );
  const offlineCount = useMemo(
    () => devices.filter((d: any) => d?.status === false).length,
    [devices],
  );

  const stats = useMemo(() => {
    const apiStats: DashboardStatsFromBackend = {
      totalSites,
      online: onlineCount,
      offline: offlineCount,
    };
    return mapStatsToDashboardItems(apiStats) as DashboardStatItem[];
  }, [totalSites, onlineCount, offlineCount]);

  return (
    <div>
      <h4 className="font-semibold">Dashboard</h4>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Stats
          </span>
        </div>
        <CardComponents stats={stats} className="rounded-xl bg-card/40" />
      </div>

      <div className="mt-5 text-sm overflow-hidden border border-border bg-card">
        <div className="flex items-center justify-between border-b bg-muted/60 px-3 py-2">
          <span className="text-sm font-medium text-muted-foreground">
            Site inventory table
          </span>
        </div>

        <div className="h-[520px]">
          <div
            ref={scrollRootRef}
            className="h-full w-full overflow-auto whitespace-nowrap"
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
                    const rmsId =
                      d?.rms_device_id ?? d?.id ?? d?.device_id ?? d?.rms_name;
                    const siteId =
                      rmsId !== undefined && rmsId !== null
                        ? String(rmsId)
                        : undefined;

                    const siteStatus =
                      typeof d?.status === "boolean"
                        ? d.status
                          ? "Online"
                          : "Offline"
                        : undefined;

                    const row: Record<string, string | number | undefined> = {
                      siteId,
                      viewDetail: siteId ? "View" : undefined,
                      lastUpdateTime: d?.last_update_time
                        ? String(d.last_update_time)
                        : undefined,
                      siteStatus,
                      powerSource: d?.power_source ?? d?.source_type ?? undefined,
                      powerModel: d?.source_type ?? undefined,
                    };

                    const siteIdDigits = Number(
                      String(siteId ?? "").replace(/\D/g, ""),
                    );
                    const chartId =
                      Number.isFinite(siteIdDigits) && siteIdDigits % 2 === 0
                        ? "2"
                        : "1";

                    return (
                      <TableRow key={siteId ?? rowIndex}>
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
                              {col.key === "viewDetail" ? (
                                siteId ? (
                                  <Link
                                    to="/chart/$id"
                                    params={{ id: chartId }}
                                    className="inline-flex items-center rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                  >
                                    View
                                  </Link>
                                ) : null
                              ) : (
                                (row[col.key] ?? "") as any
                              )}
                            </td>
                          )),
                        )}
                      </TableRow>
                    );
                  })}
                 
                </TableBody>
              </Table>
              <div ref={sentinelRef} className="h-1.5 flex items-center  justify-start w-full">
               <Spinner className=" dark:text-white text-black "/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

