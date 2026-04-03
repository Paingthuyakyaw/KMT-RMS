import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePickerWithRange } from "@/components/date-range";
import type { DateRange } from "react-day-picker";
import { useTimezoneStore } from "@/store/client/timezone-store";
import {
  dateRangeToApiDates,
  defaultDateRangeInTz,
} from "@/lib/app-timezone";
import { Download, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import useDebounce from "@/hooks/use-debounce";
import { useDeviceListSearch } from "@/store/server/device/query";
import { useLog, type LogQueryPayload } from "@/store/server/log/query";
import {
  LogTable,
  type LogRow,
} from "./components/table";
import type { logProps } from "@/store/server/log/typed";
import type { Device } from "@/store/server/dashboard/typed";
import { Spinner } from "@/components/ui/spinner";
import { scrollWindowToBottom } from "@/lib/utils";

const extractScalar = (v: unknown): string | number | null => {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") {
    const trimmed = v.trim();
    // Some backends return JSON encoded strings for values.
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return extractScalar(JSON.parse(trimmed));
      } catch {
        // Not a JSON string; fall through.
      }
    }
    return v;
  }
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (Array.isArray(v)) return extractScalar(v[0]);
  if (typeof v === "object") {
    const obj = v as Record<string, unknown>;
    if ("value" in obj) return extractScalar(obj.value);
    const keys = Object.keys(obj);
    if (keys.length === 1) return extractScalar(obj[keys[0]]);
    return JSON.stringify(obj);
  }
  return String(v);
};

const toCell = (v: unknown): string | number => {
  const s = extractScalar(v);
  return s === null ? "-" : s;
};

