import Mapping from "@/features/mapping";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/mapping/")({
  component: Mapping,
});
