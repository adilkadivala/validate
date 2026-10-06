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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  Gauge,
  UserCheck,
  Zap,
  Lock,
  Moon,
  Shield,
  Sparkles,
  Check,
} from "lucide-react";

export default function GuardrailsPage() {
  const { guardrails, updateGuardrails } = useDashboard();

  const [activeTab, setActiveTab] = useState<string>("autonomy");
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
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-mono">
              Policy & Safety Suite
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Enforced by ai.policies
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Guardrails & Agent Autonomy
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Strict limits, autonomy thresholds, and safety policies enforced across all connected social channels.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleSaveGuardrails}
          className="text-xs gap-1.5 cursor-pointer h-8 bg-primary text-primary-foreground"
        >
          <Save className="size-3.5" /> Save Policies
        </Button>
      </div>

      {/* 2. Top Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Autonomy Mode</span>
              <ShieldCheck className="size-4 text-primary" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-foreground tracking-tight capitalize">
                {autonomy.replace("_", " ")}
              </span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            {autonomy === "draft_only"
              ? "Human signs off on all drafts"
              : autonomy === "approve_each"
              ? "1-click review on each signal"
              : "Review actions in batch digest"}
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Daily Action Cap</span>
              <Gauge className="size-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {dailyCap}
              </span>
              <span className="text-xs text-muted-foreground font-mono">max / 24h</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            Prevents platform spam penalties
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Quiet Hours</span>
              <Moon className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl font-bold text-foreground font-mono">
                {quietHoursEnabled ? `${quietStart} - ${quietEnd}` : "Disabled"}
              </span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            {quietHoursEnabled ? "Queues actions overnight" : "24/7 immediate sending"}
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Safety Blocklists</span>
              <Ban className="size-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {blockedTopics.length + blockedAccounts.length}
              </span>
              <span className="text-xs text-muted-foreground font-mono">filters</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            {blockedTopics.length} topics • {blockedAccounts.length} handles
          </div>
        </Card>
      </div>

      {/* 3. Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val || "autonomy")} className="w-full space-y-4">
        <div className="border-b border-border/60 pb-3">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex-wrap">
            <TabsTrigger
              value="autonomy"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="size-3.5" />
              Autonomy Level & Rate Caps
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Clock className="size-3.5" />
              Quiet Hours & Schedule
            </TabsTrigger>
            <TabsTrigger
              value="blacklists"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Ban className="size-3.5" />
              Topic & Account Safety Filters
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: AUTONOMY & RATE LIMITS */}
        <TabsContent value="autonomy" className="space-y-6">
          {/* Autonomy Level Card Selector */}
          <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/10">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                Select Agent Autonomy Threshold
              </CardTitle>
              <CardDescription className="text-xs">
                Control how much decision authority the AI agent possesses before dispatching messages.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Option 1: Draft Only */}
                <div
                  onClick={() => setAutonomy("draft_only")}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                    autonomy === "draft_only"
                      ? "border-primary bg-primary/5"
                      : "border-border/70 bg-card hover:border-border"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] font-mono">Safest</Badge>
                      {autonomy === "draft_only" && <Check className="size-4 text-primary" />}
                    </div>
                    <h4 className="font-bold text-sm text-foreground">
                      Draft Only
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Every single outbound message is drafted and placed in your approval queue. Zero messages are sent without your explicit 1-click consent.
                    </p>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono pt-2 border-t border-border/50">
                    Recommended during initial calibration
                  </div>
                </div>

                {/* Option 2: Approve Each */}
                <div
                  onClick={() => setAutonomy("approve_each")}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                    autonomy === "approve_each"
                      ? "border-primary bg-primary/5"
                      : "border-border/70 bg-card hover:border-border"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 border-emerald-500/20">Standard</Badge>
                      {autonomy === "approve_each" && <Check className="size-4 text-primary" />}
                    </div>
                    <h4 className="font-bold text-sm text-foreground">
                      Approve Each
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Review drafts individually in real-time or via mobile notifications. Outbound is dispatched immediately upon approval.
                    </p>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono pt-2 border-t border-border/50">
                    Interactive 1-click approval flow
                  </div>
                </div>

                {/* Option 3: Approve Batch */}
                <div
                  onClick={() => setAutonomy("approve_batch")}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                    autonomy === "approve_batch"
                      ? "border-primary bg-primary/5"
                      : "border-border/70 bg-card hover:border-border"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] font-mono text-amber-600 bg-amber-500/10 border-amber-500/20">Batch</Badge>
                      {autonomy === "approve_batch" && <Check className="size-4 text-primary" />}
                    </div>
                    <h4 className="font-bold text-sm text-foreground">
                      Approve in Batch
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Receive morning and evening summary digests to approve multiple drafted outreach messages in one go.
                    </p>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono pt-2 border-t border-border/50">
                    Max time efficiency for founders
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Action Cap & Platform Sliders */}
          <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/10">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Daily Volume Caps</span>
                <Badge variant="outline" className="text-xs font-mono">{dailyCap} Total Actions / Day</Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Enforce strict upper bounds on total outbound actions per 24-hour cycle to avoid platform rate limits.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              {/* Global Cap */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground">Global Daily Cap (All Platforms)</span>
                  <span className="font-mono text-primary font-bold">{dailyCap} actions</span>
                </div>
                <Slider
                  value={[dailyCap]}
                  onValueChange={(vals: any) => setDailyCap(Array.isArray(vals) ? vals[0] : Number(vals))}
                  min={5}
                  max={200}
                  step={5}
                  className="py-1 cursor-pointer"
                />
                <span className="text-[11px] text-muted-foreground block">
                  Once reached, the agent pauses outbound outreach until 00:00 UTC.
                </span>
              </div>

              {/* Per Platform Sliders */}
              <div className="pt-4 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">Reddit Cap</span>
                    <span className="font-mono font-bold text-orange-600">{platformCaps.reddit}</span>
                  </div>
                  <Slider
                    value={[platformCaps.reddit]}
                    onValueChange={(vals: any) => setPlatformCaps({ ...platformCaps, reddit: Array.isArray(vals) ? vals[0] : Number(vals) })}
                    min={1}
                    max={50}
                    step={1}
                    className="py-1 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">X / Twitter Cap</span>
                    <span className="font-mono font-bold text-sky-600">{platformCaps.x}</span>
                  </div>
                  <Slider
                    value={[platformCaps.x]}
                    onValueChange={(vals: any) => setPlatformCaps({ ...platformCaps, x: Array.isArray(vals) ? vals[0] : Number(vals) })}
                    min={1}
                    max={50}
                    step={1}
                    className="py-1 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">Hacker News Cap</span>
                    <span className="font-mono font-bold text-amber-600">{platformCaps.hackernews}</span>
                  </div>
                  <Slider
                    value={[platformCaps.hackernews]}
                    onValueChange={(vals: any) => setPlatformCaps({ ...platformCaps, hackernews: Array.isArray(vals) ? vals[0] : Number(vals) })}
                    min={1}
                    max={30}
                    step={1}
                    className="py-1 cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: SCHEDULE & QUIET HOURS */}
        <TabsContent value="schedule" className="space-y-4">
          <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Moon className="size-4 text-primary" />
                    Quiet Hours Enforcement
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Prevent automated outbounds from delivering during prospect local evening or sleeping hours.
                  </CardDescription>
                </div>
                <Switch
                  checked={quietHoursEnabled}
                  onCheckedChange={setQuietHoursEnabled}
                />
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Quiet Window Start</label>
                  <Input
                    type="time"
                    value={quietStart}
                    onChange={(e) => setQuietStart(e.target.value)}
                    disabled={!quietHoursEnabled}
                    className="h-8 text-xs rounded-lg font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Quiet Window End</label>
                  <Input
                    type="time"
                    value={quietEnd}
                    onChange={(e) => setQuietEnd(e.target.value)}
                    disabled={!quietHoursEnabled}
                    className="h-8 text-xs rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs text-muted-foreground flex items-center gap-2.5">
                <Clock className="size-4 text-primary shrink-0" />
                <span>
                  During quiet hours ({quietStart} to {quietEnd}), new approved messages are paused and safely held in the delivery buffer until morning.
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: BLACKLISTS & CONTENT SAFETY */}
        <TabsContent value="blacklists" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blocked Topics */}
            <Card className="rounded-xl border border-border/70 bg-card shadow-xs flex flex-col justify-between">
              <div>
                <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/10">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Ban className="size-4 text-rose-500" />
                    Blocked Content & Topics
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Discussions mentioning these subjects will be automatically discarded by policy.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <form onSubmit={handleAddTopic} className="flex gap-2">
                    <Input
                      placeholder="Add blocked topic (e.g. 'politics')..."
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      className="h-8 text-xs rounded-lg"
                    />
                    <Button type="submit" size="sm" className="h-8 px-3 text-xs cursor-pointer">
                      Add
                    </Button>
                  </form>

                  <div className="flex flex-wrap gap-1.5 min-h-24">
                    {blockedTopics.map((topic) => (
                      <Badge
                        key={topic}
                        variant="secondary"
                        className="text-xs gap-1 py-1 px-2.5 rounded-lg font-mono"
                      >
                        {topic}
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(topic)}
                          className="hover:text-destructive cursor-pointer ml-1"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Blocked Accounts */}
            <Card className="rounded-xl border border-border/70 bg-card shadow-xs flex flex-col justify-between">
              <div>
                <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/10">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <UserCheck className="size-4 text-rose-500" />
                    Blocked Accounts & Competitors
                  </CardTitle>
                  <CardDescription className="text-xs">
                    The agent will never interact with or quote these authors or handles.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <form onSubmit={handleAddAccount} className="flex gap-2">
                    <Input
                      placeholder="Add handle (e.g. '@competitor_bot')..."
                      value={newAccount}
                      onChange={(e) => setNewAccount(e.target.value)}
                      className="h-8 text-xs rounded-lg"
                    />
                    <Button type="submit" size="sm" className="h-8 px-3 text-xs cursor-pointer">
                      Add
                    </Button>
                  </form>

                  <div className="flex flex-wrap gap-1.5 min-h-24">
                    {blockedAccounts.map((account) => (
                      <Badge
                        key={account}
                        variant="outline"
                        className="text-xs gap-1 py-1 px-2.5 rounded-lg font-mono bg-rose-500/5 text-rose-700 border-rose-500/20"
                      >
                        {account}
                        <button
                          type="button"
                          onClick={() => handleRemoveAccount(account)}
                          className="hover:text-destructive cursor-pointer ml-1"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
