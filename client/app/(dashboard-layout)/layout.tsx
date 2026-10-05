"use client";

import React from "react";
import Header from "./layout/vertical/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./layout/vertical/sidebar/app-sidebar";
import { cn } from "@/lib/utils";
import RouteErrorBoundary from "@/app/components/shared/route-error-boundary";
import { DashboardProvider, useDashboard } from "@/lib/dashboard-context";
import { CheckCircle2 } from "lucide-react";

function GlobalToast() {
  const { quickToast } = useDashboard();
  if (!quickToast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-foreground text-background shadow-lg border border-border text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
      <span>{quickToast}</span>
    </div>
  );
}

function InnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      defaultOpen={true}
      style={{ "--sidebar-width-icon": "52px" } as React.CSSProperties}
    >
      <AppSidebar />
      <SidebarInset className="outline outline-border m-2 rounded-none! overflow-hidden flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 overflow-y-auto">
          <div className={cn("w-full mx-auto max-w-7xl")}>
            <div className="min-h-[calc(100vh-140px)]">
              <RouteErrorBoundary title="Page error">{children}</RouteErrorBoundary>
            </div>
          </div>
        </div>
      </SidebarInset>
      <GlobalToast />
    </SidebarProvider>
  );
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardProvider>
      <InnerLayout>{children}</InnerLayout>
    </DashboardProvider>
  );
}
