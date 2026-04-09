import { axios } from "@/store/api";
import { useQuery } from "@tanstack/react-query";
import type { logProps, tweResponse } from "./typed";

export interface LogQueryPayload {
  rms_device_id?: string;
  from_date?: string;
  to_date?: string;
}

export interface twePayload {
  device_id?: string;
  from_date?: string;
  to_date?: string;
}

export type LogPagination = {
  page?: number;
  limit?: number;
};

const safeJsonParse = <T,>(value: unknown): T | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return undefined;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return undefined;
  }
};

const normalizeLogList = (raw: unknown): unknown[] => {
  const candidate =
    raw && typeof raw === "object" && "data" in raw
      ? (raw as { data: unknown }).data
      : raw;

  const parsed =
    safeJsonParse<unknown[]>(candidate) ??
    safeJsonParse<{ data?: unknown[] }>(candidate)?.data ??
    safeJsonParse<unknown[]>(String(candidate));

  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(candidate)) return candidate;
  return [];
};

/**
 * POST api/v2/logs?page=1&limit=30
 * Form Data: rms_device_id (device list က ရွေးထားသော id), from_date, to_date
 */
export const log = async (
  payload: LogQueryPayload,
): Promise<logProps[]> => {

  const formData = new FormData();
  if (
    payload.rms_device_id != null &&
    String(payload.rms_device_id).trim() !== ""
  ) {
    formData.append("device_id", String(payload.rms_device_id).trim());
  }
  if (payload.from_date) formData.append("from_date", payload.from_date);
  if (payload.to_date) formData.append("to_date", payload.to_date);

  const { data: raw } = await axios.post(`api/v2/logs`, formData, {
   
  });

  return normalizeLogList(raw) as logProps[];
};

export const useLog = (
  payload: LogQueryPayload,
  pagination?: LogPagination,
) => {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 30;

  return useQuery({
    queryKey: ["log", payload, page, limit],
    queryFn: () => log(payload),
    enabled: Boolean(
      payload?.rms_device_id?.trim() &&
        payload?.from_date &&
        payload?.to_date,
    ),
  });
};


export const twelLog = async (
  payload: twePayload,
): Promise<tweResponse> => {

  const formData = new FormData();
  if (
    payload.device_id != null &&
    String(payload.device_id).trim() !== ""
  ) {
    formData.append("device_id", String(payload.device_id).trim());
  }
  if (payload.from_date) formData.append("from_date", payload.from_date);
  if (payload.to_date) formData.append("to_date", payload.to_date);

  const { data: raw } = await axios.post(`api/v2/12am/logs`, formData, {
   
  });

  return normalizeLogList(raw) as logProps[];
};

export const useTweLog = (
  payload: twePayload,
  pagination?: LogPagination,
) => {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 30;

  return useQuery({
    queryKey: ["log", payload, page, limit],
    queryFn: () => twelLog(payload),
    enabled: Boolean(
      payload?.device_id?.trim() &&
        payload?.from_date &&
        payload?.to_date,
    ),
  });
};
