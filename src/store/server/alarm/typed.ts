export interface activeAlarmProps {
  message: string
  alarm_counts: number
  major_alarm_counts: number
  minor_alarm_counts: number
  critical_alarm_counts: number
  alarms: Alarm[]
}

export interface Alarm {
  id: number
  device_id: number
  device_name: string
  trigger_id: number
  trigger_name: string
  alarm_type: string
  alarm_time: string
  duration: number
  project_name: string
  project_id: number
}
