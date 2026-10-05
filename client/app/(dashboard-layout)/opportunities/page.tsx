"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Opportunity, Draft } from "@/lib/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  ExternalLink,
  Flame,
  CheckCircle2,
  X,
  Edit3,
  Sparkles,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  Download,
  ThumbsDown,
  Layers,
  ArrowUpRight,
} from "lucide-react";

export default function OpportunitiesPage() {
  const {
    opportunities,
    approveOpportunity,
    skipOpportunity,
    badMatchOpportunity,
    updateDraft,
    activeMission,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<"all" | "high_score" | "drafted" | "approved" | "skipped">("all");
  const [viewMode, setViewMode] = useState<"table" | "board">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftEditorText, setDraftEditorText] = useState("");

  // Filtering logic
  const filteredOpps = opportunities.filter((opp) => {
    // Saved views tabs
    if (activeTab === "high_score" && opp.score < 0.88) return false;
    if (activeTab === "drafted" && opp.status !== "drafted" && opp.status !== "new") return false;
    if (activeTab === "approved" && opp.status !== "approved" && opp.status !== "sent") return false;
    if (activeTab === "skipped" && opp.status !== "skipped" && opp.status !== "bad_match") return false;

    // Platform filter
    if (platformFilter !== "all" && opp.signal.platform !== platformFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText =
        (opp.signal.title || "").toLowerCase().includes(q) ||
        opp.signal.body.toLowerCase().includes(q) ||
        opp.signal.author_handle.toLowerCase().includes(q) ||
        (opp.why_match || "").toLowerCase().includes(q);
      if (!matchText) return false;
    }

    return true;
  });

  const handleOpenDetail = (opp: Opportunity) => {
    setSelectedOpp(opp);
    setIsEditingDraft(false);
    setDraftEditorText(opp.drafts[0]?.body || "");
    setIsDrawerOpen(true);
  };

  const handleSaveEditedDraft = () => {
    if (!selectedOpp || !selectedOpp.drafts[0]) return;
    updateDraft(selectedOpp.id, selectedOpp.drafts[0].id, draftEditorText);
    setIsEditingDraft(false);
  };

  const renderPlatformBadge = (platform: string, subreddit?: string) => {
    switch (platform) {
      case "reddit":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs">
            Reddit {subreddit ? `(${subreddit})` : ""}
          </Badge>
        );
      case "x":
        return (
          <Badge variant="outline" className="bg-sky-500/10 text-sky-600 border-sky-500/20 text-xs">
            X
          </Badge>
        );
      case "hackernews":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
            Hacker News
          </Badge>
        );
      case "linkedin":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
            LinkedIn
          </Badge>
        );
      default:
        return <Badge variant="outline">{platform}</Badge>;
    }
  };

  const renderStatusBadge = (status: Opportunity["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Approved</Badge>;
      case "sent":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Sent</Badge>;
      case "drafted":
      case "new":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending Review</Badge>;
      case "skipped":
        return <Badge variant="outline" className="text-muted-foreground">Skipped</Badge>;
      case "bad_match":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Bad Match</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Opportunities
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Every discussion discovered by the agent across all monitored channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-border p-1 bg-muted/40">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md text-xs transition cursor-pointer ${
                viewMode === "table" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table view"
            >
              <TableIcon className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`p-1.5 rounded-md text-xs transition cursor-pointer ${
                viewMode === "board" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Card view"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(opportunities, null, 2)
              )}`;
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", jsonString);
              downloadAnchor.setAttribute("download", "opportunities_export.json");
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="text-xs gap-1.5 cursor-pointer"
          >
            <Download className="size-3.5" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Saved Views Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-2">
        {[
          { id: "all", label: `All (${opportunities.length})` },
          {
            id: "high_score",
            label: `High Intent >88% (${opportunities.filter((o) => o.score >= 0.88).length})`,
          },
          {
            id: "drafted",
            label: `Ready for Review (${opportunities.filter((o) => o.status === "new" || o.status === "drafted").length})`,
          },
          {
            id: "approved",
            label: `Approved & Sent (${opportunities.filter((o) => o.status === "approved" || o.status === "sent").length})`,
          },
          {
            id: "skipped",
            label: `Skipped (${opportunities.filter((o) => o.status === "skipped" || o.status === "bad_match").length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, authors, pain points..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={platformFilter} onValueChange={(val) => setPlatformFilter(val ?? "all")}>
            <SelectTrigger className="h-9 text-xs w-36">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="reddit">Reddit</SelectItem>
              <SelectItem value="x">X (Twitter)</SelectItem>
              <SelectItem value="hackernews">Hacker News</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground ml-auto">
            Showing {filteredOpps.length} results
          </span>
        </div>
      </div>

      {/* Opportunities Presentation: Table View */}
      {viewMode === "table" ? (
        <Card className="shadow-none overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-16">Score</TableHead>
                <TableHead className="w-28">Platform</TableHead>
                <TableHead>Discussion / Pain Signal</TableHead>
                <TableHead className="w-36">Author</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-24 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOpps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                    No opportunities match your filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOpps.map((opp) => (
                  <TableRow
                    key={opp.id}
                    className="cursor-pointer hover:bg-muted/30 transition"
                    onClick={() => handleOpenDetail(opp)}
                  >
                    <TableCell>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-mono font-semibold">
                        {Math.round(opp.score * 100)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{renderPlatformBadge(opp.signal.platform, opp.signal.subreddit)}</TableCell>
                    <TableCell className="max-w-md">
                      <div className="font-medium text-xs text-foreground truncate">
                        {opp.signal.title || opp.signal.body.slice(0, 60)}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {opp.why_match}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {opp.signal.author_handle}
                    </TableCell>
                    <TableCell>{renderStatusBadge(opp.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(opp);
                        }}
                        className="h-7 text-xs cursor-pointer"
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        /* Board / Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOpps.map((opp) => (
            <Card
              key={opp.id}
              onClick={() => handleOpenDetail(opp)}
              className="cursor-pointer hover:border-primary/40 transition shadow-none flex flex-col justify-between"
            >
              <CardHeader className="p-4 pb-2 space-y-2">
                <div className="flex items-center justify-between">
                  {renderPlatformBadge(opp.signal.platform, opp.signal.subreddit)}
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-mono">
                    {Math.round(opp.score * 100)}% Match
                  </Badge>
                </div>
                <CardTitle className="text-sm font-semibold line-clamp-2">
                  {opp.signal.title || opp.signal.body.slice(0, 75)}
                </CardTitle>
                <div className="text-xs text-muted-foreground font-mono">
                  {opp.signal.author_handle} • {opp.signal.posted_at}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2 text-xs">
                <p className="text-muted-foreground line-clamp-3 bg-muted/30 p-2 rounded border border-border/40">
                  &ldquo;{opp.signal.body}&rdquo;
                </p>
                <div className="text-[11px] text-primary bg-primary/5 p-2 rounded border border-primary/10">
                  <span className="font-semibold">Why match: </span>
                  {opp.why_match}
                </div>
              </CardContent>
              <div className="p-4 pt-2 border-t border-border flex items-center justify-between text-xs">
                {renderStatusBadge(opp.status)}
                <span className="text-primary font-medium flex items-center gap-1">
                  Inspect drawer <ArrowUpRight className="size-3.5" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Drawer (Sheet) */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="sm:max-w-xl p-0 gap-0 overflow-y-auto">
          {selectedOpp && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  {renderPlatformBadge(selectedOpp.signal.platform, selectedOpp.signal.subreddit)}
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-mono font-semibold">
                    Score: {Math.round(selectedOpp.score * 100)}%
                  </Badge>
                </div>
                <SheetTitle className="text-base font-bold leading-snug">
                  {selectedOpp.signal.title || "Social Signal Discussion"}
                </SheetTitle>
                <SheetDescription className="text-xs flex items-center gap-2">
                  <span>Author: {selectedOpp.signal.author_handle}</span>
                  <span>•</span>
                  <span>Posted: {selectedOpp.signal.posted_at}</span>
                </SheetDescription>
              </SheetHeader>

              <div className="p-6 space-y-6 flex-1">
                {/* 1. Original Post Full Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Original Discussion Post
                    </h4>
                    <a
                      href={selectedOpp.signal.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      Open Original on {selectedOpp.signal.platform.toUpperCase()}
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                  <div className="p-3.5 rounded-lg border border-border bg-muted/30 text-xs text-foreground leading-relaxed whitespace-pre-line">
                    {selectedOpp.signal.body}
                  </div>
                </div>

                {/* 2. Score Breakdown Breakdown Cards */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Score Breakdown & Signals
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg border border-border bg-background">
                      <span className="text-muted-foreground block text-[11px]">Pain Intensity</span>
                      <span className="text-base font-bold text-foreground">
                        {Math.round(selectedOpp.score_breakdown.pain * 100)}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-border bg-background">
                      <span className="text-muted-foreground block text-[11px]">Audience Fit</span>
                      <span className="text-base font-bold text-foreground">
                        {Math.round(selectedOpp.score_breakdown.fit * 100)}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-border bg-background">
                      <span className="text-muted-foreground block text-[11px]">Recency Factor</span>
                      <span className="text-base font-bold text-foreground">
                        {Math.round(selectedOpp.score_breakdown.recency * 100)}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-border bg-background">
                      <span className="text-muted-foreground block text-[11px]">Willingness to Pay</span>
                      <span className="text-base font-bold text-foreground">
                        {Math.round(selectedOpp.score_breakdown.wtp * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Why Match Explanation */}
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-foreground">
                  <span className="font-semibold text-primary block mb-0.5">Why the Agent Selected This:</span>
                  <p>{selectedOpp.why_match}</p>
                </div>

                {/* 4. Outreach Draft Editor */}
                {selectedOpp.drafts[0] && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <h4 className="font-semibold text-foreground uppercase tracking-wider">
                        Generated Outreach Draft (v{selectedOpp.drafts[0].version})
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{draftEditorText.length} chars</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-medium">96% Tone Match</span>
                      </div>
                    </div>

                    {isEditingDraft ? (
                      <div className="space-y-2">
                        <Textarea
                          rows={6}
                          value={draftEditorText}
                          onChange={(e) => setDraftEditorText(e.target.value)}
                          className="text-xs font-mono leading-relaxed"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditingDraft(false)}
                            className="h-7 text-xs cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveEditedDraft}
                            className="h-7 text-xs cursor-pointer"
                          >
                            Save Draft
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-3.5 rounded-lg border border-border bg-background text-xs text-foreground leading-relaxed whitespace-pre-line font-normal">
                          {selectedOpp.drafts[0].body}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDraftEditorText(selectedOpp.drafts[0].body);
                            setIsEditingDraft(true);
                          }}
                          className="text-xs h-7 gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="size-3" /> Edit in Live Playground
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <SheetFooter className="p-4 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between gap-2 mt-auto">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      badMatchOpportunity(selectedOpp.id, "Rejected via detail drawer");
                      setIsDrawerOpen(false);
                    }}
                    className="h-8 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <ThumbsDown className="size-3.5 mr-1" /> Bad Match
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      skipOpportunity(selectedOpp.id);
                      setIsDrawerOpen(false);
                    }}
                    className="h-8 text-xs text-muted-foreground cursor-pointer"
                  >
                    Skip
                  </Button>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    approveOpportunity(selectedOpp.id, draftEditorText);
                    setIsDrawerOpen(false);
                  }}
                  className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-medium cursor-pointer"
                >
                  <CheckCircle2 className="size-3.5" /> Approve & Dispatch
                </Button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
