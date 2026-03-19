import { LogComponent } from "@/features/log";
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/_authenticated/log/")({
  component: LogComponent,
});


