import { Card } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, MapPin, OctagonAlert } from "lucide-react";

const alarmSummary = [
  {
    id: "major",
    label: "Major",
    value: 0,
    icon: AlertTriangle,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  {
    id: "minor",
    label: "Minor",
    value: 0,
    icon: AlertCircle,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "critical",
    label: "Critical",
    value: 0,
    icon: OctagonAlert,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    id: "critical-site",
    label: "Critical Site",
    value: 0,
    icon: MapPin,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

export default function ActiveAlarm() {
  return (
    <div className="h-screen">
      <h4 className="text-sm font-semibold">Active Alarm</h4>

      <div className="my-8 flex flex-wrap gap-3">
        {alarmSummary.map((item) => (
          <Card
            key={item.id}
            className="min-w-30 border border-border bg-card px-2 py-2 shadow-none"
          >
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor}`}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {item.value}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-white dark:bg-muted border rounded-md text-sm">
        <div className="border-b grid grid-cols-8 gap-2 last:border-b-0">
          <div className="border-r pl-2 py-2">Device Name</div>
          <div className="border-r py-2">Trigger Name</div>
          <div className="border-r py-2">Site Type</div>
          <div className="border-r py-2 col-span-2">Alarm Generate Time</div>
          <div className="border-r py-2">Alarm State</div>
          <div className="border-r py-2">Alarm Type</div>
          <div className="text-end pr-2 py-2">Duration</div>
        </div>
        {/* UI-only: rows intentionally omitted */}
      </div>
    </div>
  );
}

