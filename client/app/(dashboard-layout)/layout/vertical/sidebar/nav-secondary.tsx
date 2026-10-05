"use client";

import React from "react";
import { Zap } from "lucide-react";
import Link from "next/link";
import { useDashboard } from "@/lib/dashboard-context";

export function NavSecondary() {
  const { quota } = useDashboard();
  const percentage = Math.min(
    100,
    Math.round((quota.monthlyUsed / quota.monthlyLimit) * 100)
  );

  return (
    <div className="-mx-4 border-t border-b border-border px-5 py-4">
      <div className="flex flex-col gap-4">
        {/* Plan info */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2.5">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="size-4 shrink-0 text-amber-500 fill-amber-500" />
                <span className="font-semibold text-sm leading-5 text-foreground">
                  Pro Plan
                </span>
              </div>
              <span className="font-medium text-xs text-muted-foreground">
                {percentage}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
          {/* Usage text */}
          <p className="text-xs text-muted-foreground text-left">
            {quota.monthlyUsed}/{quota.monthlyLimit} actions used this cycle
          </p>
        </div>

        {/* Upgrade / Manage button */}
        <Link
          href="/billing"
          className="w-full cursor-pointer h-8 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs font-medium transition-colors"
        >
          Manage Plan & Quota
        </Link>
      </div>
    </div>
  );
}
