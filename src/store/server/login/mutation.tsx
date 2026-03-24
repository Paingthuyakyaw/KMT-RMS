import { axios } from "@/store/api"
import { useMutation } from "@tanstack/react-query"


interface payloadProps {
    email : string,
    password : string
}

const login = async (payload : payloadProps) => {
    const {data} = await axios.post(`api/v1/login` , payload)
    return data
}

export const useLogin = () => {
    return useMutation({
        mutationFn : (payload : payloadProps) => login(payload)
    })
}