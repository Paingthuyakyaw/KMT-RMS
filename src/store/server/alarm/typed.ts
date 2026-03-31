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


export interface majorAlarmResponse {
  message: string
  alarm_counts: number
  alarms: Alarm[]
}

export interface Alarm {
  id: number
  device_id: number
  device_name: string
  status: boolean
  trigger_id: number
  trigger_name: string
  alarm_state: boolean
  alarm_time: string
  alarm_time_js?: number
  content?: string
  project_name: string
  json: Json
}

export interface Json {}
