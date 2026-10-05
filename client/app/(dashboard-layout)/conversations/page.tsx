"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Thread } from "@/lib/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  MessageSquare,
  Sparkles,
  ExternalLink,
  Send,
  Plus,
  User,
  Calendar,
  Building,
  Star,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function ConversationsPage() {
  const { threads, sendMessage, sendSuggestedFollowup, addInterviewNote } = useDashboard();

  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [isThreadOpen, setIsThreadOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  // Interview Note Modal state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [painScore, setPainScore] = useState<number>(5);
  const [willingnessToPay, setWillingnessToPay] = useState<"none" | "maybe" | "yes">("yes");
  const [keyQuotes, setKeyQuotes] = useState<string>("");

  const stages = [
    { id: "contacted", label: "Contacted", color: "bg-muted text-muted-foreground border-border" },
    { id: "replied", label: "Replied", color: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
    { id: "interested", label: "Interested", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    {
      id: "interview_scheduled",
      label: "Interview Scheduled / Converted",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    { id: "closed_lost", label: "Closed / Not a Fit", color: "bg-muted text-muted-foreground border-border" },
  ];

  const handleOpenThread = (th: Thread) => {
    setSelectedThread(th);
    setReplyText("");
    setIsThreadOpen(true);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !replyText.trim()) return;
    sendMessage(selectedThread.id, replyText);
    setReplyText("");
  };

  const handleOpenNoteModal = () => {
    setNoteText("");
    setPainScore(5);
    setWillingnessToPay("yes");
    setKeyQuotes("");
    setIsNoteModalOpen(true);
  };

  const handleSaveInterviewNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !noteText.trim()) return;

    addInterviewNote(selectedThread.id, {
      contact_name: selectedThread.contact.display_name,
      raw_note: noteText,
      key_quotes: keyQuotes
        ? keyQuotes.split("\n").filter((q) => q.trim().length > 0)
        : [],
      pain_score: painScore,
      willingness_to_pay: willingnessToPay,
    });

    setIsNoteModalOpen(false);
  };

  // Helper for platform tags
  const renderPlatformBadge = (platform: string) => {
    switch (platform) {
      case "reddit":
        return <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-600 border-orange-500/20">Reddit</Badge>;
      case "x":
        return <Badge variant="outline" className="text-[10px] bg-sky-500/10 text-sky-600 border-sky-500/20">X</Badge>;
      case "hackernews":
        return <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">HN</Badge>;
      case "linkedin":
        return <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20">LinkedIn</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{platform}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Conversations & Pipeline
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track dialogue progression from initial reach out through to customer validation calls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-2.5 py-1 font-mono">
            {threads.length} Active Leads
          </Badge>
        </div>
      </div>

      {/* Kanban Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {stages.map((stage) => {
          const stageThreads = threads.filter((t) => {
            if (stage.id === "interview_scheduled") {
              return (
                t.stage === "interview_scheduled" ||
                t.stage === "interviewed" ||
                t.stage === "converted"
              );
            }
            return t.stage === stage.id;
          });

          return (
            <div key={stage.id} className="space-y-3">
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-muted/40 border border-border">
                <span className="font-semibold text-xs text-foreground truncate">
                  {stage.label}
                </span>
                <Badge variant="secondary" className="text-[10px] font-mono px-1.5 h-4">
                  {stageThreads.length}
                </Badge>
              </div>

              {/* Cards in this stage */}
              <div className="space-y-3 min-h-[350px]">
                {stageThreads.length === 0 ? (
                  <div className="p-4 rounded-lg border border-dashed border-border/80 text-center text-xs text-muted-foreground/60 py-8">
                    No leads in this stage
                  </div>
                ) : (
                  stageThreads.map((thread) => {
                    const lastMsg = thread.messages[thread.messages.length - 1];

                    return (
                      <Card
                        key={thread.id}
                        onClick={() => handleOpenThread(thread)}
                        className="cursor-pointer hover:border-primary/50 transition-all duration-200 shadow-none hover:shadow-xs p-3.5 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="truncate">
                            <h4 className="font-semibold text-xs text-foreground truncate">
                              {thread.contact.display_name}
                            </h4>
                            <div className="text-[11px] text-muted-foreground font-mono truncate">
                              {thread.contact.handle}
                            </div>
                          </div>
                          {renderPlatformBadge(thread.contact.platform)}
                        </div>

                        {thread.contact.company && (
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Building className="size-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{thread.contact.company}</span>
                          </div>
                        )}

                        {lastMsg && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 bg-muted/40 p-2 rounded border border-border/40 font-normal">
                            &ldquo;{lastMsg.body}&rdquo;
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1 pt-1">
                          {thread.contact.tags.slice(0, 2).map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-[9px] py-0 px-1 font-normal text-muted-foreground"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {thread.next_followup_at && (
                          <div className="text-[10px] text-primary flex items-center gap-1 pt-1 border-t border-border">
                            <Clock className="size-3 shrink-0" />
                            <span className="truncate">{thread.next_followup_at}</span>
                          </div>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Thread Drawer (Conversation Details) */}
      <Sheet open={isThreadOpen} onOpenChange={setIsThreadOpen}>
        <SheetContent side="right" className="sm:max-w-xl p-0 gap-0 overflow-hidden flex flex-col">
          {selectedThread && (
            <div className="flex flex-col h-full">
              {/* Drawer Header: Contact Info */}
              <SheetHeader className="p-4 sm:p-5 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">
                      {selectedThread.contact.display_name}
                    </h3>
                    {renderPlatformBadge(selectedThread.contact.platform)}
                  </div>
                  <Badge variant="outline" className="text-xs uppercase font-mono">
                    {selectedThread.stage.replace("_", " ")}
                  </Badge>
                </div>
                <SheetDescription className="text-xs space-y-1">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{selectedThread.contact.role || "Lead"}</span>
                    <span>•</span>
                    <span>{selectedThread.contact.company || "Independent"}</span>
                  </div>
                  <p className="text-foreground/80 font-normal italic pt-0.5">
                    {selectedThread.contact.notes}
                  </p>
                </SheetDescription>
              </SheetHeader>

              {/* Message History Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-muted/10">
                {selectedThread.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.direction === "outbound" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                        msg.direction === "outbound"
                          ? "bg-primary text-primary-foreground rounded-tr-xs"
                          : "bg-card border border-border text-foreground rounded-tl-xs shadow-2xs"
                      }`}
                    >
                      <p className="whitespace-pre-line font-normal">{msg.body}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                      {msg.sent_at} • {msg.direction === "outbound" ? "You (Agent)" : selectedThread.contact.display_name}
                    </span>
                  </div>
                ))}

                {/* Suggested AI Follow-up Draft Card */}
                {selectedThread.suggested_draft && (
                  <Card className="mt-4 border-primary/20 bg-primary/5 shadow-none">
                    <CardHeader className="p-3 pb-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                          <Sparkles className="size-3.5" />
                          Suggested AI Follow-Up
                        </span>
                        <Button
                          size="sm"
                          onClick={() => sendSuggestedFollowup(selectedThread.id)}
                          className="h-6 text-xs gap-1 cursor-pointer bg-primary text-primary-foreground"
                        >
                          <Send className="size-3" /> Send
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-1 text-xs text-foreground/90 whitespace-pre-line font-normal">
                      {selectedThread.suggested_draft.body}
                    </CardContent>
                  </Card>
                )}

                {/* Logged Interview Notes section */}
                {selectedThread.interview_notes && selectedThread.interview_notes.length > 0 && (
                  <div className="pt-3 space-y-2 border-t border-border">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="size-3.5 text-primary" />
                      Logged Discovery Interview Notes
                    </h4>
                    {selectedThread.interview_notes.map((note) => (
                      <div key={note.id} className="p-3 rounded-lg border border-border bg-card text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                          <span>Pain Score: {note.pain_score}/5</span>
                          <span>Willingness to Pay: <strong className="uppercase text-foreground">{note.willingness_to_pay}</strong></span>
                        </div>
                        <p className="text-foreground leading-relaxed font-normal">{note.raw_note}</p>
                        {note.key_quotes.length > 0 && (
                          <div className="text-[11px] text-primary italic pl-2 border-l-2 border-primary">
                            &ldquo;{note.key_quotes[0]}&rdquo;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer: Reply Input & Quick Actions */}
              <div className="p-3 sm:p-4 border-t border-border bg-background space-y-2">
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type an instant reply or note..."
                    className="text-xs h-9"
                  />
                  <Button type="submit" size="sm" disabled={!replyText.trim()} className="h-9 px-3 cursor-pointer">
                    <Send className="size-3.5" />
                  </Button>
                </form>

                <div className="flex items-center justify-between pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenNoteModal}
                    className="text-xs h-7 gap-1.5 cursor-pointer text-primary border-primary/20 hover:bg-primary/5"
                  >
                    <FileText className="size-3" /> Log Interview Note
                  </Button>

                  <a
                    href={selectedThread.contact.profile_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    View External Profile <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal: Log Interview Note */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Log Customer Discovery Note
            </DialogTitle>
            <DialogDescription className="text-xs">
              Directly records findings from your interview into <code>app.interview_notes</code> and updates the Market Verdict model.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveInterviewNote} className="space-y-4 pt-1">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Interview Key Takeaways & Notes
              </label>
              <Textarea
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="What was their main testing bottleneck? How many hours are lost? What is their current budget?"
                className="text-xs leading-relaxed"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Verbatim Customer Quotes (1 per line)
              </label>
              <Textarea
                rows={2}
                value={keyQuotes}
                onChange={(e) => setKeyQuotes(e.target.value)}
                placeholder="e.g. 'We had a broken checkout slip into prod because tests were skipped'"
                className="text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Pain Score (1 to 5)
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPainScore(s)}
                      className={`size-8 rounded border text-xs font-bold transition cursor-pointer ${
                        painScore >= s
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Willingness to Pay
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(["none", "maybe", "yes"] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWillingnessToPay(w)}
                      className={`py-1.5 rounded border text-xs font-medium uppercase transition cursor-pointer ${
                        willingnessToPay === w
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNoteModalOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!noteText.trim()} className="cursor-pointer">
                Save & Update Verdict
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
