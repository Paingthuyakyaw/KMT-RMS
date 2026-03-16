import { InventoryManagement } from "@/features/inventory";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/inventory/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <InventoryManagement />;
}
