import { axios } from "@/store/api";
import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { deviceProps } from "./typed";

export interface DeviceDetailPayload {
  page?: number;
  limit?: number;
  name?: string;
  project_id?: string;
  status?: string;
  power_source_type?: string;
  rms_device_id?: string;
}

const deviceDetail = async (
  payload?: DeviceDetailPayload,
): Promise<deviceProps> => {
  const { data } = await axios.post(`api/v1/device/detail/list`, {} , {params : payload});
  return data;
};

export const useDeviceDetail = (payload?: DeviceDetailPayload) => {
  return useQuery({
    queryKey: ["deviceDetail", payload],
    queryFn: () => deviceDetail(payload),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export type DeviceDetailInfiniteFilters = Omit<
  DeviceDetailPayload,
  "page" | "limit"
>;

export const useDeviceDetailInfinite = (
  filters?: DeviceDetailInfiniteFilters,
  limit: number = 10,
) => {
  return useInfiniteQuery({
    queryKey: ["deviceDetail", filters, limit],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      deviceDetail({
        ...(filters ?? {}),
        page: pageParam ?? 1,
        limit,
      }),
    getNextPageParam: (lastPage: deviceProps) => {
      const nextPage = (lastPage?.page ?? 1) + 1;
      const page = lastPage?.page ?? 1;
      const pageLimit = lastPage?.limit ?? limit;
      const total = lastPage?.device_detail_count ?? 0;

      if (page * pageLimit >= total) return undefined;
      return nextPage;
    },
    placeholderData : keepPreviousData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
    
  });
};