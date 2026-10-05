"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/lib/dashboard-context";
import { Compass, Check, Plus, ChevronDown } from "lucide-react";
import Link from "next/link";

export function MissionSwitcher() {
  const { missions, activeMissionId, setActiveMissionId, activeMission } = useDashboard();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 px-2.5 h-8 text-xs font-medium rounded-md border border-border bg-background hover:bg-muted max-w-[210px] sm:max-w-[260px] cursor-pointer">
        <Compass className="size-3.5 text-primary shrink-0" />
        <span className="truncate text-foreground font-medium">
          {activeMission.title}
        </span>
        <ChevronDown className="size-3 text-muted-foreground shrink-0 ml-auto" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
          <span>Active Mission</span>
          <Badge variant="outline" className="text-[10px] font-normal uppercase">
            {activeMission.status}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {missions.map((m) => (
          <DropdownMenuItem
            key={m.id}
            onClick={() => setActiveMissionId(m.id)}
            className="flex items-center justify-between py-2 cursor-pointer"
          >
            <div className="truncate pr-2">
              <div className="font-medium text-xs text-foreground truncate">{m.title}</div>
              <div className="text-[11px] text-muted-foreground truncate">{m.goal_text}</div>
            </div>
            {m.id === activeMissionId && (
              <Check className="size-4 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/mission" className="flex items-center gap-2 text-xs font-medium text-primary w-full">
            <Plus className="size-3.5" />
            Manage & Configure Missions
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
