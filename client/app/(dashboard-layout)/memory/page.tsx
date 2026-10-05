"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { UserMemory } from "@/lib/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
  ShieldAlert,
  Flame,
  Lightbulb,
} from "lucide-react";

export default function MemoryPage() {
  const {
    memories,
    toggleMemory,
    deleteMemory,
    addMemory,
    isAutoLearningEnabled,
    setIsAutoLearningEnabled,
  } = useDashboard();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [kind, setKind] = useState<UserMemory["kind"]>("preference");
  const [content, setContent] = useState("");
  const [filterKind, setFilterKind] = useState<string>("all");

  const filteredMemories = memories.filter((m) => {
    if (filterKind !== "all") return m.kind === filterKind;
    return true;
  });

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addMemory({
      kind,
      content: content.trim(),
      confidence: 0.95,
      evidence_count: 1,
      source: "user_edit",
      is_active: true,
    });

    setContent("");
    setIsAddOpen(false);
  };

  const renderKindBadge = (memoryKind: UserMemory["kind"]) => {
    switch (memoryKind) {
      case "preference":
        return <Badge variant="outline" className="bg-sky-500/10 text-sky-600 border-sky-500/20 text-xs">Preference</Badge>;
      case "voice_trait":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs">Voice Trait</Badge>;
      case "avoid":
        return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs">Topic to Avoid</Badge>;
      case "fact":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Learned Fact</Badge>;
      case "learned_rule":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">Learned Rule</Badge>;
      default:
        return <Badge variant="outline">{memoryKind}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Agent Memory & Continuous Learning
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Learned rules and user preferences derived from your approvals, edits, and rejections in <code>ai.user_memory</code>.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddOpen(true)}
          className="text-xs gap-1.5 cursor-pointer"
        >
          <Plus className="size-3.5" /> Add Custom Rule
        </Button>
      </div>

      {/* Auto-Learning Master Switch Banner */}
      <Card className="shadow-none border-border bg-card p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Brain className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">
                Autonomous Feedback Learning
              </h3>
              <p className="text-xs text-muted-foreground">
                When active, the agent automatically updates memory traits whenever you edit a draft or mark a bad match.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-foreground">
              {isAutoLearningEnabled ? "Active" : "Disabled"}
            </span>
            <Switch
              checked={isAutoLearningEnabled}
              onCheckedChange={setIsAutoLearningEnabled}
            />
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-2 text-xs">
        {[
          { id: "all", label: `All Memories (${memories.length})` },
          { id: "preference", label: "Preferences" },
          { id: "voice_trait", label: "Voice Traits" },
          { id: "avoid", label: "Avoid Topics" },
          { id: "fact", label: "Product Facts" },
          { id: "learned_rule", label: "Learned Rules" },
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

      {/* Memories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.map((mem) => (
          <Card
            key={mem.id}
            className={`shadow-none transition flex flex-col justify-between p-4 space-y-3 ${
              !mem.is_active ? "opacity-60 bg-muted/20" : ""
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                {renderKindBadge(mem.kind)}
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-[11px] text-emerald-600 font-semibold">
                    {Math.round(mem.confidence * 100)}% Confidence
                  </span>
                  <Badge variant="secondary" className="text-[10px] capitalize font-normal">
                    Via {mem.source}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-foreground leading-relaxed font-normal">
                {mem.content}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border text-[11px] text-muted-foreground">
              <span>Backed by {mem.evidence_count} evidence events</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleMemory(mem.id)}
                  className="h-6 text-xs px-2 cursor-pointer"
                >
                  {mem.is_active ? "Disable" : "Enable"}
                </Button>
                <button
                  type="button"
                  onClick={() => deleteMemory(mem.id)}
                  className="p-1 rounded text-muted-foreground hover:text-destructive transition cursor-pointer"
                  title="Delete memory"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Memory Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-5 text-primary" />
              Add Memory Preference
            </DialogTitle>
            <DialogDescription className="text-xs">
              Directly inject a guideline into the agent&apos;s working memory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateMemory} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Rule Category</label>
              <Select value={kind} onValueChange={(val: any) => setKind(val)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preference">Personal Preference</SelectItem>
                  <SelectItem value="voice_trait">Voice / Tone Trait</SelectItem>
                  <SelectItem value="avoid">Topic or Account to Avoid</SelectItem>
                  <SelectItem value="fact">Technical Product Fact</SelectItem>
                  <SelectItem value="learned_rule">Conditional Rule</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Rule Content
              </label>
              <Textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="e.g. Always emphasize our 14-day free trial when pricing is brought up..."
                className="text-xs leading-relaxed"
                required
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!content.trim()}>
                Save to Memory
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
