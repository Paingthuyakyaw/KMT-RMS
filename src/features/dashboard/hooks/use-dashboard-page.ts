import {
  mapCardInfoDaumToDashboardStats,
  mapStatsToDashboardItems,
  mergeCardInfoDataRows,
} from "@/features/dashboard/data/dashboard-stats";
import type { DashboardStatItem } from "@/features/dashboard/components/card";
import {
  emptyDashboardFilter,
  type DashboardFilterState,
} from "@/features/dashboard/types";
import {
  useDeviceDetailInfinite,
  type DeviceDetailInfiniteFilters,
} from "@/store/server/dashboard/mutation";
import { useCardInfo } from "@/store/server/dashboard/query";
import { useInfiniteScrollObserver } from "@/hooks/use-infinite-scroll-observer";
import { useProjectList } from "@/store/server/project/query";
import { useEffect, useMemo, useRef, useState } from "react";

export function useDashboardPage() {
  const [scrollRootEl, setScrollRootEl] = useState<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [tableExpanded, setTableExpanded] = useState(false);
  const [filter, setFilter] = useState(emptyDashboardFilter);

  const { data: projectData } = useProjectList({});
  const projects = projectData?.projects ?? [];

  const deviceListFilters = useMemo((): DeviceDetailInfiniteFilters => {
    const next: DeviceDetailInfiniteFilters = {};
    const siteId = filter.siteId.trim();
    if (siteId) next.name = siteId;
    if (filter.power_source_type)
      next.power_source_type = filter.power_source_type;
    if (filter.status) next.status = filter.status;
    if (filter.project_id) next.project_id = filter.project_id;
    return next;
  }, [
    filter.siteId,
    filter.power_source_type,
    filter.status,
    filter.project_id,
  ]);

  const cardInfoPayload = useMemo(() => {
    const siteId = filter.siteId.trim();
    return {
      ...(siteId ? { name: siteId } : {}),
      ...(filter.project_id ? { project_id: filter.project_id } : {}),
      ...(filter.status ? { status: filter.status } : {}),
    };
  }, [filter.siteId, filter.project_id, filter.status]);

  const { data: cardInfoResponse } = useCardInfo(cardInfoPayload);

  const resetFilters = () => setFilter(emptyDashboardFilter());

  const applyFilters = (next: DashboardFilterState) => setFilter(next);

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  } = useDeviceDetailInfinite(deviceListFilters, 50);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || isError) return;
    if ((infiniteData?.pages?.length ?? 0) !== 1) return;
    void fetchNextPage();
  }, [
    hasNextPage,
    isFetchingNextPage,
    isError,
    infiniteData?.pages?.length,
    fetchNextPage,
  ]);

  useInfiniteScrollObserver({
    rootElement: scrollRootEl,
    targetRef: sentinelRef,
    enabled: Boolean(hasNextPage) && !isError && Boolean(scrollRootEl),
    isLoading: Boolean(isFetchingNextPage),
    onLoadMore: () => fetchNextPage(),
    rootMargin: "0px 0px 3500px 0px",
    threshold: 0,
  });

  const devices = useMemo(() => {
    const pages = infiniteData?.pages ?? [];
    return pages.flatMap((p: any) => {
      const list = p?.devices ?? p?.data ?? [];
      return Array.isArray(list) ? list : [];
    });
  }, [infiniteData?.pages]);

  const stats = useMemo(() => {
    const cardDaum = mergeCardInfoDataRows(cardInfoResponse?.data);
    return mapStatsToDashboardItems(
      mapCardInfoDaumToDashboardStats(cardDaum),
    ) as DashboardStatItem[];
  }, [cardInfoResponse?.data]);

  return {
    setScrollRootEl,
    sentinelRef,
    tableExpanded,
    setTableExpanded,
    filter,
    projects,
    resetFilters,
    applyFilters,
    stats,
    devices,
    isFetchingNextPage,
  };
}
