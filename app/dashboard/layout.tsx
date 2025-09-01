
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { usePathname } from 'next/navigation';
import {
  FileWarning,
  GanttChart,
  LogOut,
  FileText,
} from "lucide-react";

import { DashboardProvider } from "@/contexts/DashboardContext";


import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = React.useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  
  // Protect route and get username
  React.useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      router.push(`/?from=${pathname}`);
    } else {
      setUsername(storedUsername);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    router.push("/");
  };
  
  // Render nothing or a loading spinner while checking auth
  if (!username) {
    return null; 
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Icons.logo className="w-8 h-8 text-sidebar-primary" />
            <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
              Fraud Sentinel
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard/overview" isActive={pathname === '/dashboard/overview'}>
                <GanttChart />
                <span>Overview</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard/alerts" isActive={pathname === '/dashboard/alerts'}>
                <FileWarning />
                <span>Alerts</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard/reports" isActive={pathname === '/dashboard/reports'}>
                <FileText />
                <span>Reports</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
           <div className="flex items-center gap-3 p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold">{username}</span>
              <span className="text-xs text-muted-foreground">Analyst</span>
            </div>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-8 w-8 group-data-[collapsible=icon]:hidden"
              onClick={handleLogout}
            >
              <LogOut />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}
