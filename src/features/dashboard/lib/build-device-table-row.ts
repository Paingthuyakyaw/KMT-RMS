export type DeviceTableRow = Record<string, string | number | undefined>;

export type DeviceTableRowModel = {
  rowKey: string | number;
  siteId: string | undefined;
  chartId: string;
  /** `/log?rms_device_id=` */
  logRmsDeviceId: string | undefined;
  /** `/log?device_name=` */
  logDeviceName: string | undefined;
  row: DeviceTableRow;
};

function latestByVariableNameFromJson(jsonPoints: unknown[]): Record<string, any> {
  return jsonPoints.reduce((acc: Record<string, any>, p: any) => {
    const variableName = p?.variableName;
    if (!variableName) return acc;
    const prev = acc[variableName];
    const prevTime = typeof prev?.time === "number" ? prev.time : -Infinity;
    const nextTime = typeof p?.time === "number" ? p.time : -Infinity;
    acc[variableName] =
      prev === undefined || nextTime >= prevTime ? p : prev;
    return acc;
  }, {});
}

function normalizeValue(v: unknown): string | number | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "number") return v;
  if (typeof v === "string") return v;
  if (Array.isArray(v)) {
    const first = v[0] as any;
    if (first && typeof first === "object" && "value" in first) {
      return normalizeValue((first as any).value);
    }
    return v.length ? String(v[0]) : undefined;
  }
  if (typeof v === "object") {
    const maybeValue = (v as any)?.value;
    if (maybeValue !== undefined) return normalizeValue(maybeValue);
  }
  return String(v);
}

/** JSON metric value 0 → Offline, 1 → Online (DG / Cabinet columns). */
function mapZeroOneToOnlineOffline(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "boolean") return v ? "Online" : "Offline";
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  if (n === 0) return "Offline";
  if (n === 1) return "Online";
  return undefined;
}

/** Chart route id — preserved from dashboard parity logic */
function chartIdForSiteId(siteId: string | undefined): string {
  const siteIdDigits = Number(String(siteId ?? "").replace(/\D/g, ""));
  return Number.isFinite(siteIdDigits) && siteIdDigits % 2 === 0 ? "2" : "1";
}