function normalizeRmsId(raw?: string): string | undefined {
  const t = raw?.trim().replace(/^["']|["']$/g, "");
  return t || undefined;
}

function defaultDateRange(): DateRange {
  return defaultDateRangeInTz(useTimezoneStore.getState().timeZoneId);
}

/** Minimal `Device` for combobox when URL has id + name but list is not loaded yet. */
function deviceOptionStub(rms_device_id: number, name: string): Device {
  return {
    id: 0,
    name,
    device_id: 0,
    rms_device_id,
    last_active_alarm: "",
    last_update_time: "",
    source_type: "",
    status: false,
    alarm_status: false,
    external_url: "",
    access_device_url: false,
    project_name: "",
    power_source: "",
    battery_backup_value: "",
    rms_name: "",
    rms_name_label: "",
    json: [],
  };
}

export function LogComponent({
  rmsDeviceIdFromSearch,
  deviceNameFromSearch,
}: {
  rmsDeviceIdFromSearch?: string;
  deviceNameFromSearch?: string;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterOpen, setFilterOpen] = useState(false);

  /** Committed filters (drive `useLog` + table). Synced from URL when route search changes. */
  const [appliedDate, setAppliedDate] = useState<DateRange | undefined>(
    defaultDateRange,
  );
  const [appliedRmsId, setAppliedRmsId] = useState<string | undefined>(() =>
    normalizeRmsId(rmsDeviceIdFromSearch),
  );
  const [appliedDeviceName, setAppliedDeviceName] = useState<
    string | undefined
  >(() => deviceNameFromSearch?.trim() || undefined);

  /** Draft values edited inside the filter popover until Apply. */
  const [date, setDate] = useState<DateRange | undefined>(defaultDateRange);
  const [draftRmsId, setDraftRmsId] = useState<string | undefined>(undefined);
  const [draftDeviceName, setDraftDeviceName] = useState<string | undefined>(
    undefined,
  );

  const timeZoneId = useTimezoneStore((s) => s.timeZoneId);

  const [downloadDate, setDownloadDate] = useState<DateRange | undefined>(() =>
    defaultDateRangeInTz(useTimezoneStore.getState().timeZoneId),
  );

  const [deviceSearchInput, setDeviceSearchInput] = useState("");
  const { debounced: debouncedDeviceName } = useDebounce({
    value: deviceSearchInput,
  });
  const { data: deviceSearchData, isFetching: deviceSearchLoading } =
    useDeviceListSearch(
      { name: debouncedDeviceName },
      { enabled: filterOpen },
    );

  useEffect(() => {
    setAppliedRmsId(normalizeRmsId(rmsDeviceIdFromSearch));
    const name = deviceNameFromSearch?.trim();
    setAppliedDeviceName(name || undefined);
  }, [rmsDeviceIdFromSearch, deviceNameFromSearch]);

  useEffect(() => {
    const next = defaultDateRangeInTz(timeZoneId);
    queueMicrotask(() => setDownloadDate(next));
  }, [timeZoneId]);

  const deviceList = deviceSearchData?.devices ?? [];

  const draftSelectedDevice = useMemo((): Device | null => {
    const raw = draftRmsId?.trim();
    if (!raw) return null;
    const idStr = raw.replace(/^["']|["']$/g, "");
    const idNum = Number(idStr);
    if (!Number.isFinite(idNum)) return null;
    const fromList = deviceList.find(
      (d) => String(d.rms_device_id) === idStr,
    );
    if (fromList) return fromList;
    const label = draftDeviceName?.trim() || idStr;
    return deviceOptionStub(idNum, label);
  }, [draftRmsId, draftDeviceName, deviceList]);

  const logPayload: LogQueryPayload = useMemo(() => {
    const { from_date, to_date } = dateRangeToApiDates(
      appliedDate,
      timeZoneId,
    );
    return {
      from_date,
      to_date,
      rms_device_id: normalizeRmsId(appliedRmsId),
    };
  }, [appliedDate, appliedRmsId, timeZoneId]);

  const { data: apiLogs } = useLog(logPayload, { page: 1, limit: 30 });

  const mappedRows: LogRow[] = useMemo(() => {
    const logs = (Array.isArray(apiLogs) ? apiLogs : []) as logProps[];
    return logs.map((log) => {
      return {
        deviceName: String(
          extractScalar( appliedDeviceName ),
        ),
        lastUpdatedAt: String(
          extractScalar(log.last_updated_at ?? log.last_time) ?? "-",
        ),
        sourceModel: String(""),
        powerSource: String(
           "",
        ),
        roomTemp: toCell(log.room_temp),
        battVoltageV: toCell(log.batt_voltage_v),
        battCurrentA: toCell(log.batt_current_a),
        socPercent: toCell(log.soc),
        rectifierCurrent: toCell(log.rectifier_current),

        tenant1Load: toCell(log.tenant_1_a_value ?? log.tenant_1_a),
        tenant1Power: toCell(log.tenant_1_w),
        tenant2Load: toCell(log.tenant_2_a),
        tenant2Power: toCell(log.tenant_2_w),
        tenant3Load: toCell(log.tenant_3_a),
        tenant3Power: toCell(log.tenant_3_w),
        tenant4Load: toCell(log.tenant_4_a),
        tenant4Power: toCell(log.tenant_4_w),

        fuelLevelLiters: extractScalar(
          log.fuel_level_litre ?? log.fuel_level_litre,
        ) as string,
        cph: toCell(log.cph),
        dgrhHrs: toCell(log.dgrh_value ?? log.dgrh),
        dailyDgrh: toCell(log.daily_dgrh),
        gridRunTimeHrs: toCell(log.grid_run_time_hrs),
        battRunTimeHrs: toCell(log.batt_run_time_hrs),
        gensetKwh: toCell(log.gunset_kwh),
        mode: toCell(log.mode ?? log.auto_mode),

        gensetL1V: toCell(log.genset_l1_v),
        gensetL2V: toCell(log.genset_l2_v),
        gensetL3V: toCell(log.genset_l3_v),
        gensetL1A: toCell(log.genset_l1_a),
        gensetL2A: toCell(log.genset_l2_a),
        gensetL3A: toCell(log.genset_l3_a),

        dgbVoltage: toCell(log.dgb_voltage),
        chargeVoltage: toCell(log.charge_voltage),
        oilBar: toCell(log.oil_bar),
        engineTemp: toCell(log.engine_temp),
        engineFq: toCell(log.engine_fq),

        gridL1V: toCell(log.grid_l1_v),
        gridL2V: toCell(log.grid_l2_v),
        gridL3V: toCell(log.grid_l3_v),
        gridL1A: toCell(log.grid_l1_a),
        gridL2A: toCell(log.grid_l2_a),
        gridL3A: toCell(log.grid_l3_a),
        gridFq: toCell(log.grid_fq),
        gridKwh: toCell(log.grid_kwh),

        pv1InputV: toCell(log.pv1_input_v),
        pv2InputV: toCell(log.pv2_input_v),
        pv3InputV: toCell(log.pv3_input_v),
        pv4InputV: toCell(log.pv4_input_v),
        pv1CurrentA: toCell(log.pv1_current),
        pv2CurrentA: toCell(log.pv2_current),
        pv3CurrentA: toCell(log.pv3_current),
        pv4CurrentA: toCell(log.pv4_current),

        batteryTempC: toCell(log.battery_temp),
        chargingCurrentA: toCell(log.charging_current),
        // battVoltage2: toCell(log.batt_voltage_v),
        battVoltage2 : "",
        loadCurrentA: toCell(log.load_current),

        dailyGeneratedEnergyKwh: toCell(log.daily_generated_energy),
        dailyGeneratedHourHrs: toCell(log.daily_generated_hour),
        monthlyGeneratedEnergyKwh: toCell(log.monthly_generated_energy),
        monthlyGeneratedHourHrs: toCell(log.monthly_generated_hour),
        totalGeneratedEnergyKwh: toCell(log.total_generated_energy),

        dailyLoadEnergyKwh: toCell(log.daily_load_energy),
        monthlyLoadEnergyKwh: toCell(log.monthly_load_energy),
        totalLoadEnergyKwh: toCell(log.total_load_energy),
      }
    })
  }, [apiLogs, appliedDeviceName])

  return (
    <div className="h-screen">
      <h4 className="font-semibold">Device Detail Log</h4>

      <div className="mt-5 text-sm overflow-hidden border border-border bg-card ">
        <div className="flex items-center justify-between border-b bg-muted/60 px-3 py-2">
          <span className="text-sm font-medium text-muted-foreground">
            Device log table
          </span>

          <div className="flex items-center gap-2">
            <Popover
              open={filterOpen}
              onOpenChange={(open) => {
                setFilterOpen(open);
                if (open) {
                  setDate(
                    appliedDate
                      ? { ...appliedDate }
                      : defaultDateRange(),
                  );
                  setDraftRmsId(appliedRmsId);
                  setDraftDeviceName(appliedDeviceName);
                  setDeviceSearchInput(appliedDeviceName ?? "");
                }
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
              <PopoverContent
                className="w-72 gap-0 p-3"
                align="end"
                sideOffset={8}
              >
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-semibold leading-none text-foreground">
                    Filter Options
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm" htmlFor="log-device-combobox">
                      Device
                    </Label>
                    <Combobox
                      filter={null}
                      items={deviceList}
                      value={draftSelectedDevice}
                      itemToStringLabel={(d) => d.name}
                      itemToStringValue={(d) => String(d.rms_device_id)}
                      isItemEqualToValue={(a, b) =>
                        a.rms_device_id === b.rms_device_id
                      }
                      inputValue={deviceSearchInput}
                      onInputValueChange={(v) => setDeviceSearchInput(v)}
                      onValueChange={(d) => {
                        if (d == null) {
                          setDraftRmsId(undefined);
                          setDraftDeviceName(undefined);
                          setDeviceSearchInput("");
                          return;
                        }
                        setDraftRmsId(String(d.rms_device_id));
                        setDraftDeviceName(d.name);
                        setDeviceSearchInput(d.name);
                      }}
                    >
                      <ComboboxInput
                        id="log-device-combobox"
                        placeholder="Search and select device"
                        showClear
                        className="w-full h-9 min-w-0"
                      />
                      <ComboboxContent className=" w-full ">
                        {deviceSearchLoading ? (
                          <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                            <Spinner className="size-3.5" />
                            Loading…
                          </div>
                        ) : (
                          <>
                            <ComboboxEmpty>
                              {debouncedDeviceName.trim().length >= 1
                                ? "No devices found."
                                : "Type to search devices."}
                            </ComboboxEmpty>
                            <ComboboxList>
                              {(device: Device) => (
                                <ComboboxItem
                                  key={device.rms_device_id}
                                  value={device}
                                >
                                  {device.name}
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                          </>
                        )}
                      </ComboboxContent>
                    </Combobox>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">Date Range</Label>
                    <DatePickerWithRange date={date} setDate={setDate} />
                  </div>

                  <div className="flex justify-end gap-2 border-t border-border/70 pt-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-xs"
                      type="button"
                      onClick={() => {
                        const next = defaultDateRange();
                        setDate(next);
                        setDraftRmsId(undefined);
                        setDraftDeviceName(undefined);
                        setDeviceSearchInput("");
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 px-3 text-xs"
                      type="button"
                      onClick={() => {
                        setAppliedDate(date ? { ...date } : defaultDateRange());
                        setAppliedRmsId(draftRmsId);
                        setAppliedDeviceName(draftDeviceName);
                        const rid = normalizeRmsId(draftRmsId);
                        if (rid) {
                          const dn = draftDeviceName?.trim();
                          void navigate({
                            to: "/log",
                            search: {
                              rms_device_id: rid,
                              ...(dn ? { device_name: dn } : {}),
                            },
                          });
                        } else {
                          void navigate({ to: "/log", search: {} });
                        }
                        void queryClient.invalidateQueries({
                          queryKey: ["log"],
                        });
                        setFilterOpen(false);
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 px-2 text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="end" sideOffset={8}>
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-foreground">
                    Select date range to download
                  </div>
                  <DatePickerWithRange
                    date={downloadDate}
                    setDate={setDownloadDate}
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() => {
                       
                   
                      }}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="">
          <LogTable rows={mappedRows} />
        </div>
      </div>
    </div>
  );
}