import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BatteryWarning,
  Building2,
  Cpu,
  Flame,
  Gauge,
  OctagonAlert,
  PowerOff,
  Sun,
  Wifi,
  Zap,
  Box,
  CircleOff,
  DoorOpen,
  Settings2,
  OctagonPause,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Daum } from "@/store/server/dashboard/typed";

/**
 * Dashboard card values — keys match STAT_CONFIG order / master info mapping.
 */
export type DashboardStatsFromBackend = {
  totalSites?: number;
  online?: number;
  offline?: number;
  dgOffline?: number;
  cabinetOffline?: number;
  solarOffline?: number;
  ioCardOffline?: number;
  battLowAlarm?: number;
  mainsFailAlarm?: number;
  highDgrhAlarm?: number;
  majorAlarm?: number;
  minorAlarm?: number;
  criticalAlarm?: number;
  criticalSiteAlarm?: number;
  cabinetDoorAlarm?: number;
  dgDoorAlarm?: number;
  autoMode?: number;
  manualMode?: number;
  stopMode?: number;
};

const STAT_CONFIG: Array<{
  key: keyof DashboardStatsFromBackend;
  label: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}> = [
  {
    key: "totalSites",
    label: "Total Sites",
    icon: Building2,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    key: "online",
    label: "Online",
    icon: Wifi,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    key: "offline",
    label: "Offline",
    icon: CircleOff,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    key: "dgOffline",
    label: "DG Offline",
    icon: PowerOff,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  {
    key: "cabinetOffline",
    label: "Cabinet Offline",
    icon: Box,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
  {
    key: "solarOffline",
    label: "Solar Offline",
    icon: Sun,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    key: "ioCardOffline",
    label: "IO Card Offline",
    icon: Cpu,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    key: "battLowAlarm",
    label: "Batt Low Alarm",
    icon: BatteryWarning,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    key: "mainsFailAlarm",
    label: "Mains Fail Alarm",
    icon: Zap,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    key: "highDgrhAlarm",
    label: "High DGRH Alarm",
    icon: Gauge,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    key: "majorAlarm",
    label: "Major Alarm",
    icon: Flame,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    key: "minorAlarm",
    label: "Minor Alarm",
    icon: AlertCircle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    key: "criticalAlarm",
    label: "Critical Alarm",
    icon: AlertTriangle,
    iconBg: "bg-red-100",
    iconColor: "text-red-700",
  },
  {
    key: "criticalSiteAlarm",
    label: "Critical Site Alarm",
    icon: OctagonAlert,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    key: "cabinetDoorAlarm",
    label: "Cabinet Door Alarm",
    icon: DoorOpen,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    key: "dgDoorAlarm",
    label: "DG Door Alarm",
    icon: DoorOpen,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  {
    key: "autoMode",
    label: "Auto Mode",
    icon: Activity,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    key: "manualMode",
    label: "Manual Mode",
    icon: Settings2,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    key: "stopMode",
    label: "Stop Mode",
    icon: OctagonPause,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
];

/**
 * Backend data → card rows. Missing keys render as "-".
 */
export function mapStatsToDashboardItems(
  data: DashboardStatsFromBackend,
): any[] {
  return STAT_CONFIG.map((config) => {
    const raw = data[config.key];
    const value =
      raw === undefined || raw === null ? "-" : raw;
    return {
      id: config.key,
      label: config.label,
      value,
      icon: config.icon,
      iconBg: config.iconBg,
      iconColor: config.iconColor,
    };
  });
}

/**
 * API data [{ k: v }, ...] → single Daum.
 */
export function mergeCardInfoDataRows(
  rows: Daum[] | undefined,
): Daum | undefined {
  if (!rows?.length) return undefined;
  return rows.reduce<Daum>((acc, chunk) => ({ ...acc, ...chunk }), {});
}

function pick(
  d: Daum,
  next: DashboardStatsFromBackend,
  apiKey: keyof Daum,
  statKey: keyof DashboardStatsFromBackend,
) {
  const v = d[apiKey];
  if (v !== undefined && v !== null) next[statKey] = v;
}

/** /api/v1/master/info → dashboard stat keys */
export function mapCardInfoDaumToDashboardStats(
  d: Daum | undefined,
): DashboardStatsFromBackend {
  if (!d) return {};
  const next: DashboardStatsFromBackend = {};

  pick(d, next, "total_sites", "totalSites");
  pick(d, next, "offline_count", "offline");
  pick(d, next, "online_count", "online");
  if (next.online === undefined) {
    if (
      d.total_sites != null &&
      d.offline_count != null
    )
      next.online = d.total_sites - d.offline_count;
  }

  pick(d, next, "dg_offline", "dgOffline");
  pick(d, next, "cabinet_offline", "cabinetOffline");
  pick(d, next, "solar_offline", "solarOffline");
  pick(d, next, "io_card_offline", "ioCardOffline");
  pick(d, next, "batt_low_alarm", "battLowAlarm");
  pick(d, next, "mains_fail", "mainsFailAlarm");
  pick(d, next, "high_dgrh_alarm", "highDgrhAlarm");
  pick(d, next, "major_alarm", "majorAlarm");
  pick(d, next, "minor_alarm", "minorAlarm");
  pick(d, next, "critical_alarm", "criticalAlarm");
  pick(d, next, "critical_site_alarm", "criticalSiteAlarm");
  pick(d, next, "cabinet_door_alarm", "cabinetDoorAlarm");
  if (next.cabinetDoorAlarm === undefined && d.door_alarm != null)
    next.cabinetDoorAlarm = d.door_alarm;
  pick(d, next, "dg_door_alarm", "dgDoorAlarm");
  pick(d, next, "auto_mode", "autoMode");
  pick(d, next, "manual_mode", "manualMode");
  pick(d, next, "stop_mode", "stopMode");

  return next;
}

/** Demo fallback only */
export const sampleDashboardStats: DashboardStatsFromBackend = {
  totalSites: 3000,
  online: 1456,
  offline: 1544,
  dgOffline: 12,
  cabinetOffline: 8,
  solarOffline: 5,
  ioCardOffline: 3,
  battLowAlarm: 19,
  mainsFailAlarm: 15,
  highDgrhAlarm: 7,
  majorAlarm: 12,
  minorAlarm: 34,
  criticalAlarm: 4,
  criticalSiteAlarm: 2,
  cabinetDoorAlarm: 3,
  dgDoorAlarm: 1,
  autoMode: 2000,
  manualMode: 500,
  stopMode: 100,
};
