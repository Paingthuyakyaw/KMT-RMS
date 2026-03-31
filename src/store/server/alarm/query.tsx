import { axios } from "@/store/api"
import {  useQuery } from "@tanstack/react-query";
import type { activeAlarmProps, majorAlarmResponse } from "./typed";
import { buildFormData } from "@/lib/utils";


interface payloadProps {
    alarm_type ? : string
    device_name ? : string,
    from_date ? : string
    project_id ? : string
}

const activeAlarm = async (payload : payloadProps) : Promise<activeAlarmProps> => {
    const formData = new FormData();
    formData.append("alarm_type" , payload.alarm_type as string)
    formData.append("device_name" , payload.device_name as string)
    formData.append("from_date" , payload.from_date as string)
    if (payload.project_id) {
        formData.append("project_id" , payload.project_id)
    }
    
    const {data} = await axios.post(`api/v1/active/alarm` , formData ,)
    return data
}


export const useActiveAlarm = (payload : payloadProps) => {
    return useQuery({
        queryKey : ["active-alarm" , payload],
        queryFn : () => activeAlarm(payload)
    })
}



// major alarm

interface majorPayload {
    device_name ? : string,
    status ? : string,
    trigger ? : string,
    from_date ? : string,
    to_date ? : string,
    page ?: string
    project_id ?: string
    limit ? : string
}

const majorAlarm = async (payload ? : majorPayload ) : Promise<majorAlarmResponse> => {

     const formData = buildFormData(payload || {});
    const {data} = await axios.post(`api/v1/major/alarm/list` , formData)
    return data
}


export const useMajorAlarm = (payload? : majorPayload) => {
    return useQuery({
        queryKey : ["major-alarm" , payload],
        queryFn : () => majorAlarm(payload)
    })
}