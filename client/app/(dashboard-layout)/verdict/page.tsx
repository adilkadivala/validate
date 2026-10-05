"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";

export default function VerdictPage() {
  const { verdict, evidenceList, activeMission } = useDashboard();
  const [filterSentiment, setFilterSentiment] = useState<string>("all");

  const filteredEvidence = evidenceList.filter((item) => {
    if (filterSentiment === "all") return true;
    return item.sentiment === filterSentiment;
  });

  const renderSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "willing_to_pay":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Willing to Pay</Badge>;
      case "strong_pain":
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px]">High Pain Point</Badge>;
      case "positive":
        return <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20 text-[10px]">Positive Validation</Badge>;
      case "skeptical":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Skeptical Objection</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{sentiment}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              Validator Mission Output
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Computed by ai.mission_verdicts
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Market Evidence & Verdict Model
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Statistical demand synthesis derived from qualitative customer interviews and organic social signals.
          </p>
        </div>

        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs px-3 py-1 font-mono">
          Confidence: {Math.round(verdict.confidence * 100)}%
        </Badge>
      </div>

      {/* Main Verdict Card */}
      <Card className="shadow-none border-emerald-500/30 bg-emerald-500/5 overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                <Scale className="size-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Autonomous Agent Assessment
                </span>
                <h2 className="text-2xl font-extrabold text-foreground">
                  {verdict.verdict_display}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-6 sm:text-right">
              <div>
                <span className="text-xs text-muted-foreground block">Demand Intensity</span>
                <span className="text-xl font-bold text-foreground font-mono">
                  {verdict.demand_signal_strength}/100
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Willingness to Pay</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {verdict.willingness_to_pay_strength}/100
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal bg-card/60 p-4 rounded-xl border border-emerald-500/20">
            {verdict.rationale}
          </p>
        </div>
      </Card>

      {/* Counter Arguments & Next Tests (Two columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* The Agent's Case Against The Idea */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="shadow-none h-full">
            <CardHeader className="p-4 pb-2 border-b border-border bg-rose-500/5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-800 dark:text-rose-300">
                <ShieldAlert className="size-4 text-rose-600" />
                The Agent&apos;s Case Against the Idea (Counter-Arguments)
              </CardTitle>
              <CardDescription className="text-xs">
                Risks identified in prospect interviews and competitive resistance points.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {verdict.counter_arguments.map((ca, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{ca.point}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] uppercase font-mono ${
                        ca.risk_level === "high"
                          ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}
                    >
                      {ca.risk_level} Risk
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Mitigation: </strong>
                    {ca.mitigation}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* What to Test Next */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="shadow-none h-full">
            <CardHeader className="p-4 pb-2 border-b border-border bg-primary/5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                <Sparkles className="size-4" />
                What to Test Next (Recommended Experiments)
              </CardTitle>
              <CardDescription className="text-xs">
                Suggested experiments to de-risk assumptions and validate unit economics.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {verdict.next_tests.map((test, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{test.title}</span>
                    <Badge
                      variant="secondary"
                      className="text-[9px] uppercase font-mono capitalize"
                    >
                      {test.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-normal">
                    {test.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weighted Evidence List */}
      <Card className="shadow-none">
        <CardHeader className="p-4 pb-3 border-b border-border bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Underlying Market Evidence ({filteredEvidence.length} items)
              </CardTitle>
              <CardDescription className="text-xs">
                Direct quotes from discussions and discovery calls with assigned statistical weights.
              </CardDescription>
            </div>

            {/* Sentiment Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs">
              {[
                { id: "all", label: "All" },
                { id: "willing_to_pay", label: "WTP Signals" },
                { id: "strong_pain", label: "Pain Points" },
                { id: "skeptical", label: "Objections" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterSentiment(f.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
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

        <CardContent className="p-4">
          <div className="space-y-3">
            {filteredEvidence.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-lg border border-border bg-card space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{ev.author}</span>
                    <span className="text-muted-foreground">• {ev.source}</span>
                    {renderSentimentBadge(ev.sentiment)}
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                    <span>Evidence Weight: <strong className="text-foreground">{ev.weight}</strong></span>
                    {ev.url && (
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-foreground"
                      >
                        <ExternalLink className="size-3" />
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
    </div>
  );
}
