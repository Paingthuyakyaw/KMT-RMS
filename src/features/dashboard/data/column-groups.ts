export type DashboardColumnMeta = {
  key: string;
  label: string;
  minWidth: string;
};

export type DashboardColumnGroup = {
  label: string;
  columns: DashboardColumnMeta[];
};

export const columnGroups: DashboardColumnGroup[] = [
  {
    label: "Site Info",
    columns: [
      { key: "siteId", label: "Site ID", minWidth: "72px" },
      { key: "rms_name_label", label: "Rms Name", minWidth: "82px" },
      { key: "viewDetail", label: "View Detail", minWidth: "88px" },
      { key: "logDetail", label: "Log Detail", minWidth: "88px" },
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
      { key: "dailyDgRh", label: "Daily DG RH ", minWidth: "108px" },
      { key: "dailyGridRh", label: "Daily Grid RH", minWidth: "108px" },
      { key: "cph", label: "CPH", minWidth: "42px" },
      { key: "lastActiveAlarm", label: "Last Active Alarm", minWidth: "128px" },
    ],
  },
];