export function getDeviceTableRowModel(
  d: any,
  rowIndex: number,
): DeviceTableRowModel {
  const rmsId = d?.name ?? d?.id;
  const siteId =
    rmsId !== undefined && rmsId !== null ? String(rmsId) : undefined;

  const logRmsDeviceId =
    d?.rms_device_id != null && String(d.rms_device_id).trim() !== ""
      ? String(d.rms_device_id)
      : undefined;
  const logDeviceNameRaw =
    d?.rms_name_label ?? d?.rms_name ?? d?.name ?? siteId;
  const logDeviceName =
    logDeviceNameRaw != null && String(logDeviceNameRaw).trim() !== ""
      ? String(logDeviceNameRaw)
      : undefined;

  const siteStatus =
    typeof d?.status === "boolean"
      ? d.status
        ? "Online"
        : "Offline"
      : undefined;

  const jsonPoints: any[] = Array.isArray(d?.json) ? d.json : [];
  const latestByVariableName = latestByVariableNameFromJson(jsonPoints);

  const getLatestValue = (variableName: string) =>
    normalizeValue(latestByVariableName[variableName]?.value);

  const getLatestValueByRegex = (regex: RegExp) => {
    for (const [vn, p] of Object.entries(latestByVariableName)) {
      if (regex.test(vn)) return normalizeValue((p as any)?.value);
    }
    return undefined;
  };

  const row: DeviceTableRow = {
    siteId,
    rms_name_label: d?.rms_name_label ?? d?.rms_name ?? d?.name ?? undefined,
    viewDetail: siteId ? "View" : undefined,
    lastUpdateTime: d?.last_update_time
      ? String(d.last_update_time)
      : undefined,
    siteStatus,
    powerModel: d?.source_type
      ? d.source_type
          .split(",")
          .map((s: string) => s.trim())
          .map((s: string) => {
            if (s === "solar") return "Solar";
            if (s === "dg") return "DG";
            if (s === "battery") return "Battery";
            if (s === "grid") return "Grid";
            return s;
          })
          .join(" + ")
      : undefined,
    powerSource: d?.powerSource ?? undefined,

    pv1Input: getLatestValue("PV1_Input_Volt"),
    pv2Input: getLatestValue("PV2_Input_Volt"),
    pv3Input: getLatestValue("PV3_Input_Volt"),
    pv4Input: getLatestValue("PV4_Input_Volt"),

    pv1Current:
      getLatestValue("PV1_Current") ??
      getLatestValueByRegex(/^PV1_.*Input_.*(Amp|Curr|Current)$/i),
    pv2Current:
      getLatestValue("PV2_Current") ??
      getLatestValueByRegex(/^PV2_.*Input_.*(Amp|Curr|Current)$/i),
    pv3Current:
      getLatestValue("PV3_Current") ??
      getLatestValueByRegex(/^PV3_.*Input_.*(Amp|Curr|Current)$/i),
    pv4Current:
      getLatestValue("PV4_Current") ??
      getLatestValueByRegex(/^PV4_.*Input_.*(Amp|Curr|Current)$/i),

    battVoltage: getLatestValue("Battery_Voltage"),
    battCurrent: getLatestValue("Battery_Current"),
    roomTemp: getLatestValue("Room_Temp"),
    batteryTemp: getLatestValue("Battery_Temp"),
    rectifierCurrent: getLatestValue("Total_Rec_Current"),
    SOC: getLatestValue("SOC"),
    dgbVoltage : getLatestValue("DG_Starter_Battery"),
    Fuel_Level : getLatestValue("Fuel_Level"), 
    chargeVoltage : getLatestValue("Charge Alternator Voltage"),   
    // dgrhHrs : getLatestValue("Engine_Run_Hours")  ,
    gensetEnergy : getLatestValue("Generator_KWH"),
    dailyDgRh : getLatestValue("Daily_DGRH"),
    dgStatus: mapZeroOneToOnlineOffline(getLatestValue("DG_Status")),
    chargingCurrent:
      getLatestValue("Charging_Current") ??
      getLatestValueByRegex(/^Charging_.*Current$/i),
    solarOutputVolt:
      getLatestValue("Solar_Output_Volt") ??
      getLatestValue("Solar_Output_Voltage") ??
      getLatestValueByRegex(/Solar_.*Output_.*Volt/i),
    solarOutputAmps:
      getLatestValue("Solar_Output_Amp") ??
      getLatestValue("Solar_Output_Amps") ??
      getLatestValue("Solar_Output_Current") ??
      getLatestValueByRegex(/Solar_.*Output_.*(Amp|Amps|Current)/i),

    loadCurrent: getLatestValue("Load_Current"),

    dailyGeneratedEnergy: getLatestValueByRegex(/^Daily_Generated_Energy/i),
    monthlyGeneratedEnergy: getLatestValueByRegex(/^Monthly_Generated_Energy/i),
    totalGeneratedEnergy: getLatestValue("Total_Generated_Energy"),

    dailyLoadEnergy: getLatestValueByRegex(/^Daily_Load_Energy/i),
    monthlyLoadEnergy: getLatestValueByRegex(/^Monthly_Load_Energy/i),
    totalLoadEnergy: getLatestValueByRegex(/^Total_Load_Energy/i),
    cph : getLatestValue("CPH"),
    tenant2Power : getLatestValue("Operator2_Watt"),
    tenant2Load : getLatestValue("Operator2_Load"),
    cabinetStatus: mapZeroOneToOnlineOffline(
      getLatestValue("Cabinet_Status") ?? getLatestValue("Cabinet_Door_Alarm"),
    ),
    gridFQ : getLatestValue("Grid Frequency"),
    DG_Starter_Battery : getLatestValue("DG_Starter_Battery"),
    oilBar : getLatestValue("Oil_Pressure")
  };

  return {
    rowKey: siteId ?? rowIndex,
    siteId,
    chartId: chartIdForSiteId(siteId),
    logRmsDeviceId,
    logDeviceName,
    row,
  };
}
