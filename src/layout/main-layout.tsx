import * as React from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";

import { AppSidebar } from "./sidebar";
import { Outlet } from "@tanstack/react-router";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { TimezoneSearchCombobox } from "@/components/timezone-combobox";

export default function MainLayout() {
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const { theme, setTheme } = useTheme();

  return (
    <SidebarProvider>
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <SidebarInset className=" overflow-x-hidden">
        <header className="flex h-11 shrink-0 items-center justify-between gap-2 border-b dark:bg-neutral-900 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger size={"lg"} className="-ml-1" />
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <TimezoneSearchCombobox />
            <Button
              variant="ghost"
              className="border border-transparent text-muted-foreground hover:text-white hover:border-border hover:bg-accent"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </header>
        <div className="bg-neutral-50 p-3 sm:p-5 md:p-7 dark:bg-neutral-900">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
