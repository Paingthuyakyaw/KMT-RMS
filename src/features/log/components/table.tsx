import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
 
export const LOG_LEAF_COLUMN_KEYS = [
    "deviceName",
    "lastUpdatedAt",
    "sourceModel",
    "powerSource",
    "roomTemp",
    "battVoltageV",
    "battCurrentA",
    "socPercent",
    "rectifierCurrent",

    "tenant1Load",
    "tenant1Power",
    "tenant2Load",
    "tenant2Power",
    "tenant3Load",
    "tenant3Power",
    "tenant4Load",
    "tenant4Power",

    "fuelLevelLiters",
    "cph",
    "dgrhHrs",
    "dailyDgrh",
    "gridRunTimeHrs",
    "battRunTimeHrs",
    "gensetKwh",
    "mode",
    "gensetL1V",
    "gensetL2V",
    "gensetL3V",
    "gensetL1A",
    "gensetL2A",
    "gensetL3A",
    "dgbVoltage",
    "chargeVoltage",
    "oilBar",
    "engineTemp",
    "engineFq",
    "gridL1V",
    "gridL2V",
    "gridL3V",
    "gridL1A",
    "gridL2A",
    "gridL3A",
    "gridFq",
    "gridKwh",
    "pv1InputV",
    "pv2InputV",
    "pv3InputV",
    "pv4InputV",
    "pv1CurrentA",
    "pv2CurrentA",
    "pv3CurrentA",
    "pv4CurrentA",
    "batteryTempC",
    "chargingCurrentA",
    "battVoltage2",
    "loadCurrentA",
    "dailyGeneratedEnergyKwh",
    "dailyGeneratedHourHrs",
    "monthlyGeneratedEnergyKwh",
    "monthlyGeneratedHourHrs",
    "totalGeneratedEnergyKwh",
    "dailyLoadEnergyKwh",
    "monthlyLoadEnergyKwh",
    "totalLoadEnergyKwh",
  ] as const;

export type LogRow = Record<(typeof LOG_LEAF_COLUMN_KEYS)[number], string | number>;

const leafColumnCount = LOG_LEAF_COLUMN_KEYS.length;
const tenantColumns = [
    { groupLabel: "Tenant 1(Mytel)" },
    { groupLabel: "Tenant 2(ATOM)" },
    { groupLabel: "Tenant 3(OML)" },
    { groupLabel: "Tenant 4(MPT)" },
  ];

// Demo rows (replace with API response later)
export const LOG_DEMO_ROWS: LogRow[] = [
    {
      deviceName: "YN5401",
      lastUpdatedAt: "2026-03-19 09:10",
      sourceModel: "Hybrid",
      powerSource: "Site On Grid",
      roomTemp: "28.5",
      battVoltageV: "48.2",
      battCurrentA: "12.4",
      socPercent: "76",
      rectifierCurrent: "3.2",
      tenant1Load: "1.20",
      tenant1Power: "240",
      tenant2Load: "0.90",
      tenant2Power: "180",
      tenant3Load: "0.75",
      tenant3Power: "150",
      tenant4Load: "0.60",
      tenant4Power: "120",
      fuelLevelLiters: "68",
      cph: "410",
      dgrhHrs: "32",
      dailyDgrh: "8",
      gridRunTimeHrs: "21",
      battRunTimeHrs: "6",
      gensetKwh: "124.5",
      mode: "Manual",
      gensetL1V: "396",
      gensetL2V: "398",
      gensetL3V: "401",
      gensetL1A: "12.1",
      gensetL2A: "11.8",
      gensetL3A: "12.0",
      dgbVoltage: "404",
      chargeVoltage: "56.1",
      oilBar: "86",
      engineTemp: "88",
      engineFq: "50.0",
      gridL1V: "401",
      gridL2V: "399",
      gridL3V: "402",
      gridL1A: "10.5",
      gridL2A: "10.2",
      gridL3A: "10.4",
      gridFq: "50.01",
      gridKwh: "345.2",
      pv1InputV: "210",
      pv2InputV: "211",
      pv3InputV: "209",
      pv4InputV: "208",
      pv1CurrentA: "7.8",
      pv2CurrentA: "7.5",
      pv3CurrentA: "7.3",
      pv4CurrentA: "7.1",
      batteryTempC: "32",
      chargingCurrentA: "13.2",
      battVoltage2: "48.0",
      loadCurrentA: "2.1",
      dailyGeneratedEnergyKwh: "48.6",
      dailyGeneratedHourHrs: "7.2",
      monthlyGeneratedEnergyKwh: "310.4",
      monthlyGeneratedHourHrs: "29.5",
      totalGeneratedEnergyKwh: "12345",
      dailyLoadEnergyKwh: "22.1",
      monthlyLoadEnergyKwh: "980.2",
      totalLoadEnergyKwh: "45678",
    },
    {
      deviceName: "YN5402",
      lastUpdatedAt: "2026-03-19 09:11",
      sourceModel: "Grid",
      powerSource: "Site On DG",
      roomTemp: "26.9",
      battVoltageV: "47.6",
      battCurrentA: "9.3",
      socPercent: "62",
      rectifierCurrent: "2.7",
      tenant1Load: "1.05",
      tenant1Power: "210",
      tenant2Load: "0.80",
      tenant2Power: "160",
      tenant3Load: "0.70",
      tenant3Power: "140",
      tenant4Load: "0.55",
      tenant4Power: "110",
      fuelLevelLiters: "54",
      cph: "399",
      dgrhHrs: "40",
      dailyDgrh: "10",
      gridRunTimeHrs: "18",
      battRunTimeHrs: "9",
      gensetKwh: "98.7",
      mode: "Auto",
      gensetL1V: "392",
      gensetL2V: "393",
      gensetL3V: "395",
      gensetL1A: "10.9",
      gensetL2A: "10.7",
      gensetL3A: "10.8",
      dgbVoltage: "402",
      chargeVoltage: "55.3",
      oilBar: "79",
      engineTemp: "91",
      engineFq: "50.02",
      gridL1V: "398",
      gridL2V: "397",
      gridL3V: "399",
      gridL1A: "9.7",
      gridL2A: "9.5",
      gridL3A: "9.6",
      gridFq: "50.00",
      gridKwh: "290.0",
      pv1InputV: "205",
      pv2InputV: "204",
      pv3InputV: "203",
      pv4InputV: "202",
      pv1CurrentA: "6.9",
      pv2CurrentA: "6.7",
      pv3CurrentA: "6.5",
      pv4CurrentA: "6.4",
      batteryTempC: "30",
      chargingCurrentA: "10.8",
      battVoltage2: "47.5",
      loadCurrentA: "1.9",
      dailyGeneratedEnergyKwh: "39.2",
      dailyGeneratedHourHrs: "6.6",
      monthlyGeneratedEnergyKwh: "275.9",
      monthlyGeneratedHourHrs: "26.8",
      totalGeneratedEnergyKwh: "11987",
      dailyLoadEnergyKwh: "19.4",
      monthlyLoadEnergyKwh: "860.0",
      totalLoadEnergyKwh: "44110",
    },
  ];

