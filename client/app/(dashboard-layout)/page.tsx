"use client";

import React, { useState } from "react";
import { useDashboard, EdgeStateSimulation } from "@/lib/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
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
  ShieldAlert,
  Flame,
  ChevronRight,
  TrendingUp,
  Radio,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

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
  } = useDashboard();

  const [editingOppId, setEditingOppId] = useState<string | null>(null);
  const [editedDraftText, setEditedDraftText] = useState<string>("");

  // Filter pending opportunities for today's queue
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

  // Platform badges helper
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
    Math.round(
      (activeMission.target_metric.current / activeMission.target_metric.goal) * 100
    )
  );

  return (
    <div className="space-y-6">
      {/* 1. Mission Header with Goal Progress Strip */}
      <Card className="border-border bg-card/60 backdrop-blur-sm overflow-hidden shadow-none">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className={
                    activeMission.status === "active"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  }
                >
                  {activeMission.status === "active" ? "Mission Active" : "Mission Paused"}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  Spec v{activeMission.spec_version}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {activeMission.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5 max-w-3xl">
                {activeMission.goal_text}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleMissionStatus(activeMission.id)}
                className="gap-1.5 text-xs cursor-pointer"
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
              <Link href="/mission">
                <Button variant="outline" size="sm" className="text-xs gap-1 cursor-pointer">
                  Configure <ChevronRight className="size-3" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Goal Progress Bar */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-primary" />
                Mission Milestone: {activeMission.target_metric.current} of {activeMission.target_metric.goal} {activeMission.target_metric.unit}
              </span>
              <span className="font-semibold text-primary">{goalPercent}% completed</span>
            </div>
            <Progress value={goalPercent} className="h-2" />
          </div>

          {/* Audience & Channels preview pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
            <span className="font-medium text-foreground">Audience:</span>
            <span className="truncate max-w-md">{activeMission.audience}</span>
            <span>•</span>
            <span className="font-medium text-foreground">Channels:</span>
            <span className="truncate">{activeMission.channels.join(", ")}</span>
          </div>
        </div>
      </Card>

      {/* Edge State Simulation Switcher (Lets user preview all edge states described in dashboard-pages.md) */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border text-xs">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground">Simulate Edge States:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "normal", label: "Normal Queue" },
              { id: "first_scan", label: "First Scan Running" },
              { id: "empty_queue", label: "Empty Queue" },
              { id: "mission_paused", label: "Mission Paused" },
              { id: "quota_used_up", label: "Quota Exhausted" },
              { id: "channel_disconnected", label: "Channel Offline" },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setEdgeState(s.id)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                edgeState === s.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-background hover:bg-muted text-muted-foreground border border-border"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Render Edge States if selected */}
      {edgeState === "first_scan" && (
        <Card className="p-8 text-center border-dashed border-2">
          <div className="max-w-md mx-auto space-y-3">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
              <RefreshCw className="size-6 text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">First Scan in Progress</h3>
            <p className="text-sm text-muted-foreground">
              Your autonomous agent is currently crawling Reddit (r/webdev, r/reactjs), X feeds, and Hacker News based on your mission spec. This takes 2–3 minutes.
            </p>
            <div className="pt-2">
              <Button size="sm" onClick={() => setEdgeState("normal")} className="cursor-pointer">
                Refresh & Load Matches
              </Button>
            </div>
          </div>
        </Card>
      )}

      {edgeState === "mission_paused" && (
        <Card className="p-8 text-center border-amber-500/30 bg-amber-500/5">
          <div className="max-w-md mx-auto space-y-3">
            <PauseCircle className="size-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-semibold text-foreground">Mission is Currently Paused</h3>
            <p className="text-sm text-muted-foreground">
              Scanning and auto-drafting are suspended. Existing queued opportunities are preserved. Click Resume to restart the background harness.
            </p>
            <div className="pt-2">
              <Button
                size="sm"
                onClick={() => {
                  toggleMissionStatus(activeMission.id);
                  setEdgeState("normal");
                }}
                className="cursor-pointer gap-1.5"
              >
                <PlayCircle className="size-4" /> Resume Mission
              </Button>
            </div>
          </div>
        </Card>
      )}

      {edgeState === "quota_used_up" && (
        <Card className="p-8 text-center border-destructive/30 bg-destructive/5">
          <div className="max-w-md mx-auto space-y-3">
            <Zap className="size-12 text-destructive mx-auto" />
            <h3 className="text-lg font-semibold text-foreground">Monthly Action Quota Exhausted</h3>
            <p className="text-sm text-muted-foreground">
              You have used all 100/100 outreach actions for this billing cycle. Upgrade to Scale tier for unlimited automated approvals.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <Link href="/billing">
                <Button size="sm" className="cursor-pointer">Upgrade Plan</Button>
              </Link>
              <Button size="sm" variant="outline" onClick={() => setEdgeState("normal")}>
                Dismiss
              </Button>
            </div>
          </div>
        </Card>
      )}

      {edgeState === "channel_disconnected" && (
        <Card className="p-8 text-center border-amber-500/30 bg-amber-500/5">
          <div className="max-w-md mx-auto space-y-3">
            <AlertTriangle className="size-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-semibold text-foreground">Primary Channel Disconnected</h3>
            <p className="text-sm text-muted-foreground">
              LinkedIn & X token authorizations need attention before automated drafts can be dispatched.
            </p>
            <div className="pt-2">
              <Link href="/channels">
                <Button size="sm" className="cursor-pointer">Reconnect Channels</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Main Today Approval Queue (Normal Mode) */}
      {(edgeState === "normal" || edgeState === "empty_queue") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Approval Cards Stream */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span>Today&apos;s Approval Queue</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {edgeState === "empty_queue" ? 0 : queueOpportunities.length} pending
                  </Badge>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Review matches found by your agent. Approving dispatches outreach via your connected channel.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={triggerManualScan}
                className="text-xs gap-1.5 cursor-pointer"
              >
                <RefreshCw className="size-3" />
                Scan Now
              </Button>
            </div>

            {edgeState === "empty_queue" || queueOpportunities.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <div className="max-w-sm mx-auto space-y-3">
                  <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="size-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-base text-foreground">
                    All caught up for today!
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    No pending items waiting in your queue. Your agent is scheduled to scan again in 48 minutes.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={triggerManualScan}
                    className="text-xs gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="size-3" /> Trigger Instant Scan
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {queueOpportunities.map((opp) => {
                  const draft = opp.drafts[0];
                  const isEditing = editingOppId === opp.id;

                  return (
                    <Card
                      key={opp.id}
                      className="border-border hover:border-primary/40 transition-all duration-200 overflow-hidden shadow-none"
                    >
                      {/* Card Header: Platform, Score, Recency */}
                      <CardHeader className="p-4 pb-3 border-b border-border/60 bg-muted/20">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {renderPlatformBadge(opp.signal.platform, opp.signal.subreddit)}
                            <span className="text-xs font-semibold text-foreground">
                              {opp.signal.author_handle}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {opp.signal.posted_at}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Score Breakdown Pill */}
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer">
                                <Flame className="size-3" />
                                {Math.round(opp.score * 100)}% Match
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 p-3 space-y-2">
                                <DropdownMenuLabel className="p-0 text-xs font-semibold">
                                  Relevance Breakdown
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <div className="space-y-1.5 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pain Intensity:</span>
                                    <span className="font-semibold text-foreground">
                                      {Math.round(opp.score_breakdown.pain * 100)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Audience Fit:</span>
                                    <span className="font-semibold text-foreground">
                                      {Math.round(opp.score_breakdown.fit * 100)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Recency Signal:</span>
                                    <span className="font-semibold text-foreground">
                                      {Math.round(opp.score_breakdown.recency * 100)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Willingness to Pay:</span>
                                    <span className="font-semibold text-foreground">
                                      {Math.round(opp.score_breakdown.wtp * 100)}%
                                    </span>
                                  </div>
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <a
                              href={opp.signal.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                              title="Open original discussion"
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                          </div>
                        </div>
                      </CardHeader>

                      {/* Card Content: Original Excerpt + Why Match */}
                      <CardContent className="p-4 space-y-3">
                        {opp.signal.title && (
                          <h3 className="font-semibold text-sm text-foreground leading-snug">
                            {opp.signal.title}
                          </h3>
                        )}

                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 bg-muted/30 p-2.5 rounded-lg border border-border/40 font-normal">
                          &ldquo;{opp.signal.body}&rdquo;
                        </p>

                        {/* Why Match Explanation */}
                        <div className="flex items-start gap-2 text-xs bg-primary/5 border border-primary/15 rounded-lg p-2.5">
                          <Sparkles className="size-3.5 text-primary shrink-0 mt-0.5" />
                          <p className="text-foreground leading-relaxed">
                            <span className="font-semibold text-primary">Why match: </span>
                            {opp.why_match}
                          </p>
                        </div>

                        {/* AI Draft Preview / Editor */}
                        {draft && (
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-foreground flex items-center gap-1.5">
                                <MessageCircle className="size-3.5 text-primary" />
                                Proposed Outreach Draft:
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                <span>{draft.quality_checks.length} chars</span>
                                <span>•</span>
                                <span className="text-emerald-600 font-medium">
                                  {draft.quality_checks.tone_match}% tone match
                                </span>
                                <span>•</span>
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                                  Spam Risk: {draft.quality_checks.spam_risk}
                                </Badge>
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
                                    className="h-7 text-xs cursor-pointer"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveAndApprove(opp.id)}
                                    className="h-7 text-xs gap-1.5 cursor-pointer"
                                  >
                                    <CheckCircle2 className="size-3.5" /> Save & Approve
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 rounded-lg border border-border bg-background text-xs text-foreground leading-relaxed whitespace-pre-line font-normal">
                                {draft.body}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>

                      {/* Card Footer: Action Buttons */}
                      <CardFooter className="p-4 pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2 bg-muted/10">
                        {/* Negative actions: Bad Match dropdown & Skip */}
                        <div className="flex items-center gap-1.5">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center gap-1 h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md border border-border transition cursor-pointer">
                              <ThumbsDown className="size-3" />
                              <span>Bad match</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48 text-xs">
                              <DropdownMenuLabel className="text-xs">Reason for rejection:</DropdownMenuLabel>
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

                        {/* Positive actions: Edit then Approve & Instant Approve */}
                        <div className="flex items-center gap-2">
                          {!isEditing && draft && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartEdit(opp.id, draft.body)}
                              className="h-8 text-xs gap-1.5 cursor-pointer"
                            >
                              <Edit3 className="size-3.5" /> Edit Draft
                            </Button>
                          )}

                          <Button
                            size="sm"
                            onClick={() => approveOpportunity(opp.id)}
                            className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="size-3.5" /> Approve & Send
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Quota, WhatsApp Mobile Sync, Agent Health */}
          <div className="lg:col-span-4 space-y-4">
            {/* 1. Daily Actions & Quota Card */}
            <Card className="shadow-none">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Quota & Today&apos;s Usage</span>
                  <Zap className="size-4 text-amber-500 fill-amber-500" />
                </CardTitle>
                <CardDescription className="text-xs">
                  Resets on 1st of every month
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Monthly Actions:</span>
                    <span className="font-semibold text-foreground">
                      {quota.monthlyUsed} / {quota.monthlyLimit}
                    </span>
                  </div>
                  <Progress
                    value={Math.round((quota.monthlyUsed / quota.monthlyLimit) * 100)}
                    className="h-1.5"
                  />
                </div>

                <div className="pt-2 border-t border-border grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-muted/40 border border-border">
                    <span className="text-muted-foreground block text-[11px]">Approved Today</span>
                    <span className="text-base font-semibold text-foreground">{approvedToday}</span>
                  </div>
                  <div className="p-2 rounded bg-muted/40 border border-border">
                    <span className="text-muted-foreground block text-[11px]">Free Lifetime Left</span>
                    <span className="text-base font-semibold text-foreground">
                      {quota.lifetimeLimit - quota.lifetimeUsed}
                    </span>
                  </div>
                </div>

                <Link href="/billing" className="block pt-1">
                  <Button variant="outline" size="sm" className="w-full text-xs cursor-pointer">
                    Manage Plan & Billing
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* 2. WhatsApp Mobile Sync Card (Same queue on phone) */}
            <Card className="shadow-none bg-emerald-500/5 border-emerald-500/20">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                  <MessageCircle className="size-4 text-emerald-600" />
                  WhatsApp Approval Sync
                </CardTitle>
                <CardDescription className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
                  Approve matches directly on WhatsApp while on the go.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2 text-xs text-muted-foreground">
                <p>
                  Every morning at <strong>9:00 AM</strong>, your agent sends a 4-item digest. Reply <code className="px-1 py-0.5 rounded bg-muted border font-mono">1</code> to approve draft 1, or <code className="px-1 py-0.5 rounded bg-muted border font-mono">edit 1</code> to rewrite.
                </p>
                <div className="pt-2">
                  <Link href="/channels">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
                    >
                      Configure WhatsApp Bot
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 3. Agent Status Widget */}
            <Card className="shadow-none">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Agent Scanner</span>
                  <Radio className="size-4 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2.5 text-xs text-muted-foreground">
                <div className="flex justify-between items-center py-1 border-b border-border/60">
                  <span>Harness Status</span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    Active Scanning
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/60">
                  <span>Active Watchlist</span>
                  <span className="font-medium text-foreground">{agentStatus.sourcesCount} sources</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/60">
                  <span>Last Run</span>
                  <span className="font-medium text-foreground">{agentStatus.lastRun}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Next Scheduled Crawl</span>
                  <span className="font-medium text-foreground">In {agentStatus.nextRun}</span>
                </div>

                <div className="pt-2">
                  <Link href="/activity">
                    <Button variant="outline" size="sm" className="w-full text-xs cursor-pointer">
                      Inspect Activity Timeline
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
