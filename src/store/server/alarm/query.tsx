import { axios } from "@/store/api"
import {  useQuery } from "@tanstack/react-query";
import type { activeAlarmProps } from "./typed";


interface payloadProps {
    alarm_type ? : string
    device_name ? : string,
    from_date ? : string
}

const activeAlarm = async (payload : payloadProps) : Promise<activeAlarmProps> => {
    const formData = new FormData();
    formData.append("alarm_type" , payload.alarm_type as string)
    formData.append("device_name" , payload.device_name as string)
    formData.append("from_date" , payload.from_date as string)
    
    const {data} = await axios.post(`api/v1/active/alarm` , formData ,)
    return data
}


export const useActiveAlarm = (payload : payloadProps) => {
    return useQuery({
        queryKey : ["active-alarm" , payload],
        queryFn : () => activeAlarm(payload)
    })
}