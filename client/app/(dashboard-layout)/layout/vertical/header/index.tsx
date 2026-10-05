"use client";

import React from "react";
import Profile from "../../shared/header/profile";
import FullLogo from "../../shared/logo/full-logo";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LightDark from "../../shared/header/light-dark";
import { PanelLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { MissionSwitcher } from "../../shared/header/mission-switcher";
import { CommandSearch } from "../../shared/header/command-search";
import { AgentStatusPill } from "../../shared/header/agent-status-pill";
import { QuotaMeterPill } from "../../shared/header/quota-meter-pill";
import { FeedbackDialog } from "../../shared/header/feedback-dialog";

const Header = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className={cn("sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border")}>
      <nav>
        <div className="mx-auto flex flex-wrap items-center justify-between p-2.5 gap-2">
          {/* Left section: mobile logo, sidebar toggle, separator, mission switcher */}
          <div className="flex gap-2 items-center">
            <div className="block lg:hidden">
              <FullLogo />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="p-2 hover:bg-primary/5 rounded-full transition cursor-pointer"
              onClick={toggleSidebar}
              title="Toggle sidebar"
            >
              <PanelLeft size={20} />
            </Button>

            <Separator
              orientation="vertical"
              className="h-4 mr-2 ml-1 data-[orientation=vertical]:self-center max-lg:hidden"
            />

            {/* Global Mission Switcher */}
            <MissionSwitcher />
          </div>

          {/* Center: Command Palette search bar */}
          <div className="hidden sm:flex items-center">
            <CommandSearch />
          </div>

          {/* Right section: Quota meter, Agent status pill, Feedback, Theme, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <QuotaMeterPill />
            <AgentStatusPill />
            <FeedbackDialog />
            <LightDark />
            <Profile />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
