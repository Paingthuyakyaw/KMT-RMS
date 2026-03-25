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
