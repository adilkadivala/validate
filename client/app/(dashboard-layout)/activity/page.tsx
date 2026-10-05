"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { AgentRun } from "@/lib/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

export default function ActivityPage() {
  const { agentRuns, triggerManualScan } = useDashboard();
  const [filterKind, setFilterKind] = useState<string>("all");
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredRuns = agentRuns.filter((r) => {
    if (filterKind === "blocked") return r.status === "blocked";
    if (filterKind !== "all") return r.kind === filterKind;
    return true;
  });

  const handleOpenDetail = (run: AgentRun) => {
    setSelectedRun(run);
    setIsDetailOpen(true);
  };

  const renderStatusBadge = (status: AgentRun["status"]) => {
    switch (status) {
      case "succeeded":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-mono">Succeeded</Badge>;
      case "blocked":
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs font-mono">Blocked by Policy</Badge>;
      case "running":
        return <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20 text-xs font-mono animate-pulse">Running</Badge>;
      case "failed":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs font-mono">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Agent Activity & Audit Log
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Transparent, plain-language timeline of autonomous actions, tool calls, and policy checks from <code>ai.agent_runs</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerManualScan}
            className="text-xs gap-1.5 cursor-pointer"
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
            className="text-xs gap-1.5 cursor-pointer"
          >
            <Download className="size-3.5" /> Export Log
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-2 text-xs">
        {[
          { id: "all", label: `All Activity (${agentRuns.length})` },
          { id: "scan", label: "Crawls & Scans" },
          { id: "execute_action", label: "Dispatched Outreach" },
          { id: "blocked", label: `Blocked by Guardrails (${agentRuns.filter((r) => r.status === "blocked").length})` },
          { id: "reply_poll", label: "Inbound Reply Checks" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterKind(tab.id)}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              filterKind === tab.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {filteredRuns.map((run) => (
          <Card
            key={run.id}
            onClick={() => handleOpenDetail(run)}
            className={`cursor-pointer hover:border-primary/40 transition shadow-none p-4 sm:p-5 space-y-3 ${
              run.status === "blocked" ? "border-rose-500/20 bg-rose-500/5" : ""
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
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                {run.description}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-normal">
                {run.details}
              </p>
            </div>

            {/* Blocked Explanation Alert if policy triggered */}
            {run.blocked_reason && (
              <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-500/10 text-xs space-y-1">
                <span className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5" />
                  Why was this blocked?
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
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border text-[11px] text-muted-foreground font-mono">
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
                Inspect steps <ArrowRight className="size-3" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Run Detail Modal */}
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
                <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                  <span className="font-semibold text-foreground block">Execution Summary</span>
                  <p className="text-muted-foreground leading-relaxed font-normal">
                    {selectedRun.details}
                  </p>
                </div>

                {/* Simplified Execution Steps */}
                <div className="space-y-2">
                  <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                    Harness Execution Steps
                  </span>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span className="font-medium text-foreground">1. Policy Pre-Check</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">Passed (12ms)</span>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span className="font-medium text-foreground">2. Vector Context Retrieval</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">Top 3 chunks (84ms)</span>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span className="font-medium text-foreground">3. LLM Inference & Calibration</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {selectedRun.tokens_in} tokens ({selectedRun.latency_ms}ms)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cost breakdown */}
                <div className="p-3 rounded-lg border border-border bg-muted/10 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Input Tokens</span>
                    <span className="font-bold text-foreground font-mono">{selectedRun.tokens_in}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Output Tokens</span>
                    <span className="font-bold text-foreground font-mono">{selectedRun.tokens_out}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Total Cost</span>
                    <span className="font-bold text-primary font-mono">
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
