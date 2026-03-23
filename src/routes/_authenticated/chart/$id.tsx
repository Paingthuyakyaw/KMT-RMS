import ChartPage from "@/features/chart";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/chart/$id")({
  component: ChartIdPage,
});

function ChartIdPage() {
  const { id } = Route.useParams();
  return <ChartPage chartId={id} />;
}

