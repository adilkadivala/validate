"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { VoiceProfile } from "@/lib/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";

export default function VoicePage() {
  const {
    voiceProfiles,
    updateVoiceProfile,
    setDefaultVoiceProfile,
  } = useDashboard();

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Voice & Tone Profiles
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Calibrate how the agent crafts outreach drafts, enforcing your brand guidelines and persona.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {voiceProfiles.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVoiceId(v.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                selectedVoiceId === v.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-background hover:bg-muted text-muted-foreground border border-border"
              }`}
            >
              <span>{v.name}</span>
              {v.is_default && (
                <span className="text-[10px] px-1 rounded bg-primary-foreground/20 text-primary-foreground font-mono">
                  Default
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Profile Editor & Live Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rules & Preset */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="shadow-none">
            <CardHeader className="p-4 pb-3 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Volume2 className="size-4 text-primary" />
                  {activeVoice.name}
                </CardTitle>
                {!activeVoice.is_default && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDefaultVoiceProfile(activeVoice.id)}
                    className="h-7 text-xs cursor-pointer"
                  >
                    Set as Default Voice
                  </Button>
                )}
              </div>
              <CardDescription className="text-xs">
                Stored in <code>app.voice_profiles</code> and applied across all draft generations.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-4 text-xs">
              {/* Tone Preset Selector */}
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">
                  Tone Preset
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["friendly", "direct", "professional", "casual"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => updateVoiceProfile(activeVoice.id, { tone_preset: t })}
                      className={`p-2 rounded-md border text-center font-medium capitalize text-xs transition cursor-pointer ${
                        activeVoice.tone_preset === t
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Do Rules */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5" />
                    Do Rules ({activeVoice.do_rules.length})
                  </span>
                </div>
                <div className="space-y-1.5">
                  {activeVoice.do_rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-emerald-500/5 border border-emerald-500/15 flex items-start justify-between gap-2 text-foreground/90 font-normal"
                    >
                      <span className="leading-relaxed">• {rule}</span>
                      <button
                        onClick={() => handleRemoveDo(idx)}
                        className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddDo} className="flex gap-2 pt-1">
                  <Input
                    value={newDoRule}
                    onChange={(e) => setNewDoRule(e.target.value)}
                    placeholder="Add a DO rule (e.g. 'Reference exact time savings')..."
                    className="text-xs h-8"
                  />
                  <Button type="submit" size="sm" className="h-8 px-2.5 cursor-pointer">
                    <Plus className="size-3.5" />
                  </Button>
                </form>
              </div>

              {/* Don't Rules */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-rose-600 flex items-center gap-1.5">
                    <XCircle className="size-3.5" />
                    Don&apos;t Rules ({activeVoice.dont_rules.length})
                  </span>
                </div>
                <div className="space-y-1.5">
                  {activeVoice.dont_rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-rose-500/5 border border-rose-500/15 flex items-start justify-between gap-2 text-foreground/90 font-normal"
                    >
                      <span className="leading-relaxed">• {rule}</span>
                      <button
                        onClick={() => handleRemoveDont(idx)}
                        className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddDont} className="flex gap-2 pt-1">
                  <Input
                    value={newDontRule}
                    onChange={(e) => setNewDontRule(e.target.value)}
                    placeholder="Add a DON'T rule (e.g. 'Never use promotional UTM links')..."
                    className="text-xs h-8"
                  />
                  <Button type="submit" size="sm" className="h-8 px-2.5 cursor-pointer">
                    <Plus className="size-3.5" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Rewrite Playground */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="shadow-none border-primary/20">
            <CardHeader className="p-4 pb-2 bg-primary/5 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-primary">
                  <Sparkles className="size-4" />
                  Live Voice Rewrite Playground
                </span>
                <Badge variant="outline" className="text-[10px] font-mono capitalize">
                  {activeVoice.tone_preset} Mode
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Paste generic outreach copy to see how this voice profile transforms it into an authentic, high-converting message.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-4 text-xs">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Input: Generic or Sales Draft
                </label>
                <Textarea
                  rows={4}
                  value={playgroundInput}
                  onChange={(e) => setPlaygroundInput(e.target.value)}
                  className="text-xs font-mono leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleTestRewrite}
                  disabled={isRewriting}
                  className="text-xs gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`size-3 ${isRewriting ? "animate-spin" : ""}`} />
                  {isRewriting ? "Rewriting with Voice Model..." : "Test Voice Rewrite"}
                </Button>
              </div>

              {playgroundOutput && (
                <div className="space-y-2 pt-2 border-t border-border animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Check className="size-3.5 text-emerald-500" />
                      Voice-Aligned Output:
                    </span>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-mono">
                      98% Tone Adherence
                    </Badge>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-card text-xs text-foreground leading-relaxed whitespace-pre-line font-normal">
                    {playgroundOutput}
                  </div>

                  <div className="p-2.5 rounded bg-muted/40 border border-border text-[11px] text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">Why this works better:</p>
                    <p>• Stripped generic pitch (&lsquo;solves all your problems&rsquo; replaced with concrete 4s local check).</p>
                    <p>• Removed forced signup link; substituted with builder-to-builder collaboration offer.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
