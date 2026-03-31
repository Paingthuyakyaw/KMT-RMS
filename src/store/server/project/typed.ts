export interface projectResponse {
  message: string
  projects: Project[]
}

export interface Project {
  id: number
  name: string
  remark: any
  app_key_id: any
  app_key_name: string
  created_time: string
  owner_uid: any
  parent_name: any
}
