import { axios } from "@/store/api"
import { useQuery } from "@tanstack/react-query"


interface payload {
    device_id ?: string,
    from_date ? : string,
    to_date ? : string
}

export const log = async (payload ?: payload) => {
    const {data} = await axios.post(`api/v2/logs` , payload  )
    return data
}


export const useLog = (payload ? : payload) => {
    return useQuery({
        queryKey : ["log" , payload],
        queryFn : () => log(payload),
        enabled : !!payload?.device_id
    })
}