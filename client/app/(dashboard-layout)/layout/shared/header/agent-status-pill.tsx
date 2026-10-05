"use client";

import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/lib/dashboard-context";
import { Activity, RefreshCw, Radio, Clock } from "lucide-react";
import Link from "next/link";

export function AgentStatusPill() {
  const { agentStatus, triggerManualScan } = useDashboard();

  return (
    <Popover>
      <PopoverTrigger className="hidden md:inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-background hover:bg-muted/80 text-xs font-medium transition cursor-pointer">
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              agentStatus.state === "scanning" ? "bg-emerald-400" : "bg-sky-400"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              agentStatus.state === "scanning" ? "bg-emerald-500" : "bg-sky-500"
            }`}
          />
        </span>
        <span className="text-foreground capitalize">{agentStatus.state}</span>
        <span className="text-muted-foreground font-normal">· Last run {agentStatus.lastRun}</span>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 space-y-3" align="end">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-emerald-500" />
            <h4 className="font-semibold text-sm text-foreground">Autonomous Agent Harness</h4>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] uppercase font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          >
            Healthy
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          FastAPI background runner monitors subreddits, X feeds, and HN queries every 60 minutes.
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="p-2 rounded-lg bg-muted/50 border border-border">
            <div className="text-muted-foreground flex items-center gap-1">
              <Radio className="size-3" /> Sources Monitored
            </div>
            <div className="text-base font-semibold text-foreground mt-0.5">
              {agentStatus.sourcesCount} Active
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 border border-border">
            <div className="text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" /> Next Scan In
            </div>
            <div className="text-base font-semibold text-foreground mt-0.5">
              {agentStatus.nextRun}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Link
            href="/activity"
            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
          >
            View run logs
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={triggerManualScan}
            className="h-7 text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className="size-3" />
            Scan Now
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
