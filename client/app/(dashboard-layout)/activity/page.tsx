"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { AgentRun } from "@/lib/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Activity,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  RefreshCw,
  Coins,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  Flame,
  Zap,
} from "lucide-react";

export default function ActivityPage() {
  const { agentRuns, triggerManualScan } = useDashboard();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredRuns = agentRuns.filter((r) => {
    if (activeTab === "blocked") return r.status === "blocked";
    if (activeTab !== "all") return r.kind === activeTab;
    return true;
  });

  const totalRuns = agentRuns.length;
  const succeededRuns = agentRuns.filter((r) => r.status === "succeeded").length;
  const blockedRuns = agentRuns.filter((r) => r.status === "blocked").length;
  const totalTokens = agentRuns.reduce((acc, r) => acc + r.tokens_in + r.tokens_out, 0);
  const totalCostUsd = agentRuns.reduce((acc, r) => acc + r.cost_micros, 0) / 1000000;

  const handleOpenDetail = (run: AgentRun) => {
    setSelectedRun(run);
    setIsDetailOpen(true);
  };

  const renderStatusBadge = (status: AgentRun["status"]) => {
    switch (status) {
      case "succeeded":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-mono">Succeeded</Badge>;
      case "blocked":
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] font-mono">Blocked by Policy</Badge>;
      case "running":
        return <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20 text-[10px] font-mono animate-pulse">Running</Badge>;
      case "failed":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-mono">Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] font-mono">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-mono">
              Autonomous Audit Log
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              ai.agent_runs
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Agent Activity & Execution Log
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Transparent, step-by-step timeline of autonomous actions, tool calls, and policy checks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerManualScan}
            className="text-xs gap-1.5 cursor-pointer h-8"
          >
            <RefreshCw className="size-3.5" /> Trigger Scan
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(agentRuns, null, 2)
              )}`;
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", jsonString);
              downloadAnchor.setAttribute("download", "agent_activity_runs.json");
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="text-xs gap-1.5 cursor-pointer h-8"
          >
            <Download className="size-3.5" /> Export Log
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Total Executions</span>
              <Activity className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {totalRuns}
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20 font-mono">
                All Audited
              </Badge>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            Continuous background daemon
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Success Rate</span>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
                {Math.round((succeededRuns / (totalRuns || 1)) * 100)}%
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {succeededRuns} runs clean
              </span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            Zero fatal API exceptions
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Policy Interventions</span>
              <ShieldAlert className="size-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {blockedRuns}
              </span>
              <span className="text-xs text-rose-600 font-mono font-medium">
                Prevented
              </span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            Safely intercepted by guardrails
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>LLM Compute Used</span>
              <Cpu className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {(totalTokens / 1000).toFixed(1)}k
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                ${totalCostUsd.toFixed(3)}
              </span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            Prompt tokens + completion
          </div>
        </Card>
      </div>

      {/* 3. Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val || "all")} className="w-full space-y-4">
        <div className="border-b border-border/60 pb-3">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex-wrap">
            <TabsTrigger
              value="all"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              All Activity ({agentRuns.length})
            </TabsTrigger>
            <TabsTrigger
              value="scan"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              Crawls & Scans ({agentRuns.filter((r) => r.kind === "scan").length})
            </TabsTrigger>
            <TabsTrigger
              value="execute_action"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              Dispatched Outreach ({agentRuns.filter((r) => r.kind === "execute_action").length})
            </TabsTrigger>
            <TabsTrigger
              value="blocked"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              Blocked by Guardrails ({blockedRuns})
            </TabsTrigger>
            <TabsTrigger
              value="reply_poll"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              Inbound Polls ({agentRuns.filter((r) => r.kind === "reply_poll").length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content Display */}
        <div className="space-y-3">
          {filteredRuns.map((run) => (
            <Card
              key={run.id}
              onClick={() => handleOpenDetail(run)}
              className={`cursor-pointer hover:border-primary/40 transition shadow-xs p-5 rounded-xl border space-y-3 ${
                run.status === "blocked"
                  ? "border-rose-500/30 bg-rose-500/5"
                  : "border-border/70 bg-card"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {renderStatusBadge(run.status)}
                  <span className="font-mono text-xs text-muted-foreground">
                    {run.id} • {run.trigger_type} trigger
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {run.started_at}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  {run.description}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-normal">
                  {run.details}
                </p>
              </div>

              {/* Blocked Explanation Alert if policy triggered */}
              {run.blocked_reason && (
                <div className="p-3.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-xs space-y-1">
                  <span className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="size-3.5" />
                    Why was this action blocked?
                  </span>
                  <p className="text-foreground/90 font-normal leading-relaxed">
                    {run.blocked_reason}
                  </p>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    Enforced policy: <code>{run.policy_triggered}</code> in <code>ai.policies</code>
                  </div>
                </div>
              )}

              {/* Metrics Strip: Tokens, Latency, Cost */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2.5 border-t border-border/50 text-[11px] text-muted-foreground font-mono">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Cpu className="size-3 text-primary" />
                    {run.tokens_in + run.tokens_out} tokens
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {run.latency_ms}ms latency
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Coins className="size-3 text-amber-500" />
                    ${(run.cost_micros / 1000000).toFixed(4)}
                  </span>
                </div>

                <span className="text-primary font-medium text-xs flex items-center gap-1">
                  Inspect trace steps <ArrowRight className="size-3" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </Tabs>

      {/* 4. Run Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          {selectedRun && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center justify-between mb-1">
                  {renderStatusBadge(selectedRun.status)}
                  <span className="font-mono text-xs text-muted-foreground">
                    ID: {selectedRun.id}
                  </span>
                </div>
                <DialogTitle className="text-base font-bold">
                  {selectedRun.description}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Started {selectedRun.started_at} • Triggered by {selectedRun.trigger_type} event
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Summary Description</h4>
                  <p className="text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50">
                    {selectedRun.details}
                  </p>
                </div>

                {selectedRun.blocked_reason && (
                  <div>
                    <h4 className="font-semibold text-rose-600 mb-1">Policy Block Reason</h4>
                    <p className="text-foreground/90 leading-relaxed bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                      {selectedRun.blocked_reason}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-2.5 rounded-lg border border-border bg-card">
                    <span className="text-muted-foreground text-[10px] uppercase font-mono block">Compute Tokens</span>
                    <span className="text-sm font-bold text-foreground font-mono">
                      {selectedRun.tokens_in} in / {selectedRun.tokens_out} out
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border bg-card">
                    <span className="text-muted-foreground text-[10px] uppercase font-mono block">Estimated Cost</span>
                    <span className="text-sm font-bold text-foreground font-mono">
                      ${(selectedRun.cost_micros / 1000000).toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
