"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/lib/dashboard-context";
import { useRouter } from "next/navigation";
import {
  Search,
  Inbox,
  Target,
  MessageSquare,
  Compass,
  Radio,
  FolderOpen,
  Volume2,
  TrendingUp,
  Scale,
  Activity,
  Brain,
  ShieldCheck,
  Plug,
  Bell,
  CreditCard,
  Settings,
  HelpCircle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

export function CommandSearch() {
  const { isCmdOpen, setIsCmdOpen, opportunities, threads, sources, missions } = useDashboard();
  const [query, setQuery] = useState("");
  const router = useRouter();

  const pages = [
    { title: "Today (Approval Queue)", url: "/", icon: Inbox, category: "Work" },
    { title: "Opportunities (All Matches)", url: "/opportunities", icon: Target, category: "Work" },
    { title: "Conversations (Pipeline)", url: "/conversations", icon: MessageSquare, category: "Work" },
    { title: "Mission Spec & Versions", url: "/mission", icon: Compass, category: "Setup" },
    { title: "Sources & Watchlist", url: "/sources", icon: Radio, category: "Setup" },
    { title: "Library (Assets & Docs)", url: "/library", icon: FolderOpen, category: "Setup" },
    { title: "Voice Profiles & Rules", url: "/voice", icon: Volume2, category: "Setup" },
    { title: "Progress & Funnel Analytics", url: "/progress", icon: TrendingUp, category: "Insights" },
    { title: "Evidence & Verdict Model", url: "/verdict", icon: Scale, category: "Insights" },
    { title: "Agent Activity Timeline", url: "/activity", icon: Activity, category: "Agent" },
    { title: "Agent Memory (Learned Rules)", url: "/memory", icon: Brain, category: "Agent" },
    { title: "Guardrails & Autonomy", url: "/guardrails", icon: ShieldCheck, category: "Agent" },
    { title: "Channels & Integrations", url: "/channels", icon: Plug, category: "Account" },
    { title: "Notification Schedules", url: "/notifications", icon: Bell, category: "Account" },
    { title: "Billing & Quotas", url: "/billing", icon: CreditCard, category: "Account" },
    { title: "Account Settings", url: "/settings", icon: Settings, category: "Account" },
    { title: "Help & Feedback", url: "/feedback", icon: HelpCircle, category: "Account" },
  ];

  const filteredPages = pages.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredOpps = opportunities
    .filter(
      (o) =>
        o.signal.title?.toLowerCase().includes(query.toLowerCase()) ||
        o.signal.body.toLowerCase().includes(query.toLowerCase()) ||
        o.signal.author_handle.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 4);

  const filteredContacts = threads
    .filter(
      (t) =>
        t.contact.display_name.toLowerCase().includes(query.toLowerCase()) ||
        t.contact.handle.toLowerCase().includes(query.toLowerCase()) ||
        t.contact.company?.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 3);

  const handleNavigate = (url: string) => {
    setIsCmdOpen(false);
    setQuery("");
    router.push(url);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsCmdOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-muted/60 hover:bg-muted border border-border rounded-lg transition-colors w-40 sm:w-64 justify-between cursor-pointer"
      >
        <span className="flex items-center gap-2 truncate">
          <Search className="size-3.5 shrink-0" />
          <span className="truncate">Search commands & pages...</span>
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 pointer-events-none select-none rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {/* Command Dialog */}
      <Dialog open={isCmdOpen} onOpenChange={setIsCmdOpen}>
        <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden">
          <div className="flex items-center border-b border-border px-3 py-2.5">
            <Search className="size-4 text-muted-foreground mr-2 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command, page name, or search opportunities..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
              autoFocus
            />
            <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border text-muted-foreground">
              ESC
            </kbd>
          </div>

          <div className="max-h-[380px] overflow-y-auto p-2 space-y-4">
            {/* Pages Section */}
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Pages & Navigation
              </div>
              <div className="space-y-0.5">
                {filteredPages.slice(0, 6).map((item) => (
                  <button
                    key={item.url}
                    onClick={() => handleNavigate(item.url)}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-lg hover:bg-muted transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="font-medium text-foreground">{item.title}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                      {item.category}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Opportunities Section */}
            {query.length > 1 && filteredOpps.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Matched Opportunities
                </div>
                <div className="space-y-1">
                  {filteredOpps.map((opp) => (
                    <button
                      key={opp.id}
                      onClick={() => handleNavigate("/opportunities")}
                      className="w-full flex items-start justify-between px-2.5 py-2 text-sm rounded-lg hover:bg-muted transition text-left cursor-pointer"
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium text-foreground truncate">
                          {opp.signal.title || opp.signal.body.slice(0, 60)}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span className="uppercase text-[10px] font-mono">{opp.signal.platform}</span>
                          <span>•</span>
                          <span>{opp.signal.author_handle}</span>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                        {Math.round(opp.score * 100)}% Match
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Contacts Section */}
            {query.length > 1 && filteredContacts.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Contacts & Leads
                </div>
                <div className="space-y-1">
                  {filteredContacts.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => handleNavigate("/conversations")}
                      className="w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-lg hover:bg-muted transition text-left cursor-pointer"
                    >
                      <div>
                        <div className="font-medium text-foreground">
                          {thread.contact.display_name} ({thread.contact.handle})
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {thread.contact.company || thread.contact.role || thread.contact.platform}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {thread.stage.replace("_", " ")}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredPages.length === 0 && filteredOpps.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No matching pages or records found for &ldquo;{query}&rdquo;
              </div>
            )}
          </div>

          <div className="border-t border-border px-3 py-2 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
            <span>Navigation shortcut</span>
            <div className="flex items-center gap-2">
              <span>Use <kbd className="px-1 border border-border bg-background rounded">↑</kbd> <kbd className="px-1 border border-border bg-background rounded">↓</kbd> to navigate</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
