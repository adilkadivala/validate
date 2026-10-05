"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  HelpCircle,
  MessageSquarePlus,
  BookOpen,
  Sparkles,
  Star,
  Bug,
  Lightbulb,
  ExternalLink,
  MessageCircle,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

export default function HelpFeedbackPage() {
  const { submitFeedback } = useDashboard();

  const [kind, setKind] = useState<"bug" | "idea" | "rating" | "other">("idea");
  const [rating, setRating] = useState<number>(5);
  const [body, setBody] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    submitFeedback({
      kind,
      page: "/feedback",
      rating,
      body,
    });

    setBody("");
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const guides = [
    {
      title: "How to craft high-converting drafts with zero spam risk",
      readTime: "3 min read",
      summary:
        "The fastest way to get flagged on Reddit or X is pasting raw product links. Learn how our AST personalized phrasing achieves 29.5% response rates by validating developer frustration upfront.",
    },
    {
      title: "Optimizing your Source watchlist for high signal-to-noise ratio",
      readTime: "4 min read",
      summary:
        "How to structure Boolean query templates (e.g. 'flaky tests' OR 'CI bottleneck') and filter out low-intent promotional threads.",
    },
    {
      title: "How the Market Evidence & Verdict model calculates confidence",
      readTime: "5 min read",
      summary:
        "A breakdown of the Bayesian scoring algorithm that cross-references qualitative interview notes with organic social discussions.",
    },
    {
      title: "Setting up WhatsApp mobile instant approvals",
      readTime: "2 min read",
      summary:
        "Step-by-step instructions to link your mobile number to the Meta WhatsApp Cloud API bot for daily morning digests.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Help, Documentation & Feedback
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Operational guides, best practices, and direct feedback channel to the engineering team.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Direct Feedback Form */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="shadow-none">
            <CardHeader className="p-5 pb-3 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MessageSquarePlus className="size-4 text-primary" />
                In-App Feedback & Issue Reporting
              </CardTitle>
              <CardDescription className="text-xs">
                Stored in <code>app.feedback</code> and reviewed daily by the product team.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">Feedback Kind</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "idea", label: "Feature Idea", icon: Lightbulb },
                      { id: "bug", label: "Bug Report", icon: Bug },
                      { id: "rating", label: "Rating", icon: Star },
                      { id: "other", label: "General", icon: MessageCircle },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setKind(item.id as any)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition cursor-pointer ${
                          kind === item.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <item.icon className="size-4 mb-1" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {kind === "rating" && (
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1.5">
                      How accurate and helpful are the agent&apos;s drafts?
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1.5 text-amber-500 hover:scale-110 transition cursor-pointer"
                        >
                          <Star
                            className={`size-6 ${
                              star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Your Message
                  </label>
                  <Textarea
                    rows={4}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Describe what feature you'd like to see, or any issues encountered during outreach..."
                    className="text-xs leading-relaxed"
                    required
                  />
                </div>

                <Button type="submit" disabled={!body.trim()} className="w-full text-xs cursor-pointer">
                  Submit Feedback
                </Button>

                {isSubmitted && (
                  <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Thank you! Your feedback has been logged to the engineering backlog.</span>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Support Community Card */}
          <Card className="shadow-none border-primary/20 bg-primary/5 p-4 space-y-2 text-xs">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Developer & Founder Community
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              Connect directly with our core engineering team on Discord or GitHub for roadmap requests and custom crawler configurations.
            </p>
            <div className="pt-2 flex gap-3">
              <Button size="sm" variant="outline" className="text-xs gap-1.5 cursor-pointer">
                Join Discord <ExternalLink className="size-3" />
              </Button>
              <Button size="sm" variant="outline" className="text-xs gap-1.5 cursor-pointer">
                GitHub Issues <ExternalLink className="size-3" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Guides & Best Practices */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="shadow-none">
            <CardHeader className="p-5 pb-3 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="size-4 text-primary" />
                Playbooks & Quick Start Guides
              </CardTitle>
              <CardDescription className="text-xs">
                Proven strategies to maximize discovery yield and validate startup hypotheses.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {guides.map((g, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg border border-border bg-card space-y-1.5 text-xs hover:border-primary/40 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm">{g.title}</span>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {g.readTime}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed font-normal">
                    {g.summary}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
