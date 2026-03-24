import { axios } from "@/store/api"
import { useMutation } from "@tanstack/react-query"


interface payloadProps {
    email : string,
    password : string
}

interface ApiConnectResponse {
    Message: string
    token: string
}

const getApiConnectToken = async () => {
    const { data } = await axios.get<ApiConnectResponse>("api-connect", {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            db: "klt_db",
            appkey: "649d98ed",
            appsecret: "0b8301b0",
        },
    })

    return data?.token
}

const login = async (payload : payloadProps) => {
    const connectToken = await getApiConnectToken()

    const {data} = await axios.post(`api/v1/login` , payload , {
        headers : {
            "Content-Type" : "application/json",
            Accept : "application/json",
            token: connectToken
        }
    })
    return data
}

export const useLogin = () => {
    return useMutation({
        mutationFn : (payload : payloadProps) => login(payload)
    })
}