"use client";

import React from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Zap } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function QuotaMeterPill() {
  const { quota } = useDashboard();
  const percentUsed = Math.min(
    100,
    Math.round((quota.lifetimeUsed / quota.lifetimeLimit) * 100)
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="hidden lg:inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-background hover:bg-muted text-xs transition cursor-pointer">
          <Link
            href="/billing"
            className="flex items-center gap-2"
          >
            <Zap className="size-3.5 text-amber-500 fill-amber-500" />
            <span className="font-medium text-foreground">
              {quota.lifetimeUsed}/{quota.lifetimeLimit} Free Actions
            </span>
            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent className="text-xs">
          <p className="font-semibold">{quota.lifetimeLimit - quota.lifetimeUsed} free approval actions remaining</p>
          <p className="text-muted-foreground">Click to upgrade to unlimited monthly tier</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
