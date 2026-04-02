export type DashboardFilterState = {
  siteId: string;
  power_source_type: string;
  status: string;
  project_id: string;
};

export function emptyDashboardFilter(): DashboardFilterState {
  return {
    siteId: "",
    power_source_type: "",
    status: "",
    project_id: "",
  };
}
