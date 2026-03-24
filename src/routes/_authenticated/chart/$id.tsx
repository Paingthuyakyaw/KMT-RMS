import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/chart/$id")({
  component: ChartIdPage,
});

function ChartIdPage() {
  return <div>This is chart id</div>
}

