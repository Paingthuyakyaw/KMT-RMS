import { buildFormData } from "@/lib/utils"
import { axios } from "@/store/api"
import { useQuery } from "@tanstack/react-query"
import type { projectResponse } from "./typed"


interface payloadProps {
    name ? : string
}

const projectList = async (payload : payloadProps) : Promise<projectResponse> => {
    const formData = buildFormData(payload )
    const {data} = await axios.post(`api/v1/project/list` , formData)
    return data
}

export const useProjectList = (payload : payloadProps) => {
    return useQuery({
        queryKey : ["project-list" , payload],
        queryFn : () => projectList(payload)
    })
}