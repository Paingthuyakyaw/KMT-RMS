import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BatteryWarning,
  Building2,
  Cpu,
  Flame,
  Power,
  Sun,
  Wifi,
  WifiOff,
  Zap,
  Box,
  CircleDot,
  CircleOff,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Backend က ပြန်လာတဲ့ value တွေကို ဒီ shape လို ယူပြီး card အတွက် stats array ပြောင်းပေးတယ်。
 * API response က { totalSites: 3000, online: 1456, ... } လို ဖြစ်ရင် mapStatsToDashboardItems နဲ့ loop ပတ်ပြီး သုံးလို့ရတယ်。
 */
export type DashboardStatsFromBackend = {
  totalSites?: number;
  online?: number;
  active?: number;
  idle?: number;
  offline?: number;
  majorAlarm?: number;
  minorAlarm?: number;
  warning?: number;
  noSignal?: number;
  powerIssue?: number;
  cabinetAlarm?: number;
  batteryLow?: number;
  solarIssue?: number;
  ioCardError?: number;
  dgRunning?: number;
  maintenance?: number;
  [key: string]: number | undefined;
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
    key: "active",
    label: "Active",
    icon: Activity,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    key: "idle",
    label: "Idle",
    icon: CircleDot,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
  {
    key: "offline",
    label: "Offline",
    icon: CircleOff,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
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
    key: "warning",
    label: "Warning",
    icon: AlertTriangle,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    key: "noSignal",
    label: "No Signal",
    icon: WifiOff,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    key: "powerIssue",
    label: "Power Issue",
    icon: Zap,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    key: "cabinetAlarm",
    label: "Cabinet Alarm",
    icon: Box,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    key: "batteryLow",
    label: "Battery Low",
    icon: BatteryWarning,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    key: "solarIssue",
    label: "Solar Issue",
    icon: Sun,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    key: "ioCardError",
    label: "IO Card Error",
    icon: Cpu,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    key: "dgRunning",
    label: "DG Running",
    icon: Power,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    key: "maintenance",
    label: "Maintenance",
    icon: Clock,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
];

/**
 * Backend data ကို loop ပတ်ပြီး card အတွက် stats array ဖြစ်အောင် ပြောင်းပေးတယ်။
 * value မတူတာတွေကို backend က ဘယ်လို key နဲ့ပြန်ပြန်း ဒီ config မှာ key ကိုက်အောင် ထည့်သုံးရုံပါပဲ။
 */
export function mapStatsToDashboardItems(
  data: DashboardStatsFromBackend,
): any[] {
  return STAT_CONFIG.map((config) => ({
    id: config.key,
    label: config.label,
    value: data[config.key] ?? 0,
    icon: config.icon,
    iconBg: config.iconBg,
    iconColor: config.iconColor,
  }));
}

/** Demo / fallback: backend မရသေးချိန် သုံးဖို့ sample data */
export const sampleDashboardStats: DashboardStatsFromBackend = {
  totalSites: 3000,
  online: 1456,
  active: 1389,
  idle: 67,
  offline: 1544,
  majorAlarm: 12,
  minorAlarm: 34,
  warning: 56,
  noSignal: 23,
  powerIssue: 15,
  cabinetAlarm: 8,
  batteryLow: 19,
  solarIssue: 11,
  ioCardError: 6,
  dgRunning: 42,
  maintenance: 28,
};
