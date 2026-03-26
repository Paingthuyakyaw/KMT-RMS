import { LogComponent } from "@/features/log";
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/_authenticated/log/")({
  validateSearch: (search) => ({
    ...(typeof search.device_id === "string" && search.device_id.trim()
      ? { device_id: search.device_id }
      : {}),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  return <LogComponent deviceIdFromSearch={search.device_id || undefined} />;
}


