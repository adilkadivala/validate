"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Thread } from "@/lib/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Kanban,
  Table as TableIcon,
  Quote,
  TrendingUp,
  Flame,
  Check,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

export default function ConversationsPage() {
  const { threads, sendMessage, sendSuggestedFollowup, addInterviewNote } = useDashboard();
  const interviewNotes = threads.flatMap((t) => t.interview_notes || []);

  const [activeTab, setActiveTab] = useState<string>("kanban");
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

  const sparklineData = [
    { v: 12 }, { v: 15 }, { v: 18 }, { v: 22 }, { v: 26 }, { v: 28 }, { v: 34 },
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

  const handleOpenNoteModal = (th?: Thread) => {
    if (th) setSelectedThread(th);
    setNoteText("");
    setPainScore(5);
    setWillingnessToPay("yes");
    setKeyQuotes("");
    setIsNoteModalOpen(true);
  };

  const handleSaveInterviewNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const threadId = selectedThread ? selectedThread.id : (threads[0]?.id || "th-01");
    const contactName = selectedThread ? selectedThread.contact.display_name : "Discovery Interviewee";

    addInterviewNote(threadId, {
      contact_name: contactName,
      raw_note: noteText,
      key_quotes: keyQuotes
        ? keyQuotes.split("\n").filter((q) => q.trim().length > 0)
        : [],
      pain_score: painScore,
      willingness_to_pay: willingnessToPay,
    });

    setIsNoteModalOpen(false);
  };

  const renderPlatformBadge = (platform: string) => {
    switch (platform) {
      case "reddit":
        return <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-600 border-orange-500/20 font-mono">Reddit</Badge>;
      case "x":
        return <Badge variant="outline" className="text-[10px] bg-sky-500/10 text-sky-600 border-sky-500/20 font-mono">X</Badge>;
      case "hackernews":
        return <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20 font-mono">HN</Badge>;
      case "linkedin":
        return <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20 font-mono">LinkedIn</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] font-mono">{platform}</Badge>;
    }
  };

  const renderStageBadge = (stage: Thread["stage"]) => {
    switch (stage) {
      case "interview_scheduled":
      case "interviewed":
      case "converted":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Interview Booked</Badge>;
      case "interested":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Interested</Badge>;
      case "replied":
        return <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20 text-[10px]">Replied</Badge>;
      case "contacted":
        return <Badge variant="outline" className="text-muted-foreground text-[10px]">Contacted</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{stage}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-mono">
              Pipeline CRM
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Synchronized with app.threads
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Conversations & Lead Pipeline
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage dialogue progression from initial reach out through to customer validation calls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleOpenNoteModal()}
            className="text-xs gap-1.5 cursor-pointer h-8 bg-primary text-primary-foreground"
          >
            <Plus className="size-3.5" /> Log Interview Call Note
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Active Leads</span>
              <MessageSquare className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {threads.length}
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20 font-mono">
                Live Dialogue
              </Badge>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Across 4 platforms</span>
            <div className="w-16 h-5 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={sparklineData}>
                  <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Response Rate</span>
              <TrendingUp className="size-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                29.5%
              </span>
              <span className="text-xs text-emerald-600 font-mono font-medium">+17.5% lift</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            Benchmarked against cold DMs
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Booked Interviews</span>
              <Calendar className="size-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                9 <span className="text-base text-muted-foreground font-normal">/ 15</span>
              </span>
              <span className="text-xs text-emerald-600 font-mono font-medium">60% to goal</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            Next: Tomorrow, 3 PM EDT
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Interview Notes</span>
              <Quote className="size-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {interviewNotes.length}
              </span>
              <span className="text-xs text-muted-foreground font-mono">Evidence Logged</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            Synthesized into Verdict model
          </div>
        </Card>
      </div>

      {/* 3. Main Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val || "kanban")} className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-auto">
            <TabsTrigger
              value="kanban"
              className="rounded-lg px-3.5 py-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Kanban className="size-3.5" />
              Pipeline Kanban ({threads.length})
            </TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="rounded-lg px-3.5 py-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <TableIcon className="size-3.5" />
              Lead Contacts Table
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="rounded-lg px-3.5 py-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Quote className="size-3.5" />
              Customer Notes ({interviewNotes.length})
            </TabsTrigger>
          </TabsList>

          <span className="text-xs text-muted-foreground font-mono">
            Auto-followup frequency: 3 days
          </span>
        </div>

        {/* TAB 1: KANBAN BOARD */}
        <TabsContent value="kanban" className="space-y-4">
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
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/40 border border-border/70">
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
                      <div className="p-4 rounded-xl border border-dashed border-border/70 text-center text-xs text-muted-foreground/60 py-10">
                        No leads in stage
                      </div>
                    ) : (
                      stageThreads.map((thread) => {
                        const lastMsg = thread.messages[thread.messages.length - 1];

                        return (
                          <Card
                            key={thread.id}
                            onClick={() => handleOpenThread(thread)}
                            className="cursor-pointer hover:border-primary/50 transition-all duration-200 shadow-xs hover:shadow-sm p-4 space-y-2.5 rounded-xl border border-border/70 bg-card"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div className="truncate">
                                <h4 className="font-semibold text-xs text-foreground truncate">
                                  {thread.contact.display_name}
                                </h4>
                                <div className="text-[10px] text-muted-foreground font-mono truncate">
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
                              <p className="text-[11px] text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded-lg border border-border/40 font-normal leading-relaxed">
                                &ldquo;{lastMsg.body}&rdquo;
                              </p>
                            )}

                            <div className="flex flex-wrap gap-1 pt-0.5">
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
                              <div className="text-[10px] text-primary flex items-center gap-1 pt-2 border-t border-border/60">
                                <Clock className="size-3 shrink-0" />
                                <span className="truncate font-mono">Followup: {thread.next_followup_at}</span>
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
        </TabsContent>

        {/* TAB 2: CONTACTS TABLE */}
        <TabsContent value="contacts" className="space-y-4">
          <Card className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-xs">Contact Name</TableHead>
                  <TableHead className="text-xs">Channel</TableHead>
                  <TableHead className="text-xs">Organization / Role</TableHead>
                  <TableHead className="text-xs">Pipeline Stage</TableHead>
                  <TableHead className="text-xs">Last Message</TableHead>
                  <TableHead className="w-28 text-right text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {threads.map((thread) => {
                  const lastMsg = thread.messages[thread.messages.length - 1];
                  return (
                    <TableRow
                      key={thread.id}
                      className="hover:bg-muted/20 transition cursor-pointer"
                      onClick={() => handleOpenThread(thread)}
                    >
                      <TableCell className="py-3">
                        <div className="font-semibold text-xs text-foreground">
                          {thread.contact.display_name}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {thread.contact.handle}
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        {renderPlatformBadge(thread.contact.platform)}
                      </TableCell>

                      <TableCell className="py-3 text-xs text-muted-foreground">
                        {thread.contact.role || "Lead"} {thread.contact.company ? `at ${thread.contact.company}` : ""}
                      </TableCell>

                      <TableCell className="py-3">
                        {renderStageBadge(thread.stage)}
                      </TableCell>

                      <TableCell className="py-3 max-w-xs truncate text-xs text-muted-foreground">
                        {lastMsg?.body || "No messages"}
                      </TableCell>

                      <TableCell className="text-right py-3" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenThread(thread)}
                          className="h-7 px-2 text-xs text-primary hover:text-primary cursor-pointer"
                        >
                          Open Chat
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* TAB 3: CUSTOMER DISCOVERY NOTES */}
        <TabsContent value="notes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviewNotes.map((note) => (
              <Card key={note.id} className="rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {note.contact_name[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-foreground">
                        {note.contact_name}
                      </h4>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Pain: {note.pain_score}/5
                    </Badge>
                    <Badge
                      className={`text-[10px] font-mono capitalize ${
                        note.willingness_to_pay === "yes"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : note.willingness_to_pay === "maybe"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "text-muted-foreground"
                      }`}
                    >
                      WTP: {note.willingness_to_pay}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed font-normal bg-muted/20 p-3 rounded-lg border border-border/50">
                  {note.raw_note}
                </p>

                {note.key_quotes && note.key_quotes.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase font-mono">
                      Key Quotes
                    </span>
                    {note.key_quotes.map((q, idx) => (
                      <div key={idx} className="text-xs italic text-foreground border-l-2 border-primary/40 pl-2 py-0.5">
                        &ldquo;{q}&rdquo;
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 4. Lead Thread Drawer */}
      <Sheet open={isThreadOpen} onOpenChange={setIsThreadOpen}>
        <SheetContent side="right" className="sm:max-w-xl p-0 gap-0 overflow-hidden flex flex-col">
          {selectedThread && (
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <SheetHeader className="p-4 sm:p-5 border-b border-border/70 bg-muted/20">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">
                      {selectedThread.contact.display_name}
                    </h3>
                    {renderPlatformBadge(selectedThread.contact.platform)}
                  </div>
                  {renderStageBadge(selectedThread.stage)}
                </div>
                <SheetDescription className="text-xs text-muted-foreground flex items-center gap-3">
                  <span>{selectedThread.contact.role || "Lead"}</span>
                  <span>•</span>
                  <span>{selectedThread.contact.company || "Independent"}</span>
                  <span>•</span>
                  <span className="font-mono">{selectedThread.contact.handle}</span>
                </SheetDescription>
              </SheetHeader>

              {/* Thread Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
                {selectedThread.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.direction === "outbound" ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-muted-foreground font-mono">
                      <span>{msg.direction === "outbound" ? "Outbound Agent" : selectedThread.contact.display_name}</span>
                      <span>•</span>
                      <span>{new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-xl max-w-[85%] text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.direction === "outbound"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted/70 text-foreground border border-border/70 rounded-bl-none"
                      }`}
                    >
                      {msg.body}
                    </div>
                  </div>
                ))}

                {/* AI Next Action Suggestion */}
                <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                      <Sparkles className="size-3.5" /> Agent Suggested Reply
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyText("Would you be open to a quick 15-minute Zoom call this Thursday to share more about how your team tests flakiness? We'd love to share early access.")}
                      className="h-6 px-2 text-[10px] text-primary hover:text-primary cursor-pointer"
                    >
                      Insert Text
                    </Button>
                  </div>
                  <p className="text-xs text-foreground/90 italic">
                    &ldquo;Would you be open to a quick 15-minute Zoom call this Thursday to share more about how your team tests flakiness? We&apos;d love to share early access.&rdquo;
                  </p>
                </div>
              </div>

              {/* Drawer Reply Input */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-border/70 bg-card space-y-3">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a message or select suggested followup..."
                  className="min-h-20 text-xs rounded-lg"
                />
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenNoteModal(selectedThread)}
                    className="text-xs gap-1.5 cursor-pointer"
                  >
                    <Plus className="size-3" /> Log Interview Notes
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={!replyText.trim()}
                    className="text-xs gap-1.5 cursor-pointer bg-primary text-primary-foreground"
                  >
                    <Send className="size-3" /> Send Outbound
                  </Button>
                </div>
              </form>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* 5. Log Interview Note Modal */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSaveInterviewNote}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                Log Customer Discovery Note
              </DialogTitle>
              <DialogDescription className="text-xs">
                Record qualitative learnings, problem intensity, and pricing willingness to feed the Market Verdict Model.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Interview Learnings / Summary</label>
                <Textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="What was their core workflow? What tools do they use? What did they say about the current process?"
                  className="min-h-24 text-xs rounded-lg"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Key Direct Quotes (One per line)</label>
                <Textarea
                  value={keyQuotes}
                  onChange={(e) => setKeyQuotes(e.target.value)}
                  placeholder="&quot;We waste at least 4 hours every sprint fixing flaky tests...&quot;"
                  className="min-h-16 text-xs rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Pain Intensity (1 to 5)</label>
                  <Select value={String(painScore)} onValueChange={(val) => setPainScore(Number(val) || 5)}>
                    <SelectTrigger className="h-8 text-xs rounded-lg">
                      <SelectValue placeholder="Pain Score" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Mild inconvenience</SelectItem>
                      <SelectItem value="2">2 - Low priority annoyance</SelectItem>
                      <SelectItem value="3">3 - Moderate time drain</SelectItem>
                      <SelectItem value="4">4 - High operational pain</SelectItem>
                      <SelectItem value="5">5 - Critical bottleneck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Willingness to Pay</label>
                  <Select value={willingnessToPay} onValueChange={(val) => setWillingnessToPay(val as any)}>
                    <SelectTrigger className="h-8 text-xs rounded-lg">
                      <SelectValue placeholder="Willingness to Pay" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes - Explicitly validated</SelectItem>
                      <SelectItem value="maybe">Maybe - Conditional on features</SelectItem>
                      <SelectItem value="none">None - Expects free tool</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsNoteModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs cursor-pointer bg-primary text-primary-foreground"
              >
                Save Interview Note
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