export function LogTable({ rows }: { rows: LogRow[] }) {
  return (
    <ScrollArea className="h-full w-full whitespace-nowrap">
      <div className="min-w-max">
        <Table className="log-table bg-white w-max text-sm table-auto border-collapse dark:bg-muted">
          <TableHeader
            className="sticky bg-neutral-300 top-0 z-20 dark:bg-muted text-xs uppercase text-stone-800  dark:text-stone-200"
            style={{ fontSize: "12px" }}
          >
            <TableRow>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Device Name
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Last Updated At
              </TableHead>

              <TableHead
                scope="col"
                rowSpan={2}
                className="px-8 py-3  border-slate-50"
              >
                Source Model
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Power Source
              </TableHead>

              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Room Temp
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Batt Voltage(V)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Batt Current(A)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                SOC(%)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Rectifier Current
              </TableHead>

              {tenantColumns.map((t) => (
                <TableHead
                  key={t.groupLabel}
                  scope="col"
                  colSpan={2}
                  className="px-8 py-3 text-center  border-slate-50"
                >
                  {t.groupLabel}
                </TableHead>
              ))}

              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Fuel Level(Liters)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                CPH
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                DGRH(hrs)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Daily DGRH
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Grid Run Time(Hrs)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Batt Run Time(Hrs)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Genset (kWh)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Mode
              </TableHead>

              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Genset L1(V)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Genset L2(V)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Genset L3(V)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Genset L1(A)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Genset L2(A)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Genset L3(A)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                DGB Voltage
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Charge Voltage
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Oil Bar
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Engine Temp
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Engine FQ
              </TableHead>

              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Grid L1V
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Grid L2V
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Grid L3V
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Grid L1A
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Grid L2A
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Grid L3A
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Grid FQ
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Grid KWH
              </TableHead>

              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                PV1 Input(V)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                PV2 Input(V)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                PV3 Input(V)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                PV4 Input(V)
              </TableHead>

              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                PV1 Current(A)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                PV2 Current(A)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                PV3 Current(A)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                PV4 Current(A)
              </TableHead>

              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Battery Temp(*C)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Charging Current (A)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                BATT VOLTAGE2
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Load Current (A)
              </TableHead>

              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Daily Generated Energy (kWh)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Daily Generated Hour(Hrs)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Monthly Generated Energy(kWh)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Monthly Generated Hour(Hrs)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Total Generated Energy(kWh)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Daily Load Energy(kWh)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Monthly Load Energy(kWh)
              </TableHead>
              <TableHead
                scope="col"
                rowSpan={2}
                className="px-4 py-3  border-slate-50"
              >
                Total Load Energy(kWh)
              </TableHead>
            </TableRow>

            <TableRow style={{ fontSize: "12px" }}>
              {tenantColumns.flatMap((t) => [
                <TableHead
                  key={`${t.groupLabel}-load`}
                  scope="col"
                  className="px-4 py-3  border-slate-50"
                >
                  Load(A)
                </TableHead>,
                <TableHead
                  key={`${t.groupLabel}-watt`}
                  scope="col"
                  className="px-4 py-3  border-slate-50"
                >
                  Watt(W)
                </TableHead>,
              ])}
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {LOG_LEAF_COLUMN_KEYS.map((k) => (
                    <TableCell
                      key={k}
                      className="px-4 py-3  border-slate-50 text-sm text-center"
                      title={String(row[k] ?? "-")}
                    >
                      {String(row[k] ?? "-")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={leafColumnCount}
                  className="text-center py-6 text-sm text-muted-foreground"
                >
                  No Device Selected...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ScrollBar orientation="horizontal" />
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}