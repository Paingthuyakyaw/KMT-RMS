import MajorAlarm from "@/features/major-alarm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/major-alarm/")({
  component: MajorAlarm,
});
