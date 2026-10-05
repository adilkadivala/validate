"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboard } from "@/lib/dashboard-context";
import { MessageSquarePlus, Star, Bug, Lightbulb, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export function FeedbackDialog() {
  const { isFeedbackOpen, setIsFeedbackOpen, submitFeedback } = useDashboard();
  const pathname = usePathname();

  const [kind, setKind] = useState<"bug" | "idea" | "rating" | "other">("idea");
  const [rating, setRating] = useState<number>(5);
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      submitFeedback({
        kind,
        page: pathname || "/",
        rating,
        body,
      });
      setBody("");
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsFeedbackOpen(true)}
        className="rounded-full hover:bg-primary/5 text-muted-foreground hover:text-foreground cursor-pointer"
        title="Send feedback (bug, idea, rating)"
      >
        <MessageSquarePlus className="size-4.5" />
      </Button>

      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquarePlus className="size-5 text-primary" />
              Share Feedback or Report an Issue
            </DialogTitle>
            <DialogDescription>
              Your thoughts directly shape the autonomous sales agent engine. Logged to <code>app.feedback</code>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Feedback Type</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "idea", label: "Idea", icon: Lightbulb },
                  { id: "bug", label: "Bug", icon: Bug },
                  { id: "rating", label: "Rating", icon: Star },
                  { id: "other", label: "Other", icon: MessageCircle },
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
                <label className="text-xs font-medium text-foreground block mb-1.5">How would you rate your experience?</label>
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
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Current Page: <span className="font-mono text-muted-foreground">{pathname}</span>
              </label>
              <Textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                  kind === "bug"
                    ? "What went wrong? Describe what you expected to happen..."
                    : kind === "idea"
                    ? "What feature or improvement would make this 10x more valuable?"
                    : "Share your candid thoughts on draft accuracy and discovery speed..."
                }
                required
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFeedbackOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !body.trim()} className="cursor-pointer">
                {isSubmitting ? "Submitting..." : "Send Feedback"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
