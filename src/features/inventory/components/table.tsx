import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DEFAULT_INVENTORY_COLUMNS,
  DEFAULT_COLUMN_ORDER,
} from "@/features/inventory/data/columns";

const COL_WIDTH = "160px";

type Row = Record<string, string | number>;

// Demo rows (replace with API later)
const demoRows: Row[] = [
  {
    siteTag: "SITE-001-NYC",
    latitude: "40.730610",
    longitude: "-73.935242",
    longLocation: "New York City, NY - Manhattan District, 5th Ave",
    regionName: "Northeast",
    remoteOfficeAddress: "100 Park Avenue, New York, NY 10178",
    officeLatitude: "40.75889",
    officeLongitude: "-73.98567",
    deviceName: "Device A",
    model: "Model X",
    address: "100 Park Ave",
    contact: "John Doe",
    team: "Team 1",
    carNo: "C-001",
    carModel: "Toyota",
    powerModel: "Hybrid",
    powerCoreCapacity: "500",
    powerCoreName: "Core A",
    batteryModel: "LFP-500",
    batterySN: "BAT-001",
    voltageRating: "48V",
    quantity: "10",
    batteryCapacity: "100",
    totalCapacity: "1000",
    rectifierBrand: "Brand R",
    rectifierQuantity: "2",
    rectifierSN: "REC-001",
    dgBrand: "Cummins",
    dgControllerBrand: "Deep Sea",
    dgControllerModel: "DSE-7320",
    dgControllerSN: "DG-001",
    rmsBrand: "Schneider",
    regionalManager: "Jane Smith",
    lastUpdatedTime: "2026-03-09 15:30",
    lastUpdatedBy: "admin",
    rmsSN: "RMS-001",
    batteryInstalledDate: "2024-01-15",
    rmsInstalledDate: "2024-01-15",
    warrantyEndDate: "2029-01-15",
  },
  {
    siteTag: "SITE-002-LAX",
    latitude: "34.052235",
    longitude: "-118.243683",
    longLocation: "Los Angeles, CA - Downtown, Wilshire Boulevard",
    regionName: "West Coast",
    remoteOfficeAddress: "1000 Wilshire Blvd, Los Angeles, CA 90017",
    officeLatitude: "34.05223",
    officeLongitude: "-118.24368",
    deviceName: "Device B",
    model: "Model Y",
    address: "1000 Wilshire Blvd",
    contact: "Jane Doe",
    team: "Team 2",
    carNo: "C-002",
    carModel: "Honda",
    powerModel: "Grid",
    powerCoreCapacity: "350",
    powerCoreName: "Core B",
    batteryModel: "NCM-350",
    batterySN: "BAT-002",
    voltageRating: "48V",
    quantity: "8",
    batteryCapacity: "80",
    totalCapacity: "800",
    rectifierBrand: "Brand S",
    rectifierQuantity: "2",
    rectifierSN: "REC-002",
    dgBrand: "Caterpillar",
    dgControllerBrand: "ComAp",
    dgControllerModel: "InteliGen NT",
    dgControllerSN: "DG-002",
    rmsBrand: "Siemens",
    regionalManager: "Bob Lee",
    lastUpdatedTime: "2026-03-10 10:00",
    lastUpdatedBy: "admin",
    rmsSN: "RMS-002",
    batteryInstalledDate: "2024-02-20",
    rmsInstalledDate: "2024-02-20",
    warrantyEndDate: "2029-02-20",
  },
  {
    siteTag: "SITE-003-CHI",
    latitude: "41.878113",
    longitude: "-87.629799",
    longLocation: "Chicago, IL - Loop District, Michigan Avenue",
    regionName: "Midwest",
    remoteOfficeAddress: "300 N Michigan Ave, Chicago, IL 60601",
    officeLatitude: "41.87811",
    officeLongitude: "-87.62979",
    deviceName: "Device C",
    model: "Model Z",
    address: "300 N Michigan Ave",
    contact: "Alice",
    team: "Team 1",
    carNo: "C-003",
    carModel: "Ford",
    powerModel: "Hybrid",
    powerCoreCapacity: "420",
    powerCoreName: "Core C",
    batteryModel: "LFP-420",
    batterySN: "BAT-003",
    voltageRating: "48V",
    quantity: "12",
    batteryCapacity: "90",
    totalCapacity: "900",
    rectifierBrand: "Brand T",
    rectifierQuantity: "3",
    rectifierSN: "REC-003",
    dgBrand: "Kohler",
    dgControllerBrand: "Woodward",
    dgControllerModel: "DSE-8610",
    dgControllerSN: "DG-003",
    rmsBrand: "ABB",
    regionalManager: "Carol Wu",
    lastUpdatedTime: "2026-03-11 08:00",
    lastUpdatedBy: "tech",
    rmsSN: "RMS-003",
    batteryInstalledDate: "2024-03-10",
    rmsInstalledDate: "2024-03-10",
    warrantyEndDate: "2029-03-10",
  },
  {
    siteTag: "SITE-004-HOU",
    latitude: "29.760427",
    longitude: "-95.369803",
    longLocation: "Houston, TX - Energy Corridor, Westheimer Road",
    regionName: "South Central",
    remoteOfficeAddress: "1000 Westheimer Rd, Houston, TX 77002",
    officeLatitude: "29.76042",
    officeLongitude: "-95.36980",
    deviceName: "Device D",
    model: "Model W",
    address: "1000 Westheimer Rd",
    contact: "Dave",
    team: "Team 2",
    carNo: "C-004",
    carModel: "Chevy",
    powerModel: "DG",
    powerCoreCapacity: "600",
    powerCoreName: "Core D",
    batteryModel: "NCM-600",
    batterySN: "BAT-004",
    voltageRating: "48V",
    quantity: "15",
    batteryCapacity: "120",
    totalCapacity: "1200",
    rectifierBrand: "Brand U",
    rectifierQuantity: "2",
    rectifierSN: "REC-004",
    dgBrand: "Generac",
    dgControllerBrand: "DEIF",
    dgControllerModel: "easYgen-3500",
    dgControllerSN: "DG-004",
    rmsBrand: "Honeywell",
    regionalManager: "Eve Kim",
    lastUpdatedTime: "2026-03-11 09:30",
    lastUpdatedBy: "admin",
    rmsSN: "RMS-004",
    batteryInstalledDate: "2024-04-05",
    rmsInstalledDate: "2024-04-05",
    warrantyEndDate: "2029-04-05",
  },
];

