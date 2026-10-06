"use client";

import React, { useState } from "react";
import { useDashboard, EdgeStateSimulation } from "@/lib/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2,
  X,
  Edit3,
  Clock,
  ThumbsDown,
  Sparkles,
  Zap,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  Flame,
  ChevronRight,
  TrendingUp,
  Radio,
  SlidersHorizontal,
  Inbox,
  BarChart3,
  Layers,
  ArrowUpRight,
  Send,
  Target,
  Users,
  Check,
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// 14-day discovery trend data
const trendData = [
  { day: "Sep 22", signals: 14, approved: 4 },
  { day: "Sep 23", signals: 19, approved: 6 },
  { day: "Sep 24", signals: 16, approved: 5 },
  { day: "Sep 25", signals: 22, approved: 7 },
  { day: "Sep 26", signals: 28, approved: 9 },
  { day: "Sep 27", signals: 24, approved: 8 },
  { day: "Sep 28", signals: 32, approved: 11 },
  { day: "Sep 29", signals: 29, approved: 10 },
  { day: "Sep 30", signals: 35, approved: 12 },
  { day: "Oct 01", signals: 31, approved: 11 },
  { day: "Oct 02", signals: 38, approved: 14 },
  { day: "Oct 03", signals: 42, approved: 15 },
  { day: "Oct 04", signals: 36, approved: 13 },
  { day: "Oct 05", signals: 44, approved: 16 },
];

// Sparkline data for cards
const sparklineQueue = [
  { v: 3 }, { v: 6 }, { v: 4 }, { v: 8 }, { v: 5 }, { v: 9 }, { v: 4 }
];
const sparklineApproval = [
  { v: 60 }, { v: 65 }, { v: 70 }, { v: 68 }, { v: 74 }, { v: 76 }
];

// Platform distribution data
const platformDistribution = [
  { name: "Reddit", value: 45, color: "#f97316" },
  { name: "X (Twitter)", value: 30, color: "#0ea5e9" },
  { name: "Hacker News", value: 15, color: "#f59e0b" },
  { name: "LinkedIn", value: 10, color: "#3b82f6" },
];

// Source yield data for bar chart
const sourceYieldData = [
  { source: "r/QA", yield: 78 },
  { source: "HN Ask", yield: 75 },
  { source: "r/react", yield: 71 },
  { source: "r/webdev", yield: 69 },
  { source: "X Keyword", yield: 62 },
];

