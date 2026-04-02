import { axios } from "@/store/api"
import { useQuery } from "@tanstack/react-query"
import type { cardInfoResponse } from "./typed"


interface payloadProps {
    name ? : string,
    project_id ? : string
    status ? : string
}

const cardInfo = async (payload ? : payloadProps) : Promise<cardInfoResponse> => {
    const {data} = await axios.post(`api/v1/master/info` , payload , )
    return data
}

export const useCardInfo = (payload ?: payloadProps) => {
    return useQuery({
        queryKey: ["card-info", payload],
        queryFn: () => cardInfo(payload),
    })
}