const InventoryTable = ({
  columnNameMap,
  columnOrder,
}: {
  columnNameMap: Record<string, string>;
  columnOrder: string[];
}) => {
  const byId = new Map(
    DEFAULT_INVENTORY_COLUMNS.map((c) => [
      c.id,
      { id: c.id, label: columnNameMap[c.id] || c.defaultLabel },
    ]),
  );

  const orderedIds =
    columnOrder.length > 0
      ? columnOrder.filter((id) => byId.has(id))
      : DEFAULT_COLUMN_ORDER;
  const missingIds = DEFAULT_COLUMN_ORDER.filter(
    (id) => !orderedIds.includes(id),
  );
  const finalOrder = [...orderedIds, ...missingIds];

  const columns = finalOrder.map((id) => ({
    id,
    label: byId.get(id)!.label,
    width: COL_WIDTH,
  }));

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-none">
      <ScrollArea className="h-130 w-full whitespace-nowrap">
        <div className="min-w-max">
          <Table className=" text-sm">
            <TableHeader>
              <TableRow className="bg-muted">
                {columns.map((col) => (
                  <TableHead
                    key={col.id}
                    className={
                      col.id === "siteTag"
                        ? "sticky left-0 z-20 bg-muted"
                        : undefined
                    }
                    style={{ minWidth: col.width, width: col.width }}
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoRows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      className={
                        col.id === "siteTag"
                          ? "sticky left-0 z-10 bg-background"
                          : undefined
                      }
                      style={{
                        minWidth: col.width,
                        width: col.width,
                        maxWidth: col.width,
                      }}
                      title={String(row[col.id] ?? "-")}
                    >
                      <span className="block truncate">
                        {String(row[col.id] ?? "-")}
                      </span>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};

export default InventoryTable;
