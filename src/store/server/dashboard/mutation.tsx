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
    getNextPageParam: (lastPage: deviceProps, _allPages, lastPageParam) => {
      const currentPage =
        typeof lastPageParam === "number" ? lastPageParam : 1;
      const pageLimit = lastPage?.limit ?? limit;
      const total = lastPage?.device_detail_count ?? 0;
      const devices = lastPage?.devices ?? [];

      // ဖILTER/တချို့ response တွေမှာ `page` မပါတာကြောင့် client-side `lastPageParam` သုံးရမယ်။
      // မဟုတ်ရင် `page` အမြဲ 1 လို့ ထင်ပြီး hasNextPage မသွားဘဲ fetch ထပ်ခေါ်နိုင်တယ်။
      if (devices.length === 0) return undefined;
      if (devices.length < pageLimit) return undefined;
      if (total > 0 && currentPage * pageLimit >= total) return undefined;
      return currentPage + 1;
    },
    placeholderData : keepPreviousData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
    refetchInterval : 15000
  });
};