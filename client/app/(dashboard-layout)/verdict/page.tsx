"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Scale,
  Award,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileText,
  Filter,
  Layers,
  FlaskConical,
  DollarSign,
  Flame,
  Check,
} from "lucide-react";
import Link from "next/link";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function VerdictPage() {
  const { verdict, evidenceList, activeMission } = useDashboard();
  const [activeTab, setActiveTab] = useState<string>("evidence");
  const [filterSentiment, setFilterSentiment] = useState<string>("all");

  const filteredEvidence = evidenceList.filter((item) => {
    if (filterSentiment === "all") return true;
    return item.sentiment === filterSentiment;
  });

  const dimensionScores = [
    { dimension: "Problem Urgency", score: 92, benchmark: 70 },
    { dimension: "Budget Availability", score: 84, benchmark: 65 },
    { dimension: "Dissatisfaction w/ Current Tools", score: 88, benchmark: 60 },
    { dimension: "Switching Friction (Inverted)", score: 76, benchmark: 55 },
    { dimension: "Referral / Word-of-Mouth Potential", score: 80, benchmark: 50 },
  ];

  const renderSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "willing_to_pay":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-mono">Willing to Pay</Badge>;
      case "strong_pain":
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] font-mono">High Pain Point</Badge>;
      case "positive":
        return <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20 text-[10px] font-mono">Positive Validation</Badge>;
      case "skeptical":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-mono">Skeptical Objection</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] font-mono">{sentiment}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono">
              Validator Engine Output
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              ai.mission_verdicts
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Market Evidence & Verdict Model
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Statistical demand synthesis derived from qualitative customer interviews and organic social signals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs px-3 py-1 font-mono">
            Model Confidence: {Math.round(verdict.confidence * 100)}%
          </Badge>
        </div>
      </div>

      {/* 2. Top Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Verdict */}
        <Card className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Overall Verdict</span>
              <Award className="size-4 text-emerald-600" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-foreground tracking-tight">
                {verdict.verdict_display}
              </span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            Strong signal to proceed to build
          </div>
        </Card>

        {/* Metric 2: Demand Intensity */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Demand Intensity</span>
              <Flame className="size-4 text-orange-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {verdict.demand_signal_strength} <span className="text-base text-muted-foreground font-normal">/ 100</span>
              </span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40">
            <Progress value={verdict.demand_signal_strength} className="h-1.5" />
          </div>
        </Card>

        {/* Metric 3: WTP Strength */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Willingness to Pay</span>
              <DollarSign className="size-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {verdict.willingness_to_pay_strength} <span className="text-base text-muted-foreground font-normal">/ 100</span>
              </span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40">
            <Progress value={verdict.willingness_to_pay_strength} className="h-1.5" />
          </div>
        </Card>

        {/* Metric 4: Weighted Evidence Count */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Verified Evidence</span>
              <FileText className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {evidenceList.length}
              </span>
              <span className="text-xs text-muted-foreground font-mono">Data Points</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            Qualitative quotes & thread data
          </div>
        </Card>
      </div>

      {/* 3. Synthesis Rationale Banner */}
      <Card className="rounded-xl border border-border/70 bg-card shadow-xs p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            Executive Synthesis Rationale
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal bg-muted/20 p-4 rounded-xl border border-border/60">
          {verdict.rationale}
        </p>
      </Card>

      {/* 4. Tabs: Evidence Stream, Counter-Arguments, Tests, Dimension Breakdown */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val || "evidence")} className="w-full space-y-4">
        <div className="border-b border-border/60 pb-3">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex-wrap">
            <TabsTrigger
              value="evidence"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="size-3.5" />
              Evidence Stream ({evidenceList.length})
            </TabsTrigger>
            <TabsTrigger
              value="counter"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ShieldAlert className="size-3.5" />
              Counter-Arguments & Risks ({verdict.counter_arguments.length})
            </TabsTrigger>
            <TabsTrigger
              value="experiments"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FlaskConical className="size-3.5" />
              Recommended Experiments ({verdict.next_tests.length})
            </TabsTrigger>
            <TabsTrigger
              value="breakdown"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Scale className="size-3.5" />
              Dimension Breakdown
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: EVIDENCE STREAM */}
        <TabsContent value="evidence" className="space-y-4">
          <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    Market Evidence & Quote Ledger
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Direct quotes from prospective buyers and active discussions with statistical weights.
                  </CardDescription>
                </div>

                {/* Filter pills */}
                <div className="flex items-center gap-1.5 text-xs flex-wrap">
                  {[
                    { id: "all", label: "All Evidence" },
                    { id: "willing_to_pay", label: "WTP Signals" },
                    { id: "strong_pain", label: "Pain Points" },
                    { id: "skeptical", label: "Objections" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilterSentiment(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        filterSentiment === f.id
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              <div className="space-y-3">
                {filteredEvidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-xl border border-border/70 bg-card space-y-2.5 text-xs hover:border-primary/40 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{ev.author}</span>
                        <span className="text-muted-foreground font-mono">• {ev.source}</span>
                        {renderSentimentBadge(ev.sentiment)}
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                        <span>Evidence Weight: <strong className="text-foreground">{ev.weight}</strong></span>
                        {ev.url && (
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-foreground inline-flex items-center gap-0.5 text-primary"
                          >
                            Link <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-foreground/90 italic leading-relaxed pl-3 border-l-2 border-primary/50 font-normal">
                      &ldquo;{ev.quote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: COUNTER-ARGUMENTS */}
        <TabsContent value="counter" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verdict.counter_arguments.map((ca, idx) => (
              <Card key={idx} className="rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="size-4 text-rose-500 shrink-0" />
                    <h4 className="font-bold text-xs text-foreground">
                      {ca.point}
                    </h4>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] uppercase font-mono shrink-0 ${
                      ca.risk_level === "high"
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}
                  >
                    {ca.risk_level} Risk
                  </Badge>
                </div>

                <div className="p-3.5 rounded-lg bg-muted/30 border border-border/50 text-xs space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase font-mono">
                    Recommended Mitigation Strategy
                  </span>
                  <p className="text-xs text-foreground/90 leading-relaxed font-normal">
                    {ca.mitigation}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: RECOMMENDED EXPERIMENTS */}
        <TabsContent value="experiments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {verdict.next_tests.map((test, idx) => (
              <Card key={idx} className="rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className="text-[9px] uppercase font-mono capitalize"
                    >
                      {test.status.replace("_", " ")}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">Test 0{idx + 1}</span>
                  </div>

                  <h4 className="text-sm font-bold text-foreground">
                    {test.title}
                  </h4>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {test.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-mono text-[11px]">De-risk Priority</span>
                  <Badge variant="outline" className="text-[10px] font-mono text-primary bg-primary/5">
                    High Impact
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 4: DIMENSION BREAKDOWN */}
        <TabsContent value="breakdown" className="space-y-4">
          <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/10">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Scale className="size-4 text-primary" />
                Multi-Dimensional Demand Analysis
              </CardTitle>
              <CardDescription className="text-xs">
                Scores rated 0-100 against established early-stage B2B benchmark criteria.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="h-72 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={dimensionScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="dimension" tick={{ fontSize: 10 }} stroke="#888888" interval={0} angle={-10} textAnchor="end" height={45} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#888888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="score" name="Verified Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="benchmark" name="Market Benchmark" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
