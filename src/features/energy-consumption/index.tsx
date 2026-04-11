import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { DatePickerWithRange } from "@/components/date-range";
import type { DateRange } from "react-day-picker";
import { Download, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  civilYmdLocalCalendar,
  dateRangeToApiDates,
  defaultDateRangeInTz,
} from "@/lib/app-timezone";
import { useTimezoneStore } from "@/store/client/timezone-store";
import { downloadCsv } from "@/lib/csv";
import { scrollWindowToBottom } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTweLog } from "@/store/server/log/query";
import useDebounce from "@/hooks/use-debounce";
import { useDeviceListSearch } from "@/store/server/device/query";
import type { Device } from "@/store/server/dashboard/typed";
import { Spinner } from "@/components/ui/spinner";
import { leafColumns } from "./constants";
import { buildEnergyRows, deviceOptionStub, toCellDisplay } from "./helpers";

function defaultDateRange(): DateRange {
  return defaultDateRangeInTz(useTimezoneStore.getState().timeZoneId);
}


export default function EnergyConsumption() {
  const timeZoneId = useTimezoneStore((s) => s.timeZoneId);
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedDate, setAppliedDate] = useState<DateRange | undefined>(
    defaultDateRange,
  );
  const [appliedDeviceId, setAppliedDeviceId] = useState<string | undefined>();
  const [appliedDeviceName, setAppliedDeviceName] = useState<string | undefined>();
  const [date, setDate] = useState<DateRange | undefined>(defaultDateRange);
  const [draftDeviceId, setDraftDeviceId] = useState<string | undefined>(undefined);
  const [draftDeviceName, setDraftDeviceName] = useState<string | undefined>(
    undefined,
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
  const [downloadDate, setDownloadDate] = useState<DateRange | undefined>(() =>
    defaultDateRangeInTz(useTimezoneStore.getState().timeZoneId),
  );

  const deviceList = deviceSearchData?.devices ?? [];

  const draftSelectedDevice = useMemo((): Device | null => {
    const raw = draftDeviceId?.trim();
    if (!raw) return null;
    const idNum = Number(raw);
    if (!Number.isFinite(idNum)) return null;
    const fromList = deviceList.find((d) => String(d.rms_device_id) === raw);
    if (fromList) return fromList;
    return deviceOptionStub(idNum, draftDeviceName?.trim() || raw);
  }, [draftDeviceId, draftDeviceName, deviceList]);

  const logPayload = useMemo(() => {
    const { from_date, to_date } = dateRangeToApiDates(appliedDate, timeZoneId);
    return {
      device_id: appliedDeviceId,
      from_date,
      to_date,
    };
  }, [appliedDate, appliedDeviceId, timeZoneId]);

  const { data } = useTweLog(logPayload);

  useEffect(() => {
    const next = defaultDateRangeInTz(timeZoneId);
    queueMicrotask(() => {
      setDate(next);
      setAppliedDate(next);
      setDownloadDate(next);
    });
  }, [timeZoneId]);

  const energyRows = useMemo(
    () => buildEnergyRows(data, appliedDeviceName, timeZoneId),
    [data, appliedDeviceName, timeZoneId],
  );

  const filteredRows = energyRows;

  const csvColumns = useMemo(
    () => leafColumns.map((c) => ({ key: c.key, label: c.label })),
    [],
  );

  return (
    <div className=" h-screen">
      <h4 className="font-semibold">Energy Consumption</h4>

      <div className="mt-5 text-sm overflow-hidden border border-border bg-card ">
        <div className="flex items-center justify-between border-b bg-muted/60 px-3 py-2">
          <span className="text-sm font-medium text-muted-foreground">
            Energy consumption report
          </span>
          <div className="flex items-center gap-2">
            <Popover
              open={filterOpen}
              onOpenChange={(open) => {
                setFilterOpen(open);
                if (open) {
                  setDate(appliedDate ? { ...appliedDate } : defaultDateRange());
                  setDraftDeviceId(appliedDeviceId);
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
                    <Label className="text-sm" htmlFor="energy-device-combobox">
                      Site Name
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
                          setDraftDeviceId(undefined);
                          setDraftDeviceName(undefined);
                          setDeviceSearchInput("");
                          return;
                        }
                        setDraftDeviceId(String(d.rms_device_id));
                        setDraftDeviceName(d.name);
                        setDeviceSearchInput(d.name);
                      }}
                    >
                      <ComboboxInput
                        id="energy-device-combobox"
                        placeholder="Search and select device"
                        showClear
                        className="h-9 w-full min-w-0 text-sm"
                      />
                      <ComboboxContent className="w-full">
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
                      className="h-9 px-3 text-sm"
                      type="button"
                      onClick={() => {
                        const next = defaultDateRange();
                        setDate(next);
                        setDraftDeviceId(undefined);
                        setDraftDeviceName(undefined);
                        setDeviceSearchInput("");
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      className="h-9 px-3 text-sm"
                      type="button"
                      onClick={() => {
                        setAppliedDate(date ? { ...date } : defaultDateRange());
                        setAppliedDeviceId(draftDeviceId);
                        setAppliedDeviceName(draftDeviceName);
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
                        const from =
                          downloadDate?.from
                            ? civilYmdLocalCalendar(downloadDate.from)
                            : "all";
                        const to =
                          downloadDate?.to
                            ? civilYmdLocalCalendar(downloadDate.to)
                            : "all";
                        downloadCsv({
                          filename: `energy-consumption_${from}_${to}.csv`,
                          columns: csvColumns as any,
                          rows: filteredRows,
                        });
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

        <ScrollArea className=" w-full whitespace-nowrap">
          <div className="min-w-max">
            <Table className="log-table bg-white w-max text-sm table-auto border-collapse dark:bg-muted!">
              <TableHeader className="text-xs uppercase bg-muted">
                {/* Header row 1 (rowspan/colspan groups) */}
                <TableRow className="sticky top-0 z-30 hover:bg-neutral-300 dark:hover:bg-muted bg-neutral-300 dark:bg-muted">
                  <TableHead
                    scope="col"
                    rowSpan={2}
                    className="px-4 py-3 font-medium border-border  sticky left-0 z-10 hover:bg-neutral-300! dark:hover:bg-muted bg-neutral-300 dark:bg-muted text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Site Name
                  </TableHead>
                  <TableHead
                    scope="col"
                    rowSpan={2}
                    className="px-4 py-3 font-medium border-border text-left"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Start Time
                  </TableHead>
                  <TableHead
                    scope="col"
                    rowSpan={2}
                    className="px-4 py-3 font-medium border-border text-left"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    End Time
                  </TableHead>
                  <TableHead
                    scope="col"
                    rowSpan={2}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Period (Days)
                  </TableHead>

                  <TableHead
                    scope="col"
                    colSpan={4}
                    className="px-4 py-3 font-medium border-border text-center"
                  >
                    DG Run Hours
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={4}
                    className="px-4 py-3 font-medium border-border text-center"
                  >
                    Grid Run Hours
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={4}
                    className="px-4 py-3 font-medium border-border text-center"
                  >
                    Battery Run Hours
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={4}
                    className="px-4 py-3 font-medium border-border text-center"
                  >
                    Solar Run Hours
                  </TableHead>

                  <TableHead
                    scope="col"
                    rowSpan={2}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Total Run Hr per days
                  </TableHead>

                  <TableHead
                    scope="col"
                    colSpan={3}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    DG kWh
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={3}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Grid kWh
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={3}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Battery kWh
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={3}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Solar Generated kWh
                  </TableHead>
                  <TableHead
                    scope="col"
                    colSpan={3}
                    className="px-4 py-3 font-medium border-border text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Solar Load kWh
                  </TableHead>
                </TableRow>

                {/* Header row 2 (leaf columns) */}
                <TableRow className="sticky top-9 hover:bg-neutral-300 dark:hover:bg-muted bg-neutral-300 z-20 dark:bg-muted">
                  {/* DG */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="px-4 py-3 border-border text-center"
                  >
                    DGRH Per Day
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="px-4 py-3 border-border text-center"
                  >
                    DG Total Run Hr
                  </TableHead>

                  {/* Grid */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Grid RH Per Day
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Grid Total Run Hr
                  </TableHead>

                  {/* Battery */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Battery RH Per Day
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Battery Total Run Hr
                  </TableHead>

                  {/* Solar */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Solar RH Per Day
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Solar Total Run Hr
                  </TableHead>

                  {/* DG kWh */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    DG KWH Per Day
                  </TableHead>

                  {/* Grid kWh */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Grid KWH Per Day
                  </TableHead>

                  {/* Battery kWh */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Battery KWH Per Day
                  </TableHead>

                  {/* Solar Generated kWh */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Solar KWH Per Day
                  </TableHead>

                  {/* Solar Load kWh */}
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Start
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    End
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-3 border-border text-center">
                    Solar Load Per Day
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredRows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {leafColumns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={
                          col.key === "siteName"
                            ? "sticky left-0 z-10 bg-muted text-center"
                            : "text-center"
                        }
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {toCellDisplay(row[col.key])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}