export default function TodayPage() {
  const {
    activeMission,
    opportunities,
    approveOpportunity,
    skipOpportunity,
    badMatchOpportunity,
    snoozeOpportunity,
    agentStatus,
    quota,
    edgeState,
    setEdgeState,
    triggerManualScan,
    toggleMissionStatus,
    sendWhatsAppTestMessage,
    whatsAppStatus,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState("queue");
  const [editingOppId, setEditingOppId] = useState<string | null>(null);
  const [editedDraftText, setEditedDraftText] = useState<string>("");

  // Pending opportunities for today
  const queueOpportunities = opportunities.filter(
    (o) => o.status === "new" || o.status === "drafted"
  );

  const approvedToday = opportunities.filter((o) => o.status === "approved").length;

  const handleStartEdit = (oppId: string, currentDraft: string) => {
    setEditingOppId(oppId);
    setEditedDraftText(currentDraft);
  };

  const handleCancelEdit = () => {
    setEditingOppId(null);
    setEditedDraftText("");
  };

  const handleSaveAndApprove = (oppId: string) => {
    approveOpportunity(oppId, editedDraftText);
    setEditingOppId(null);
    setEditedDraftText("");
  };

  // Helper for platform tags
  const renderPlatformBadge = (platform: string, subreddit?: string) => {
    switch (platform) {
      case "reddit":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs font-medium">
            Reddit {subreddit ? `• ${subreddit}` : ""}
          </Badge>
        );
      case "x":
        return (
          <Badge variant="outline" className="bg-sky-500/10 text-sky-600 border-sky-500/20 text-xs font-medium">
            X (Twitter)
          </Badge>
        );
      case "hackernews":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs font-medium">
            Hacker News
          </Badge>
        );
      case "linkedin":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs font-medium">
            LinkedIn
          </Badge>
        );
      default:
        return <Badge variant="outline">{platform}</Badge>;
    }
  };

  const goalPercent = Math.min(
    100,
    Math.round((activeMission.target_metric.current / activeMission.target_metric.goal) * 100)
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Mission Status Card */}
      <Card className="rounded-xl border border-border/70 bg-card p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs font-medium ${
                  activeMission.status === "active"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                }`}
              >
                {activeMission.status === "active" ? "Mission Active" : "Mission Paused"}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                Spec v{activeMission.spec_version}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {activeMission.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {activeMission.goal_text}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleMissionStatus(activeMission.id)}
              className="h-9 px-3 text-xs gap-1.5 cursor-pointer rounded-lg"
            >
              {activeMission.status === "active" ? (
                <>
                  <PauseCircle className="size-3.5 text-amber-500" />
                  Pause Mission
                </>
              ) : (
                <>
                  <PlayCircle className="size-3.5 text-emerald-500" />
                  Resume Mission
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={triggerManualScan}
              className="h-9 px-3 text-xs gap-1.5 cursor-pointer rounded-lg"
            >
              <RefreshCw className="size-3.5" />
              Scan Now
            </Button>

            <Link href="/mission">
              <Button size="sm" className="h-9 px-3.5 text-xs gap-1.5 cursor-pointer rounded-lg">
                Mission Spec <ChevronRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Milestone Progress Bar inside Header Card */}
        <div className="pt-4 mt-5 border-t border-border/60">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <Target className="size-3.5 text-primary" />
              <span className="font-semibold text-foreground">
                Validation Goal: {activeMission.target_metric.current} / {activeMission.target_metric.goal} {activeMission.target_metric.unit}
              </span>
            </div>
            <span className="font-bold text-primary font-mono">{goalPercent}% Reached</span>
          </div>
          <Progress value={goalPercent} className="h-2 rounded-full" />
        </div>
      </Card>

      {/* 2. Top Metric Cards Strip (Card-wise Stats with Mini Charts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Queue Waiting */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Pending Review</span>
              <Inbox className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {edgeState === "empty_queue" ? 0 : queueOpportunities.length}
              </span>
              <span className="text-xs text-muted-foreground">cards today</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">{approvedToday} approved so far</span>
            <div className="w-16 h-6 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={sparklineQueue}>
                  <Area type="monotone" dataKey="v" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Card 2: Approval Rate */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Approval Yield</span>
              <TrendingUp className="size-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                76.4%
              </span>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 py-0">
                +8.2%
              </Badge>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">High-intent filtering</span>
            <div className="w-16 h-6 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={sparklineApproval}>
                  <Bar dataKey="v" fill="#10b981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Card 3: Discovery Interviews */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Customer Calls</span>
              <Users className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                9 <span className="text-base text-muted-foreground font-normal">/ 15</span>
              </span>
              <span className="text-xs text-emerald-600 font-medium font-mono">Ahead (+3)</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Next booked: Tomorrow, 3 PM</span>
            <Link href="/conversations" className="text-primary hover:underline">Pipeline</Link>
          </div>
        </Card>

        {/* Card 4: Monthly Quota Left */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Quota Fuel</span>
              <Zap className="size-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {quota.monthlyUsed} <span className="text-base text-muted-foreground font-normal">/ {quota.monthlyLimit}</span>
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {quota.monthlyLimit - quota.monthlyUsed} left
              </span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40">
            <Progress
              value={Math.round((quota.monthlyUsed / quota.monthlyLimit) * 100)}
              className="h-1.5"
            />
          </div>
        </Card>
      </div>

      {/* 3. Main Card-wise Content with Proper Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-auto">
            <TabsTrigger
              value="queue"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Inbox className="size-3.5" />
              Approval Queue ({edgeState === "empty_queue" ? 0 : queueOpportunities.length})
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <BarChart3 className="size-3.5" />
              Trends & Discovery Charts
            </TabsTrigger>
            <TabsTrigger
              value="edge_states"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <SlidersHorizontal className="size-3.5" />
              Simulation Sandbox
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>Last Scan: {agentStatus.lastRun}</span>
            <span>•</span>
            <span className="text-emerald-600">Harness Active</span>
          </div>
        </div>

        {/* TAB 1: THE CORE APPROVAL QUEUE */}
        <TabsContent value="queue" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 cols: Card Deck */}
            <div className="lg:col-span-8 space-y-4">
              {edgeState === "empty_queue" || queueOpportunities.length === 0 ? (
                <Card className="rounded-xl border border-dashed border-border p-12 text-center shadow-none">
                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-600">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <h3 className="font-bold text-base text-foreground">
                      Queue is completely cleared!
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You have reviewed all pending opportunities. Your agent is scheduled to scan active watchlists in 48 minutes.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={triggerManualScan}
                      className="text-xs gap-1.5 cursor-pointer rounded-lg"
                    >
                      <RefreshCw className="size-3.5" /> Trigger Instant Crawl
                    </Button>
                  </div>
                </Card>
              ) : (
                queueOpportunities.map((opp) => {
                  const draft = opp.drafts[0];
                  const isEditing = editingOppId === opp.id;

                  return (
                    <Card
                      key={opp.id}
                      className="rounded-xl border border-border/80 bg-card p-6 shadow-xs hover:border-primary/40 transition-all duration-200 space-y-4"
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
                        <div className="flex items-center gap-2.5">
                          {renderPlatformBadge(opp.signal.platform, opp.signal.subreddit)}
                          <span className="font-semibold text-xs text-foreground font-mono">
                            {opp.signal.author_handle}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {opp.signal.posted_at}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1 px-2.5 py-0.5">
                            <Flame className="size-3" />
                            {Math.round(opp.score * 100)}% Match
                          </Badge>

                          <a
                            href={opp.signal.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground transition cursor-pointer"
                            title="Open original discussion"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* Discussion Quote */}
                      <div className="space-y-2">
                        {opp.signal.title && (
                          <h3 className="font-bold text-sm text-foreground leading-snug">
                            {opp.signal.title}
                          </h3>
                        )}
                        <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3.5 rounded-lg border border-border/40 font-normal">
                          &ldquo;{opp.signal.body}&rdquo;
                        </p>
                      </div>

                      {/* AI Why-Match Reason */}
                      <div className="flex items-start gap-2.5 text-xs bg-primary/5 border border-primary/15 rounded-lg p-3">
                        <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                        <div className="leading-relaxed text-foreground">
                          <strong className="text-primary font-semibold">Why this matches: </strong>
                          {opp.why_match}
                        </div>
                      </div>

                      {/* Proposed Draft */}
                      {draft && (
                        <div className="space-y-2.5 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                              <MessageCircle className="size-3.5 text-primary" />
                              Calibrated Outreach Draft
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                              <span>{draft.quality_checks.length} chars</span>
                              <span>•</span>
                              <span className="text-emerald-600 font-semibold">
                                {draft.quality_checks.tone_match}% tone match
                              </span>
                              <span>•</span>
                              <span className="capitalize">Spam risk: {draft.quality_checks.spam_risk}</span>
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="space-y-2">
                              <Textarea
                                rows={5}
                                value={editedDraftText}
                                onChange={(e) => setEditedDraftText(e.target.value)}
                                className="text-xs font-mono leading-relaxed"
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  className="h-8 text-xs cursor-pointer rounded-lg"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveAndApprove(opp.id)}
                                  className="h-8 text-xs gap-1.5 cursor-pointer rounded-lg"
                                >
                                  <CheckCircle2 className="size-3.5" /> Save & Approve
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3.5 rounded-lg border border-border bg-background text-xs text-foreground leading-relaxed whitespace-pre-line font-normal">
                              {draft.body}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                        {/* Negative Actions */}
                        <div className="flex items-center gap-1.5">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center gap-1 h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md border border-border transition cursor-pointer">
                              <ThumbsDown className="size-3" />
                              <span>Bad match</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-52 text-xs">
                              <DropdownMenuLabel className="text-xs font-semibold">Train agent to avoid:</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {[
                                "Not relevant to pain point",
                                "Wrong target audience",
                                "Spam or automated bot account",
                                "Competitor discussion",
                                "Low buying intent",
                              ].map((reason) => (
                                <DropdownMenuItem
                                  key={reason}
                                  onClick={() => badMatchOpportunity(opp.id, reason)}
                                  className="text-xs cursor-pointer"
                                >
                                  {reason}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => skipOpportunity(opp.id)}
                            className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <X className="size-3.5 mr-1" /> Skip
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => snoozeOpportunity(opp.id)}
                            className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Clock className="size-3.5 mr-1" /> Snooze
                          </Button>
                        </div>

                        {/* Positive Actions */}
                        <div className="flex items-center gap-2">
                          {!isEditing && draft && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartEdit(opp.id, draft.body)}
                              className="h-8 text-xs gap-1.5 cursor-pointer rounded-lg"
                            >
                              <Edit3 className="size-3.5" /> Edit Draft
                            </Button>
                          )}

                          <Button
                            size="sm"
                            onClick={() => approveOpportunity(opp.id)}
                            className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold cursor-pointer rounded-lg shadow-xs hover:bg-primary/90"
                          >
                            <CheckCircle2 className="size-3.5" /> Approve & Dispatch
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Right 4 cols: Side Cards */}
            <div className="lg:col-span-4 space-y-4">
              {/* Card 1: Platform Distribution Donut */}
              <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
                <CardHeader className="p-0 pb-3">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Signal Channel Distribution
                  </CardTitle>
                </CardHeader>
                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie
                        data={platformDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {platformDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-[11px]">
                  {platformDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}:</span>
                      <span className="font-bold text-foreground">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Card 2: WhatsApp Mobile Sync */}
              <Card className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <MessageCircle className="size-4 text-emerald-600" />
                    WhatsApp Sync
                  </span>
                  <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                    Connected
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Morning digests deliver 4 top matches directly to your phone at <strong>9:00 AM</strong>. Reply <code className="px-1 bg-muted rounded font-mono">1</code> to approve.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={sendWhatsAppTestMessage}
                  className="w-full text-xs gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer rounded-lg"
                >
                  <Send className="size-3" /> Test WhatsApp Dispatch
                </Button>
              </Card>

              {/* Card 3: Quick Navigation Cards */}
              <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Quick Navigation
                </span>
                <div className="space-y-1 text-xs">
                  <Link
                    href="/opportunities"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition text-foreground"
                  >
                    <span>All Discovered Opportunities</span>
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/conversations"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition text-foreground"
                  >
                    <span>Conversations & Pipeline</span>
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/verdict"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition text-foreground"
                  >
                    <span>Market Evidence & Verdict Model</span>
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: TRENDS & DISCOVERY CHARTS */}
        <TabsContent value="analytics" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 14-Day Signal Volume Area Chart */}
            <Card className="lg:col-span-8 rounded-xl border border-border/70 bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    14-Day Signal Discovery & Approval Velocity
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Total discussions monitored vs high-relevance approved outreach.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-primary" />
                    <span>Surfaced</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span>Approved</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorSignals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                    <RechartsTooltip />
                    <Area
                      type="monotone"
                      dataKey="signals"
                      stroke="#0ea5e9"
                      fillOpacity={1}
                      fill="url(#colorSignals)"
                    />
                    <Area
                      type="monotone"
                      dataKey="approved"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorApproved)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Source Yield Bar Chart */}
            <Card className="lg:col-span-4 rounded-xl border border-border/70 bg-card p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-foreground">Source Approval Yield</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Percentage of surfaced posts approved per channel.
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={sourceYieldData} layout="vertical">
                    <XAxis type="number" stroke="#888888" fontSize={11} unit="%" />
                    <YAxis dataKey="source" type="category" stroke="#888888" fontSize={11} tickLine={false} width={65} />
                    <RechartsTooltip />
                    <Bar dataKey="yield" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: EDGE STATES SIMULATION SANDBOX */}
        <TabsContent value="edge_states" className="mt-0">
          <Card className="rounded-xl border border-border/70 bg-card p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-sm text-foreground">
                Edge State Preview & Simulator
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Test and verify edge states designed in <code>dashboard-pages.md</code> (no mission, first scan, empty queue, paused, quota exhausted, channel disconnected).
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { id: "normal", label: "Normal Queue", desc: "Default operational view" },
                { id: "first_scan", label: "First Scan Running", desc: "Crawling in progress" },
                { id: "empty_queue", label: "Empty Queue", desc: "All caught up" },
                { id: "mission_paused", label: "Mission Paused", desc: "Harness halted" },
                { id: "quota_used_up", label: "Quota Exhausted", desc: "100/100 reached" },
                { id: "channel_disconnected", label: "Channel Offline", desc: "Needs OAuth reauth" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setEdgeState(s.id as any);
                    setActiveTab("queue");
                  }}
                  className={`p-3 rounded-xl border text-left space-y-1 transition cursor-pointer ${
                    edgeState === s.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="font-bold text-xs block text-foreground">{s.label}</span>
                  <span className="text-[11px] text-muted-foreground block">{s.desc}</span>
                </button>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
