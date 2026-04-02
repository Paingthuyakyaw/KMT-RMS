import { LogComponent } from "@/features/log";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/log/")({
  validateSearch: (search: Record<string, unknown>) => {
    const out: { rms_device_id?: string; device_name?: string } = {};
    if (
      typeof search.rms_device_id === "string" &&
      search.rms_device_id.trim()
    ) {
      out.rms_device_id = search.rms_device_id.trim().replace(/^["']|["']$/g, "");
    }
    if (typeof search.device_name === "string" && search.device_name.trim()) {
      out.device_name = search.device_name.trim();
    }
    return out;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  return (
    <LogComponent
      rmsDeviceIdFromSearch={search.rms_device_id}
      deviceNameFromSearch={search.device_name}
    />
  );
}
