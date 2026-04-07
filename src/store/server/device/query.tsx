import { axios } from "@/store/api";
import { useQuery } from "@tanstack/react-query";
import type { Device } from "@/store/server/dashboard/typed";
import { buildFormData } from "@/lib/utils";

export type DeviceListPayload = {
  /** Search by device name (form field `name`) */
  name?: string;
  project_id?: string;
  status?: string;
};

export type DeviceListResponse = {
  message?: string;
  devices?: Device[];
  total?: number;
};

export async function fetchDeviceList(
  payload: DeviceListPayload = {},
): Promise<DeviceListResponse> {
  const formData = buildFormData(payload)
  const { data } = await axios.post<DeviceListResponse>(
    `api/v1/device/list`,
    formData,
  );
  return data;
}

export function useDeviceListSearch(
  payload: DeviceListPayload,
  options: { enabled?: boolean } = {},
) {
  const enabled =
    options.enabled !== false &&
    Boolean(payload.name?.trim()) &&
    payload.name!.trim().length >= 1;

  return useQuery({
    queryKey: ["deviceList", payload],
    queryFn: () => fetchDeviceList(payload),
    enabled,
    staleTime: 30 * 1000,
  });
}
