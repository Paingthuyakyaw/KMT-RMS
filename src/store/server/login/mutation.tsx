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

/** Parses common API shapes: `{ token }` or `{ data: { token } }`. */
export function extractSessionToken(data: unknown): string | undefined {
    if (!data || typeof data !== "object") return undefined
    const o = data as Record<string, unknown>
    if (typeof o.token === "string" && o.token.length > 0) return o.token
    const nested = o.data
    if (nested && typeof nested === "object") {
        const t = (nested as Record<string, unknown>).token
        if (typeof t === "string" && t.length > 0) return t
    }
    return undefined
}

export const useLogin = () => {
    return useMutation({
        mutationFn : (payload : payloadProps) => login(payload)
    })
}