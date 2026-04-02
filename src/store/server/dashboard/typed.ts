export interface deviceProps {
  message: string
  device_detail_count: number
  page: number
  limit: number
  devices: Device[]
}

export interface Device {
  id: number
  name: string
  device_id: number
  rms_device_id: number
  last_active_alarm: string
  last_update_time: string
  source_type: string
  status: boolean
  alarm_status: boolean
  external_url: string
  access_device_url: boolean
  project_name: string
  power_source: string
  battery_backup_value: string
  rms_name: string
  rms_name_label: string
  json: Json[]
}

export interface Json {
  time: number
  error: number
  value: any
  alarmState: number
  transValue?: string
  cusdeviceNo: string
  dataPointId?: number
  variableName: string
  cusdeviceName: string
  templateDataPointId?: number
}


/** `data` entries may each hold a single metric key (merged client-side). */
export interface cardInfoResponse {
  message: string
  data: Daum[]
}

/** Master info card metrics (snake_case as returned by API). */
export interface Daum {
  user_id?: number
  total_sites?: number
  offline_count?: number
  online_count?: number
  dg_offline?: number
  cabinet_offline?: number
  solar_offline?: number
  io_card_offline?: number
  batt_low_alarm?: number
  mains_fail?: number
  high_dgrh_alarm?: number
  major_alarm?: number
  minor_alarm?: number
  critical_alarm?: number
  critical_site_alarm?: number
  cabinet_door_alarm?: number
  dg_door_alarm?: number
  /** @deprecated Prefer cabinet_door_alarm; kept for older API payloads */
  door_alarm?: number
  auto_mode?: number
  manual_mode?: number
  stop_mode?: number
}
