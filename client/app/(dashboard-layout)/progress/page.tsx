"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  TrendingUp,
  Target,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Filter,
  BarChart3,
  Award,
  Layers,
  Flame,
  Radio,
  Clock,
  ArrowRight,
  Check,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function ProgressPage() {
  const { activeMission } = useDashboard();
  const [activeTab, setActiveTab] = useState<string>("overview");

  const funnelSteps = [
    { name: "Discussions Found", count: 1480, dropoff: "100%", subtext: "Scanned across 5 sources", stage: "01" },
    { name: "Matches Approved", count: 342, dropoff: "23.1%", subtext: "Approved by user or bot", stage: "02" },
    { name: "Outreach Dispatched", count: 318, dropoff: "93.0%", subtext: "Sent via official APIs", stage: "03" },
    { name: "Inbound Replies", count: 94, dropoff: "29.5%", subtext: "Response rate achieved", stage: "04" },
    { name: "Interviews Booked", count: 23, dropoff: "24.4%", subtext: "Booked & completed", stage: "05" },
  ];

  const weeklyTrendData = [
    { week: "W1 (Sep 08)", found: 210, approved: 42, replied: 12 },
    { week: "W2 (Sep 15)", found: 340, approved: 78, replied: 22 },
    { week: "W3 (Sep 22)", found: 420, approved: 96, replied: 28 },
    { week: "W4 (Sep 29)", found: 510, approved: 126, replied: 32 },
  ];

  const sourceYields = [
    { source: "r/QualityAssurance", platform: "Reddit", approved: 67, rate: 77.9, interviews: 7 },
    { source: "Ask HN", platform: "Hacker News", approved: 48, rate: 75.0, interviews: 6 },
    { source: "r/reactjs", platform: "Reddit", approved: 84, rate: 71.2, interviews: 5 },
    { source: "r/webdev", platform: "Reddit", approved: 98, rate: 69.0, interviews: 4 },
    { source: "X: 'flaky tests'", platform: "X", approved: 142, rate: 61.7, interviews: 1 },
  ];

  const tonePerformance = [
    { tone: "Founder Friendly (Default)", sent: 180, replied: 62, replyRate: "34.4%", sentiment: "Very Positive", description: "Humble peer-to-peer inquiry asking how they solve the problem." },
    { tone: "Technical Advisor", sent: 84, replied: 22, replyRate: "26.1%", sentiment: "Analytical", description: "Direct engineering perspective discussing architecture trade-offs." },
    { tone: "Casual Builder", sent: 54, replied: 12, replyRate: "22.2%", sentiment: "Friendly", description: "Lightweight feedback request sharing an early prototype link." },
  ];

  const milestones = [
    { title: "Define Core ICP & Validation Hypothesis", status: "completed", date: "Sep 01, 2026", description: "Targeting engineering leads with >50 CI test suites running hourly." },
    { title: "Monitor 5 Primary Channels", status: "completed", date: "Sep 08, 2026", description: "Active crawlers deployed across Reddit QA, Hacker News, and X." },
    { title: "Secure First 5 Discovery Calls", status: "completed", date: "Sep 18, 2026", description: "Confirmed high pain around flaky integration test maintenance costs." },
    { title: "Reach 15 Target Validation Calls", status: "in_progress", date: "Pacing to Oct 12", description: "Currently 9 of 15 completed. Pacing 3 calls ahead of original model schedule." },
    { title: "Synthesize Willingness-to-Pay Benchmark", status: "upcoming", date: "Target Oct 20", description: "Confirm whether $200-$500/mo pricing model is accepted by >60% of interviewees." },
  ];

  const goalPercent = Math.min(
    100,
    Math.round((activeMission.target_metric.current / activeMission.target_metric.goal) * 100)
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-mono">
              Validation Analytics
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Updated Live
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Progress & Performance Funnel
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Full end-to-end conversion analytics from initial signal discovery to booked interviews and customer validation.
          </p>
        </div>

        <Link href="/verdict">
          <Button size="sm" className="text-xs gap-1.5 cursor-pointer h-8 bg-primary text-primary-foreground">
            <Award className="size-3.5" /> View Market Verdict Model
          </Button>
        </Link>
      </div>

      {/* 2. Primary Goal Card Banner */}
      <Card className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground text-xs font-mono">
                Primary Goal Tracker
              </Badge>
              <span className="text-xs text-emerald-600 font-mono font-medium">
                Pacing: +3 calls ahead of schedule
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {activeMission.target_metric.current} of {activeMission.target_metric.goal} {activeMission.target_metric.unit} Secured
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Targeting 15 qualitative customer discovery calls with tech founders and engineering leads before closing private alpha.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0 lg:text-right">
            <div>
              <span className="text-3xl font-extrabold text-primary font-mono">{goalPercent}%</span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Estimated 6 days to goal
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>Milestone: 9 / 15 Calls Booked</span>
            <span>6 Remaining</span>
          </div>
          <Progress value={goalPercent} className="h-2.5 rounded-full" />
        </div>
      </Card>

      {/* 3. Top Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Signals Scanned</span>
              <Radio className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                1,480
              </span>
              <span className="text-xs text-emerald-600 font-mono font-medium">+24% wk/wk</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            5 monitored channels
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Approved Outreach</span>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                342
              </span>
              <span className="text-xs text-muted-foreground font-mono">23.1% approval rate</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            Strict guardrails enforced
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Inbound Reply Rate</span>
              <TrendingUp className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                29.5%
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20 font-mono">
                +17.5% vs avg
              </Badge>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            94 qualified replies received
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Customer Interviews</span>
              <Users className="size-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                23
              </span>
              <span className="text-xs text-emerald-600 font-mono font-medium">24.4% reply-to-call</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            Target: 15 for mission completion
          </div>
        </Card>
      </div>

      {/* 4. Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val || "overview")} className="w-full space-y-6">
        <div className="border-b border-border/60 pb-3">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex-wrap">
            <TabsTrigger
              value="overview"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <BarChart3 className="size-3.5" />
              Conversion Funnel & Velocity
            </TabsTrigger>
            <TabsTrigger
              value="sources"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Radio className="size-3.5" />
              Channel & Source Yields
            </TabsTrigger>
            <TabsTrigger
              value="tones"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="size-3.5" />
              Tone & Copy Efficacy
            </TabsTrigger>
            <TabsTrigger
              value="roadmap"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Calendar className="size-3.5" />
              Validation Roadmap
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: OVERVIEW & FUNNEL */}
        <TabsContent value="overview" className="space-y-6">
          {/* Funnel Card */}
          <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/10">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>End-to-End Validation Funnel</span>
                <Badge variant="outline" className="text-xs font-mono">5 Conversion Stages</Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Discovered signals leading to qualified prospect conversations and customer discovery interviews.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {funnelSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border/70 bg-card relative space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono text-[10px] font-semibold text-primary">STAGE {step.stage}</span>
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        {step.dropoff}
                      </Badge>
                    </div>

                    <div>
                      <div className="text-2xl font-extrabold text-foreground font-mono">
                        {step.count.toLocaleString()}
                      </div>
                      <div className="text-xs font-semibold text-foreground truncate mt-1">
                        {step.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {step.subtext}
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(12, 100 - idx * 20)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Velocity Chart */}
          <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" />
                    Weekly Outreach & Reply Velocity
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Tracking 7-day rolling volumes of discussions found, approvals granted, and replies received.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-blue-500"></span> Discovered
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-amber-500"></span> Approved
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500"></span> Replied
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="h-72 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorReplied" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#888888" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#888888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="found" name="Discussions Found" stroke="#3b82f6" fillOpacity={1} fill="url(#colorFound)" strokeWidth={2} />
                    <Area type="monotone" dataKey="approved" name="Approved Outreach" stroke="#f59e0b" fillOpacity={1} fill="url(#colorApproved)" strokeWidth={2} />
                    <Area type="monotone" dataKey="replied" name="Inbound Replies" stroke="#10b981" fillOpacity={1} fill="url(#colorReplied)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: SOURCE YIELDS */}
        <TabsContent value="sources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart: Source yield comparison */}
            <div className="lg:col-span-7">
              <Card className="rounded-xl border border-border/70 bg-card shadow-xs h-full flex flex-col justify-between">
                <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/10">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="size-4 text-primary" />
                    Source Comparison: Approvals & Discovery Calls
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Comparing volume of approved outreaches against resulting validation interviews.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 flex-1 flex flex-col justify-center">
                  <div className="h-72 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart data={sourceYields} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="source" tick={{ fontSize: 10 }} stroke="#888888" interval={0} angle={-15} textAnchor="end" height={50} />
                        <YAxis tick={{ fontSize: 11 }} stroke="#888888" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                        <Bar dataKey="approved" name="Approved Outreach" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="interviews" name="Booked Calls" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* List: Ranked sources */}
            <div className="lg:col-span-5">
              <Card className="rounded-xl border border-border/70 bg-card shadow-xs h-full">
                <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/10">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span>Ranked Channel Performance</span>
                    <Badge variant="outline" className="text-xs font-mono">By Call Yield</Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Ordered by highest conversation-to-interview conversion.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/60 text-xs">
                    {sourceYields.map((src, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/20 transition">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-foreground font-mono">
                            <span className="size-4 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            {src.source}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {src.platform} • {src.approved} approved outreach actions
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-[10px]">
                            {src.interviews} Booked Calls
                          </Badge>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {src.rate}% approval rate
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: TONE & COPY PERFORMANCE */}
        <TabsContent value="tones" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tonePerformance.map((tp, idx) => (
              <Card key={idx} className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={idx === 0 ? "default" : "outline"} className="text-xs">
                      {idx === 0 ? "Primary Tone" : "Variant"}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {tp.sentiment}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-foreground">
                    {tp.tone}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tp.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-border/60">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Sent</span>
                      <strong className="text-foreground text-sm font-mono">{tp.sent}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Replies</span>
                      <strong className="text-foreground text-sm font-mono">{tp.replied}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Reply Rate:</span>
                    <span className="text-lg font-bold text-primary font-mono">{tp.replyRate}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Calibrate or Add Voice Personas
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Customize rules, banned phrases, and live rewrite examples in the Voice Profile manager.
                </p>
              </div>
              <Link href="/voice">
                <Button size="sm" variant="outline" className="text-xs gap-1.5 cursor-pointer">
                  Open Voice Studio <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 4: ROADMAP */}
        <TabsContent value="roadmap" className="space-y-4">
          <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/10">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Hypothesis Validation Roadmap</span>
                <span className="text-xs text-muted-foreground font-mono">Phase 1: Customer Discovery</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Key milestones required to generate a definitive market demand verdict.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {milestones.map((m, idx) => (
                  <div key={idx} className="relative space-y-1">
                    {/* Circle icon on the timeline */}
                    <div className={`absolute -left-6 top-0.5 size-4 rounded-full border-2 flex items-center justify-center ${
                      m.status === "completed"
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : m.status === "in_progress"
                        ? "border-primary bg-background text-primary animate-pulse"
                        : "border-muted-foreground/40 bg-muted"
                    }`}>
                      {m.status === "completed" && <Check className="size-2.5 stroke-[3]" />}
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground">
                        {m.title}
                      </h4>
                      <Badge
                        variant={m.status === "completed" ? "default" : "outline"}
                        className={`text-[10px] font-mono capitalize ${
                          m.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : m.status === "in_progress"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "text-muted-foreground"
                        }`}
                      >
                        {m.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="text-[11px] text-muted-foreground font-mono">
                      {m.date}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                      {m.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
