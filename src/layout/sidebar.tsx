import * as React from "react";
import {
  LayoutDashboard,
  Users,
  LogOut,
  ChevronRight,
  Package,
  Shuffle,
  AlarmClock,
  AlertTriangle,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "../components/ui/sidebar";
import { Link, useLocation } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Menu items.
export const items = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Inventory Management",
    icon: Package,
    path: "/inventory",
  },
  {
    title: "Variable Mapping",
    icon: Shuffle,
    path: "/mapping",
  },
  {
    title: "Active Alarm",
    icon: AlarmClock,
    path: "/active-alarm",
  },
  {
    title: "Alarm History",
    icon: AlertTriangle,
    children: [
      {
        title: "Major Alarm",
        path: "/major-alarm",
      },
       {
        title: "Minor Alarm",
        path: "/minor-alarm",
      }, 
      {
        title : "Critical Alarm",
        path: "/critial-alarm",
      }
    ],
  },
  {
    title: "Team",
    icon: Users,
    children: [
      {
        title: "Test 3",
        path: "#",
      },
    ],
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function AppSidebar({
  activeTab,
  onTabChange,
  ...props
}: AppSidebarProps) {
  const { pathname: fullPathname } = useLocation();
  const pathname = "/" + fullPathname.split("/")[1];

  return (
    <Sidebar className="" collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="">
          {/* Collapsed State Icon */}
          <div className="hidden aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground group-data-[collapsible=icon]:flex">
            <LayoutDashboard className="size-4" />
          </div>
          <div className=" flex items-center gap-2 px-2">
            <LayoutDashboard className=" size-6" />
            <p className=" font-semibold text-lg">Logo</p>
          </div>
          {/* Expanded State Logo */}
        </div>
      </SidebarHeader>
      <SidebarSeparator className=" -m-0.5" />
      <SidebarContent className=" pt-2">
        <SidebarMenu className="px-2 gap-3 py-2">
          {items.map((item) => {
            return item.children ? (
              <>
                <Collapsible
                  key={item.title}
                  asChild
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger className=" hover:bg-primary hover:text-primary-foreground transition-colors duration-200" asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className="hover:bg-primary! hover:text-primary-foreground! transition-colors duration-200"
                      >
                        {item.icon && <item.icon />}
                        <span className=" text-sm truncate">{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="collapsible-content-animation">
                      <SidebarMenuSub>
                        {item.children?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                            className="hover:bg-primary data-active:bg-primary data-active:text-primary-foreground text-white! hover:text-primary-foreground transition-colors duration-200"
                              asChild
                              isActive={
                                subItem.path !== "#" &&
                                (fullPathname === subItem.path ||
                                  fullPathname.startsWith(subItem.path + "/"))
                              }
                            >
                              <Link to={subItem.path}>
                                <span className=" text-sm truncate">
                                  {subItem.title}
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </>
            ) : (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton className="data-active:bg-primary data-active:text-primary-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-200" asChild isActive={pathname === item.path}>
                    <Link to={item.path}>
                      <item.icon />
                      <span className=" text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="https://github.com/shadcn.png" alt="Pan" />
                <AvatarFallback className="rounded-lg">DZ</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">Pan</span>
                <span className="truncate text-xs">admin@pan.com</span>
              </div>
              <LogOut className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
