export type InventoryColumnDef = {
  id: string;
  defaultLabel: string;
  isDefault?: boolean;
};

/** Default column definitions. Order here = default display order. Backend can override later. */
export const DEFAULT_INVENTORY_COLUMNS: InventoryColumnDef[] = [
  { id: "siteTag", defaultLabel: "Site Tag", isDefault: true },
  { id: "powerModel", defaultLabel: "Power Model", isDefault: true },
  { id: "latitude", defaultLabel: "Latitude", isDefault: true },
  { id: "longitude", defaultLabel: "Longitude", isDefault: true },
  { id: "longLocation", defaultLabel: "Location", isDefault: true },
  { id: "regionName", defaultLabel: "Region Name", isDefault: true },
  { id: "remoteOfficeAddress", defaultLabel: "Remote Office Address", isDefault: true },
  { id: "officeLatitude", defaultLabel: "Office Latitude", isDefault: true },
  { id: "officeLongitude", defaultLabel: "Office Longitude", isDefault: true },
  { id: "deviceName", defaultLabel: "Device Name", isDefault: true },
  { id: "model", defaultLabel: "Model", isDefault: true },
  { id: "address", defaultLabel: "Address", isDefault: true },
  { id: "contact", defaultLabel: "Contact", isDefault: true },
  { id: "team", defaultLabel: "Team", isDefault: true },
  { id: "carNo", defaultLabel: "Car No", isDefault: true },
  { id: "carModel", defaultLabel: "Car Model", isDefault: true },
  { id: "powerCoreCapacity", defaultLabel: "Power Core Capacity", isDefault: true },
  { id: "powerCoreName", defaultLabel: "Power Core Name", isDefault: true },
  { id: "batteryModel", defaultLabel: "Battery Model", isDefault: true },
  { id: "batterySN", defaultLabel: "Battery SN", isDefault: true },
  { id: "voltageRating", defaultLabel: "Voltage Rating", isDefault: true },
  { id: "quantity", defaultLabel: "Quantity", isDefault: true },
  { id: "batteryCapacity", defaultLabel: "Battery Capacity", isDefault: true },
  { id: "totalCapacity", defaultLabel: "Total Capacity", isDefault: true },
  { id: "rectifierBrand", defaultLabel: "Rectifier Brand", isDefault: true },
  { id: "rectifierQuantity", defaultLabel: "Rectifier Quantity", isDefault: true },
  { id: "rectifierSN", defaultLabel: "Rectifier SN", isDefault: true },
  { id: "dgBrand", defaultLabel: "DG Brand", isDefault: true },
  { id: "dgControllerBrand", defaultLabel: "DG Controller Brand", isDefault: true },
  { id: "dgControllerModel", defaultLabel: "DG Controller Model", isDefault: true },
  { id: "dgControllerSN", defaultLabel: "DG Controller SN", isDefault: true },
  { id: "rmsBrand", defaultLabel: "RMS Brand", isDefault: true },
  { id: "regionalManager", defaultLabel: "Regional Manager", isDefault: true },
  { id: "lastUpdatedTime", defaultLabel: "Last Updated", isDefault: true },
  { id: "lastUpdatedBy", defaultLabel: "Updated By", isDefault: true },
  { id: "rmsSN", defaultLabel: "RMS SN", isDefault: true },
  { id: "batteryInstalledDate", defaultLabel: "Battery Installed", isDefault: true },
  { id: "rmsInstalledDate", defaultLabel: "RMS Installed", isDefault: true },
  { id: "warrantyEndDate", defaultLabel: "Warranty End", isDefault: true },
];

export const DEFAULT_COLUMN_ORDER = DEFAULT_INVENTORY_COLUMNS.map((c) => c.id);
