"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Guardrails } from "@/lib/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  ShieldCheck,
  Clock,
  Ban,
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Save,
} from "lucide-react";

export default function GuardrailsPage() {
  const { guardrails, updateGuardrails } = useDashboard();

  const [autonomy, setAutonomy] = useState(guardrails.autonomy_level);
  const [dailyCap, setDailyCap] = useState(guardrails.daily_action_cap);
  const [platformCaps, setPlatformCaps] = useState(guardrails.platform_caps);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(guardrails.quiet_hours_enabled);
  const [quietStart, setQuietStart] = useState(guardrails.quiet_hours_start);
  const [quietEnd, setQuietEnd] = useState(guardrails.quiet_hours_end);
  const [blockedTopics, setBlockedTopics] = useState(guardrails.blocked_topics);
  const [blockedAccounts, setBlockedAccounts] = useState(guardrails.blocked_accounts);

  const [newTopic, setNewTopic] = useState("");
  const [newAccount, setNewAccount] = useState("");

  const handleSaveGuardrails = () => {
    updateGuardrails({
      autonomy_level: autonomy,
      daily_action_cap: dailyCap,
      platform_caps: platformCaps,
      quiet_hours_enabled: quietHoursEnabled,
      quiet_hours_start: quietStart,
      quiet_hours_end: quietEnd,
      blocked_topics: blockedTopics,
      blocked_accounts: blockedAccounts,
    });
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    setBlockedTopics([...blockedTopics, newTopic.trim().toLowerCase()]);
    setNewTopic("");
  };

  const handleRemoveTopic = (t: string) => {
    setBlockedTopics(blockedTopics.filter((item) => item !== t));
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.trim()) return;
    setBlockedAccounts([...blockedAccounts, newAccount.trim()]);
    setNewAccount("");
  };

  const handleRemoveAccount = (a: string) => {
    setBlockedAccounts(blockedAccounts.filter((item) => item !== a));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Guardrails & Agent Autonomy
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Strict limits, autonomy thresholds, and safety policies enforced through <code>app.guardrails</code> and <code>ai.policies</code>.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleSaveGuardrails}
          className="text-xs gap-1.5 cursor-pointer"
        >
          <Save className="size-3.5" /> Save Policies
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Autonomy Level & Daily Limits */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Autonomy Level */}
          <Card className="shadow-none">
            <CardHeader className="p-4 pb-3 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                Autonomy Level
              </CardTitle>
              <CardDescription className="text-xs">
                Dictates whether the agent requires manual confirmation before dispatching replies.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                {
                  id: "approve_each",
                  title: "Approve Each Action (Recommended)",
                  desc: "Agent drafts responses and queues them in Today approval feed. Nothing is sent without your explicit one-click confirmation.",
                },
                {
                  id: "approve_batch",
                  title: "Approve Daily Batch",
                  desc: "Agent aggregates up to 5 highest-relevance drafts into a single morning WhatsApp digest for rapid batch approval.",
                },
                {
                  id: "draft_only",
                  title: "Draft Only Mode (Sandbox)",
                  desc: "Agent never contacts any platform APIs directly. Generates copy for manual copy-pasting only.",
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setAutonomy(opt.id as any)}
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition flex items-start justify-between gap-3 ${
                    autonomy === opt.id
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground block">{opt.title}</span>
                    <p className="leading-relaxed font-normal">{opt.desc}</p>
                  </div>
                  <div
                    className={`size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      autonomy === opt.id ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {autonomy === opt.id && <div className="size-1.5 rounded-full bg-background" />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Card 2: Daily Caps */}
          <Card className="shadow-none">
            <CardHeader className="p-4 pb-3 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-semibold">Daily Action Limits & Quotas</CardTitle>
              <CardDescription className="text-xs">
                Hard caps per 24-hour rolling window. Once reached, further actions are automatically queued.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-foreground">Global Daily Cap:</span>
                  <span className="font-mono font-bold text-primary">{dailyCap} actions / day</span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={dailyCap}
                    onChange={(e) => setDailyCap(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Today&apos;s usage: {guardrails.actions_today} of {dailyCap} dispatched
                </div>
              </div>

              {/* Per-platform breakdown */}
              <div className="pt-3 border-t border-border space-y-3">
                <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wider">
                  Per-Platform Caps
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(platformCaps).map(([plat, cap]) => (
                    <div key={plat} className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
                      <span className="capitalize font-medium text-foreground">{plat}</span>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={cap}
                        onChange={(e) =>
                          setPlatformCaps({ ...platformCaps, [plat]: Number(e.target.value) })
                        }
                        className="w-16 h-7 text-xs font-mono text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quiet Hours, Blocked Topics & Accounts */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 3: Quiet Hours */}
          <Card className="shadow-none">
            <CardHeader className="p-4 pb-2 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  Quiet Hours
                </CardTitle>
                <Switch
                  checked={quietHoursEnabled}
                  onCheckedChange={setQuietHoursEnabled}
                />
              </div>
              <CardDescription className="text-xs">
                Pause outreach during evening and early morning hours in target timezone.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block text-[11px] mb-1">Start Time</label>
                  <Input
                    type="time"
                    value={quietStart}
                    onChange={(e) => setQuietStart(e.target.value)}
                    disabled={!quietHoursEnabled}
                    className="text-xs h-8 font-mono"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block text-[11px] mb-1">End Time</label>
                  <Input
                    type="time"
                    value={quietEnd}
                    onChange={(e) => setQuietEnd(e.target.value)}
                    disabled={!quietHoursEnabled}
                    className="text-xs h-8 font-mono"
                  />
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Current Timezone: <strong className="text-foreground">UTC (Coordinated Universal Time)</strong>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Blocked Topics & Accounts */}
          <Card className="shadow-none">
            <CardHeader className="p-4 pb-2 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-600">
                <Ban className="size-4" />
                Negative Filters & Blacklists
              </CardTitle>
              <CardDescription className="text-xs">
                Posts mentioning these topics or authors will be automatically rejected.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              {/* Blocked Topics */}
              <div className="space-y-2">
                <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wider">
                  Blocked Topics & Keywords
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {blockedTopics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className="text-xs bg-rose-500/5 text-rose-700 dark:text-rose-300 border-rose-500/20 pr-1 gap-1"
                    >
                      <span>{topic}</span>
                      <button
                        onClick={() => handleRemoveTopic(topic)}
                        className="hover:text-destructive cursor-pointer"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <form onSubmit={handleAddTopic} className="flex gap-2 pt-1">
                  <Input
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Add topic (e.g. 'crypto')..."
                    className="text-xs h-8"
                  />
                  <Button type="submit" size="sm" className="h-8 px-2.5 cursor-pointer">
                    <Plus className="size-3.5" />
                  </Button>
                </form>
              </div>

              {/* Blocked Accounts */}
              <div className="space-y-2 pt-3 border-t border-border">
                <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wider">
                  Blocked Accounts
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {blockedAccounts.map((acc) => (
                    <Badge
                      key={acc}
                      variant="outline"
                      className="text-xs font-mono bg-muted pr-1 gap-1"
                    >
                      <span>{acc}</span>
                      <button
                        onClick={() => handleRemoveAccount(acc)}
                        className="hover:text-destructive cursor-pointer"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <form onSubmit={handleAddAccount} className="flex gap-2 pt-1">
                  <Input
                    value={newAccount}
                    onChange={(e) => setNewAccount(e.target.value)}
                    placeholder="Add handle (e.g. '@spambot')..."
                    className="text-xs h-8 font-mono"
                  />
                  <Button type="submit" size="sm" className="h-8 px-2.5 cursor-pointer">
                    <Plus className="size-3.5" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
