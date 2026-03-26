import { axios } from "@/store/api"
import { useQuery } from "@tanstack/react-query"
import type { logProps } from "./typed";


interface payload {
  device_id?: string
  from_date?: string
  to_date?: string
}

const safeJsonParse = <T,>(value: unknown): T | undefined => {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  // Avoid parsing non-JSON strings.
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return undefined
  try {
    return JSON.parse(trimmed) as T
  } catch {
    return undefined
  }
}

const normalizeLogList = (raw: unknown): unknown[] => {
  // API might return:
  // - array directly
  // - { data: array }
  // - JSON string for either of the above
  const candidate =
    raw && typeof raw === "object" && "data" in raw
      ? (raw as { data: unknown }).data
      : raw

  const parsed =
    safeJsonParse<unknown[]>(candidate) ??
    safeJsonParse<{ data?: unknown[] }>(candidate)?.data ??
    safeJsonParse<unknown[]>(String(candidate))

  if (Array.isArray(parsed)) return parsed
  if (Array.isArray(candidate)) return candidate
  return []
}

export const log = async (payload: payload): Promise<logProps[]> => {
  const formData = new FormData()
  if (payload.device_id) formData.append("device_id", payload.device_id)
  if (payload.from_date) formData.append("from_date", payload.from_date)
  if (payload.to_date) formData.append("to_date", payload.to_date)

  const { data: raw } = await axios.post(`api/v2/logs`, formData, {
    params: {
      page: 1,
      limit: 30,
    },
  })

  return normalizeLogList(raw) as logProps[]
}


export const useLog = (payload : payload) => {
    return useQuery({
        queryKey : ["log" , payload],
        queryFn : () => log(payload),
        enabled : Boolean(payload?.device_id && payload?.from_date && payload?.to_date)
    })
}