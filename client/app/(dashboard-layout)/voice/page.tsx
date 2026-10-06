"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { VoiceProfile } from "@/lib/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  RefreshCw,
  Sliders,
  Check,
  ArrowRight,
  Shield,
  MessageSquare,
  Wand2,
} from "lucide-react";

export default function VoicePage() {
  const {
    voiceProfiles,
    updateVoiceProfile,
    setDefaultVoiceProfile,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<string>("editor");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(
    voiceProfiles.find((v) => v.is_default)?.id || voiceProfiles[0].id
  );

  const activeVoice =
    voiceProfiles.find((v) => v.id === selectedVoiceId) || voiceProfiles[0];

  // Rule adders
  const [newDoRule, setNewDoRule] = useState("");
  const [newDontRule, setNewDontRule] = useState("");

  // Live Rewrite Playground
  const [playgroundInput, setPlaygroundInput] = useState(
    "Hey check out our tool, it has automated testing that solves all your problems. Click here to sign up for our platform."
  );
  const [playgroundOutput, setPlaygroundOutput] = useState<string | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);

  const handleAddDo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoRule.trim()) return;
    updateVoiceProfile(activeVoice.id, {
      do_rules: [...activeVoice.do_rules, newDoRule.trim()],
    });
    setNewDoRule("");
  };

  const handleRemoveDo = (index: number) => {
    updateVoiceProfile(activeVoice.id, {
      do_rules: activeVoice.do_rules.filter((_, i) => i !== index),
    });
  };

  const handleAddDont = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDontRule.trim()) return;
    updateVoiceProfile(activeVoice.id, {
      dont_rules: [...activeVoice.dont_rules, newDontRule.trim()],
    });
    setNewDontRule("");
  };

  const handleRemoveDont = (index: number) => {
    updateVoiceProfile(activeVoice.id, {
      dont_rules: activeVoice.dont_rules.filter((_, i) => i !== index),
    });
  };

  const handleTestRewrite = () => {
    setIsRewriting(true);
    setTimeout(() => {
      if (activeVoice.tone_preset === "friendly") {
        setPlaygroundOutput(
          "I know how brutal flaky test maintenance is on engineering momentum—we ran into the exact same wall with Cypress last quarter.\n\nWe put together a lightweight AST verification tool that catches broken journeys locally in 4s before pushing to CI. Happy to share the repo if you'd find it helpful to test against your flaky suite!"
        );
      } else if (activeVoice.tone_preset === "professional") {
        setPlaygroundOutput(
          "Selector brittle failures typically stem from tight coupling between test scripts and DOM hierarchy. By running visual AST semantic diffs in a pre-commit check, teams reduce redundant CI runner timeouts by ~70% without full browser overhead."
        );
      } else {
        setPlaygroundOutput(
          "Honestly went through the exact same nightmare with test flakiness. Built a small CLI tool that catches regressions in 4s before PR push. Super curious if this approach resonates with your stack!"
        );
      }
      setIsRewriting(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-mono">
              Brand Persona & Tone
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Stored in app.voice_profiles
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Voice & Tone Profiles
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Calibrate how the agent crafts outreach drafts, enforcing your brand guidelines and persona.
          </p>
        </div>

        {/* Profile Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/50 border border-border/70">
          {voiceProfiles.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVoiceId(v.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                selectedVoiceId === v.id
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{v.name}</span>
              {v.is_default && (
                <span className="size-1.5 rounded-full bg-emerald-500"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Selected Profile</span>
              <Volume2 className="size-4 text-primary" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-foreground tracking-tight">
                {activeVoice.name}
              </span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-primary/10 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>{activeVoice.is_default ? "Default Active Persona" : "Custom Variant"}</span>
            {!activeVoice.is_default && (
              <button
                onClick={() => setDefaultVoiceProfile(activeVoice.id)}
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                Set Default
              </button>
            )}
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Tone Style</span>
              <Sliders className="size-4 text-primary" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-foreground tracking-tight capitalize font-mono">
                {activeVoice.tone_preset}
              </span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            {activeVoice.tone_preset === "friendly" ? "Humble peer-to-peer inquiry" : "Direct engineering focus"}
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Enforced DO Rules</span>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {activeVoice.do_rules.length}
              </span>
              <span className="text-xs text-emerald-600 font-mono font-medium">Active</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            Injected into prompt instructions
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Enforced DON&apos;T Rules</span>
              <XCircle className="size-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {activeVoice.dont_rules.length}
              </span>
              <span className="text-xs text-rose-600 font-mono font-medium">Active</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            Banned phrases & spam behaviors
          </div>
        </Card>
      </div>

      {/* 3. Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val || "editor")} className="w-full space-y-4">
        <div className="border-b border-border/60 pb-3">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex-wrap">
            <TabsTrigger
              value="editor"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sliders className="size-3.5" />
              Voice Persona & Rules
            </TabsTrigger>
            <TabsTrigger
              value="playground"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Wand2 className="size-3.5" />
              Interactive Rewrite Studio
            </TabsTrigger>
            <TabsTrigger
              value="presets"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Volume2 className="size-3.5" />
              All Calibrated Profiles ({voiceProfiles.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: RULES & TONE PRESET */}
        <TabsContent value="editor" className="space-y-6">
          {/* Tone preset selector */}
          <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Select Tone Preset</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sets the baseline emotional posture and linguistic register for draft generation.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["friendly", "direct", "professional", "casual"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => updateVoiceProfile(activeVoice.id, { tone_preset: t })}
                  className={`p-3 rounded-xl border text-center font-medium capitalize text-xs transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    activeVoice.tone_preset === t
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border/70 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="font-bold">{t}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {t === "friendly"
                      ? "Collaborative & warm"
                      : t === "direct"
                      ? "Concise & analytical"
                      : t === "professional"
                      ? "Authoritative engineering"
                      : "Relaxed developer peer"}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* DO and DONT Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DO Rules */}
            <Card className="rounded-xl border border-border/70 bg-card shadow-xs flex flex-col justify-between">
              <div>
                <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="size-4" />
                      Do Rules ({activeVoice.do_rules.length})
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/20 font-mono">
                      Injected
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Mandatory styling rules the LLM must follow when creating drafts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  <div className="space-y-2">
                    {activeVoice.do_rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start justify-between gap-2 text-xs text-foreground/90 font-normal"
                      >
                        <span className="leading-relaxed">• {rule}</span>
                        <button
                          onClick={() => handleRemoveDo(idx)}
                          className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddDo} className="flex gap-2 pt-2">
                    <Input
                      value={newDoRule}
                      onChange={(e) => setNewDoRule(e.target.value)}
                      placeholder="Add a DO rule (e.g. 'Reference exact time savings')..."
                      className="text-xs h-8 rounded-lg"
                    />
                    <Button type="submit" size="sm" className="h-8 px-3 cursor-pointer">
                      <Plus className="size-3.5" />
                    </Button>
                  </form>
                </CardContent>
              </div>
            </Card>

            {/* DONT Rules */}
            <Card className="rounded-xl border border-border/70 bg-card shadow-xs flex flex-col justify-between">
              <div>
                <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-600">
                      <XCircle className="size-4" />
                      Don&apos;t Rules ({activeVoice.dont_rules.length})
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-500/20 font-mono">
                      Banned
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Prohibited words, marketing buzzwords, and intrusive sales behaviors.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  <div className="space-y-2">
                    {activeVoice.dont_rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-start justify-between gap-2 text-xs text-foreground/90 font-normal"
                      >
                        <span className="leading-relaxed">• {rule}</span>
                        <button
                          onClick={() => handleRemoveDont(idx)}
                          className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddDont} className="flex gap-2 pt-2">
                    <Input
                      value={newDontRule}
                      onChange={(e) => setNewDontRule(e.target.value)}
                      placeholder="Add a DON'T rule (e.g. 'Never say revolutionize')..."
                      className="text-xs h-8 rounded-lg"
                    />
                    <Button type="submit" size="sm" className="h-8 px-3 cursor-pointer">
                      <Plus className="size-3.5" />
                    </Button>
                  </form>
                </CardContent>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: PLAYGROUND */}
        <TabsContent value="playground" className="space-y-4">
          <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Wand2 className="size-4 text-primary" />
                    Live Voice Rewrite Playground
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Test how {activeVoice.name} transforms generic marketing pitches into authentic peer outreach.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={handleTestRewrite}
                  disabled={isRewriting}
                  className="text-xs gap-1.5 cursor-pointer h-8 bg-primary text-primary-foreground"
                >
                  <Sparkles className="size-3.5" />
                  {isRewriting ? "Synthesizing..." : "Run Test Rewrite"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Input text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Original / Generic Pitch Draft
                  </label>
                  <Textarea
                    value={playgroundInput}
                    onChange={(e) => setPlaygroundInput(e.target.value)}
                    className="min-h-36 text-xs rounded-xl"
                  />
                </div>

                {/* Output text */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">
                      Persona Rewritten Output
                    </label>
                    {playgroundOutput && (
                      <span className="text-[10px] text-emerald-600 font-mono font-medium">
                        ✓ Quality Checks Passed
                      </span>
                    )}
                  </div>
                  <div className="p-4 rounded-xl border border-border/70 bg-muted/20 min-h-36 text-xs text-foreground leading-relaxed whitespace-pre-wrap flex flex-col justify-center">
                    {playgroundOutput ? (
                      playgroundOutput
                    ) : (
                      <span className="text-muted-foreground italic text-center">
                        Click &apos;Run Test Rewrite&apos; to view the rewritten draft.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: ALL PROFILES */}
        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {voiceProfiles.map((v) => (
              <Card
                key={v.id}
                onClick={() => setSelectedVoiceId(v.id)}
                className={`rounded-xl border p-5 shadow-xs transition cursor-pointer space-y-4 flex flex-col justify-between ${
                  selectedVoiceId === v.id
                    ? "border-primary bg-primary/5"
                    : "border-border/70 bg-card hover:border-border"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={v.is_default ? "default" : "outline"} className="text-xs">
                      {v.is_default ? "Default Active" : "Alternative"}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono capitalize">
                      {v.tone_preset}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-foreground">
                    {v.name}
                  </h4>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {v.sample_posts?.[0] || "Calibrated voice persona."}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-mono text-[11px]">
                    {v.do_rules.length} DOs • {v.dont_rules.length} DON&apos;Ts
                  </span>

                  {!v.is_default && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDefaultVoiceProfile(v.id);
                      }}
                      className="h-7 text-xs cursor-pointer"
                    >
                      Make Default
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
