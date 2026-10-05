"use client";

import React from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import Link from "next/link";

export default function ProgressPage() {
  const { activeMission } = useDashboard();

  const funnelSteps = [
    { name: "Discussions Found", count: 1480, dropoff: "100%", subtext: "Scanned across 5 sources" },
    { name: "Matches Approved", count: 342, dropoff: "23.1%", subtext: "Approved by user or bot" },
    { name: "Outreach Dispatched", count: 318, dropoff: "93.0%", subtext: "Sent via official APIs" },
    { name: "Inbound Replies", count: 94, dropoff: "29.5%", subtext: "Response rate achieved" },
    { name: "Validation Interviews", count: 23, dropoff: "24.4%", subtext: "Booked & completed" },
  ];

  const weeklyTrendData = [
    { week: "W1 (Sep 08)", found: 210, approved: 42, replied: 12 },
    { week: "W2 (Sep 15)", found: 340, approved: 78, replied: 22 },
    { week: "W3 (Sep 22)", found: 420, approved: 96, replied: 28 },
    { week: "W4 (Sep 29)", found: 510, approved: 126, replied: 32 },
  ];

  const sourceYields = [
    { source: "r/QualityAssurance", platform: "Reddit", approved: 67, rate: 77.9, interviews: 7 },
    { source: "Hacker News Ask HN", platform: "HN", approved: 48, rate: 75.0, interviews: 6 },
    { source: "r/reactjs", platform: "Reddit", approved: 84, rate: 71.2, interviews: 5 },
    { source: "r/webdev", platform: "Reddit", approved: 98, rate: 69.0, interviews: 4 },
    { source: "X Keyword: 'flaky tests'", platform: "X", approved: 142, rate: 61.7, interviews: 1 },
  ];

  const tonePerformance = [
    { tone: "Founder Friendly (Default)", sent: 180, replyRate: "34.4%", sentiment: "Very Positive" },
    { tone: "Technical Advisor", sent: 84, replyRate: "26.1%", sentiment: "Analytical" },
    { tone: "Casual Builder", sent: 54, replyRate: "22.2%", sentiment: "Friendly" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Progress & Performance Funnel
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Full end-to-end conversion analytics from initial signal discovery to booked interviews and customer validation.
          </p>
        </div>

        <Link href="/verdict">
          <Button size="sm" className="text-xs gap-1.5 cursor-pointer">
            <Award className="size-3.5" /> View Market Verdict Model
          </Button>
        </Link>
      </div>

      {/* Goal Tracker Banner */}
      <Card className="shadow-none border-primary/20 bg-primary/5 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground text-xs font-mono">
                Primary Goal Tracker
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                Pacing: +3 calls ahead of schedule
              </span>
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {activeMission.target_metric.current} of {activeMission.target_metric.goal} {activeMission.target_metric.unit} Secured
            </h3>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Targeting 15 qualitative customer discovery calls with tech founders and engineering leads before closing private alpha.
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="text-3xl font-extrabold text-primary">60%</span>
            <span className="block text-xs text-muted-foreground mt-0.5">
              Estimated 6 days to goal
            </span>
          </div>
        </div>

        <div className="mt-4">
          <Progress value={60} className="h-2.5" />
        </div>
      </Card>

      {/* Conversion Funnel */}
      <Card className="shadow-none">
        <CardHeader className="p-4 pb-2 border-b border-border bg-muted/20">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span>Outreach Conversion Funnel</span>
            <Filter className="size-4 text-muted-foreground" />
          </CardTitle>
          <CardDescription className="text-xs">
            Measured against all lifetime actions in <code>app.actions</code> and <code>app.threads</code>
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {funnelSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-border bg-card relative space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono text-[10px]">STAGE 0{idx + 1}</span>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {step.dropoff}
                  </Badge>
                </div>

                <div className="text-2xl font-extrabold text-foreground">
                  {step.count.toLocaleString()}
                </div>

                <div>
                  <div className="text-xs font-semibold text-foreground truncate">
                    {step.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {step.subtext}
                  </div>
                </div>

                {/* Visual bar fill */}
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.max(10, 100 - idx * 20)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trends & Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Activity Volume */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="shadow-none h-full">
            <CardHeader className="p-4 pb-2 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                Weekly Yield Velocity
              </CardTitle>
              <CardDescription className="text-xs">
                Discussions surfaced vs approvals vs replies per 7-day window.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {weeklyTrendData.map((w, idx) => (
                <div key={idx} className="space-y-1.5 p-3 rounded-lg border border-border bg-muted/20 text-xs">
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>{w.week}</span>
                    <span className="text-primary font-mono">{w.replied} Inbound Replies</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-muted-foreground text-[11px] pt-1">
                    <div>Found: <strong className="text-foreground">{w.found}</strong></div>
                    <div>Approved: <strong className="text-foreground">{w.approved}</strong></div>
                    <div>Reply Rate: <strong className="text-emerald-600 font-bold">{Math.round((w.replied / w.approved) * 100)}%</strong></div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex gap-0.5 mt-1">
                    <div className="bg-primary/40 h-full" style={{ width: "60%" }} />
                    <div className="bg-primary h-full" style={{ width: "25%" }} />
                    <div className="bg-emerald-500 h-full" style={{ width: "15%" }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Best Sources Performance Table */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="shadow-none h-full">
            <CardHeader className="p-4 pb-2 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-500" />
                Best Yielding Sources
              </CardTitle>
              <CardDescription className="text-xs">
                Ranked by conversion to customer validation discovery interviews.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border text-xs">
                {sourceYields.map((src, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-muted/30 transition">
                    <div>
                      <div className="font-semibold text-foreground font-mono">
                        {src.source}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {src.platform} • {src.approved} approved outreach actions
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-[10px]">
                        {src.interviews} Booked Calls
                      </Badge>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
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

      {/* Best Message Styles Breakdown */}
      <Card className="shadow-none">
        <CardHeader className="p-4 pb-2 border-b border-border bg-muted/20">
          <CardTitle className="text-sm font-semibold">Message Style & Tone Efficacy</CardTitle>
          <CardDescription className="text-xs">
            Performance differences across calibrated voice profiles in <code>app.voice_profiles</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tonePerformance.map((tp, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border bg-card text-xs space-y-2">
                <div className="font-semibold text-foreground">{tp.tone}</div>
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>Sent: {tp.sent}</span>
                  <span>Sentiment: {tp.sentiment}</span>
                </div>
                <div className="pt-1 border-t border-border flex justify-between items-center">
                  <span className="text-muted-foreground">Reply Rate:</span>
                  <span className="font-bold text-base text-primary font-mono">{tp.replyRate}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
