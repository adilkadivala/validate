"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Mission } from "@/lib/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Compass,
  Edit3,
  Copy,
  Archive,
  Plus,
  History,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  ArrowRight,
  GitCommit,
  Check,
} from "lucide-react";

export default function MissionPage() {
  const {
    missions,
    activeMission,
    updateMission,
    toggleMissionStatus,
    createMission,
  } = useDashboard();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isNewMissionOpen, setIsNewMissionOpen] = useState(false);

  // Form states for editing
  const [title, setTitle] = useState(activeMission.title);
  const [goalText, setGoalText] = useState(activeMission.goal_text);
  const [audience, setAudience] = useState(activeMission.audience);
  const [willDoText, setWillDoText] = useState(activeMission.will_do.join("\n"));
  const [wontDoText, setWontDoText] = useState(activeMission.wont_do.join("\n"));

  // Form states for new mission
  const [newTitle, setNewTitle] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [newAudience, setNewAudience] = useState("");

  const handleOpenEdit = () => {
    setTitle(activeMission.title);
    setGoalText(activeMission.goal_text);
    setAudience(activeMission.audience);
    setWillDoText(activeMission.will_do.join("\n"));
    setWontDoText(activeMission.wont_do.join("\n"));
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMission(activeMission.id, {
      title,
      goal_text: goalText,
      audience,
      will_do: willDoText.split("\n").filter((l) => l.trim().length > 0),
      wont_do: wontDoText.split("\n").filter((l) => l.trim().length > 0),
    });
    setIsEditOpen(false);
  };

  const handleCreateNewMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createMission({
      title: newTitle,
      goal_text: newGoal,
      audience: newAudience,
    });
    setNewTitle("");
    setNewGoal("");
    setNewAudience("");
    setIsNewMissionOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs uppercase font-mono">
              {activeMission.intent.replace("_", " ")}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Version {activeMission.spec_version}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {activeMission.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            The mission parameters and guardrails instructing your autonomous agent.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleMissionStatus(activeMission.id)}
            className="text-xs gap-1.5 cursor-pointer"
          >
            {activeMission.status === "active" ? (
              <>
                <PauseCircle className="size-3.5 text-amber-500" /> Pause Mission
              </>
            ) : (
              <>
                <PlayCircle className="size-3.5 text-emerald-500" /> Resume Mission
              </>
            )}
          </Button>

          <Button
            size="sm"
            onClick={handleOpenEdit}
            className="text-xs gap-1.5 cursor-pointer"
          >
            <Edit3 className="size-3.5" /> Edit Mission Spec
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNewMissionOpen(true)}
            className="text-xs gap-1.5 cursor-pointer"
          >
            <Plus className="size-3.5" /> New Mission
          </Button>
        </div>
      </div>

      {/* Main Mission Card View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Goal & Target Audience */}
          <Card className="shadow-none">
            <CardHeader className="p-5 pb-3 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Objective & Primary Goal</span>
                <Compass className="size-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider mb-1">
                  Goal Statement
                </span>
                <p className="text-sm text-foreground leading-relaxed font-medium">
                  {activeMission.goal_text}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                <div>
                  <span className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider mb-1">
                    Target Audience & ICP
                  </span>
                  <p className="text-foreground leading-relaxed">
                    {activeMission.audience}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider mb-1">
                    Monitored Outreach Channels
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {activeMission.channels.map((ch, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs font-normal">
                        {ch}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: What the agent will and will not do */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Will Do */}
            <Card className="shadow-none border-emerald-500/20 bg-emerald-500/5">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  What the Agent Will Do
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2 text-xs">
                {activeMission.will_do.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-foreground/90">
                    <span className="text-emerald-600 font-bold shrink-0">•</span>
                    <span className="leading-relaxed font-normal">{rule}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Won't Do */}
            <Card className="shadow-none border-rose-500/20 bg-rose-500/5">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <XCircle className="size-4 text-rose-600" />
                  What the Agent Will NOT Do
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2 text-xs">
                {activeMission.wont_do.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-foreground/90">
                    <span className="text-rose-600 font-bold shrink-0">•</span>
                    <span className="leading-relaxed font-normal">{rule}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Version History & Actions */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Version History & Diff</span>
                <History className="size-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription className="text-xs">
                Audit trail from <code>app.mission_versions</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              {activeMission.versions.map((ver) => (
                <div
                  key={ver.version}
                  className="p-3 rounded-lg border border-border bg-muted/20 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      Spec v{ver.version} {ver.version === activeMission.spec_version ? "(Current)" : ""}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      By {ver.changed_by}
                    </span>
                  </div>
                  <p className="text-foreground text-xs font-normal">
                    {ver.change_note}
                  </p>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(ver.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Mission Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2 text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  createMission({
                    title: `${activeMission.title} (Copy)`,
                    goal_text: activeMission.goal_text,
                    audience: activeMission.audience,
                  });
                }}
                className="w-full justify-start text-xs gap-2 cursor-pointer"
              >
                <Copy className="size-3.5" /> Duplicate Mission
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toggleMissionStatus(activeMission.id);
                }}
                className="w-full justify-start text-xs gap-2 cursor-pointer text-muted-foreground"
              >
                <Archive className="size-3.5" /> Archive Mission
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Mission Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="size-5 text-primary" />
              Edit Mission Parameters
            </DialogTitle>
            <DialogDescription className="text-xs">
              Saving updates the mission spec and creates a new entry in <code>app.mission_versions</code>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Mission Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Mission Goal</label>
              <Textarea
                rows={2}
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                className="text-xs leading-relaxed"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Target Audience</label>
              <Textarea
                rows={2}
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="text-xs leading-relaxed"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-emerald-600 block mb-1">
                  What Agent Will Do (1 per line)
                </label>
                <Textarea
                  rows={4}
                  value={willDoText}
                  onChange={(e) => setWillDoText(e.target.value)}
                  className="text-xs font-mono leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-rose-600 block mb-1">
                  What Agent Won&apos;t Do (1 per line)
                </label>
                <Textarea
                  rows={4}
                  value={wontDoText}
                  onChange={(e) => setWontDoText(e.target.value)}
                  className="text-xs font-mono leading-relaxed"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Version {activeMission.spec_version + 1}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Mission Wizard Modal */}
      <Dialog open={isNewMissionOpen} onOpenChange={setIsNewMissionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-5 text-primary" />
              Create New Mission
            </DialogTitle>
            <DialogDescription className="text-xs">
              Spawns an independent crawler & outreach queue tailored to a new ICP.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateNewMission} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Mission Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Enterprise QA Lead Discovery"
                className="text-xs h-9"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Primary Goal</label>
              <Textarea
                rows={2}
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="What is the concrete measurable outcome?"
                className="text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Audience</label>
              <Textarea
                rows={2}
                value={newAudience}
                onChange={(e) => setNewAudience(e.target.value)}
                placeholder="Who should the agent look for?"
                className="text-xs"
                required
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsNewMissionOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!newTitle.trim()}>
                Create & Activate Mission
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
