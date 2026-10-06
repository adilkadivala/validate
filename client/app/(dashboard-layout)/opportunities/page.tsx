"use client";

import React, { useState, useMemo } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Opportunity } from "@/lib/dashboard-data";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Search,
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
  ArrowUpRight,
  TrendingUp,
  Inbox,
  Send,
  Eye,
  Check,
  Radio,
  FileCheck2,
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer } from "recharts";

export default function OpportunitiesPage() {
  const {
    opportunities,
    approveOpportunity,
    skipOpportunity,
    badMatchOpportunity,
    updateDraft,
    activeMission,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "board">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftEditorText, setDraftEditorText] = useState("");

  // Sparkline data
  const sparklineData1 = [
    { v: 10 }, { v: 14 }, { v: 12 }, { v: 18 }, { v: 22 }, { v: 25 }, { v: 29 },
  ];
  const sparklineData2 = [
    { v: 75 }, { v: 78 }, { v: 82 }, { v: 84 }, { v: 86 }, { v: 89 }, { v: 92 },
  ];
  const sparklineData3 = [
    { v: 4 }, { v: 7 }, { v: 6 }, { v: 9 }, { v: 11 }, { v: 14 }, { v: 16 },
  ];
  const sparklineData4 = [
    { v: 2 }, { v: 5 }, { v: 6 }, { v: 8 }, { v: 12 }, { v: 15 }, { v: 19 },
  ];

  // Counts
  const counts = useMemo(() => {
    return {
      all: opportunities.length,
      high_score: opportunities.filter((o) => o.score >= 0.88).length,
      drafted: opportunities.filter((o) => o.status === "new" || o.status === "drafted").length,
      approved: opportunities.filter((o) => o.status === "approved" || o.status === "sent").length,
      skipped: opportunities.filter((o) => o.status === "skipped" || o.status === "bad_match").length,
    };
  }, [opportunities]);

  // Filtering logic
  const filteredOpps = useMemo(() => {
    return opportunities.filter((opp) => {
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
  }, [opportunities, activeTab, platformFilter, searchQuery]);

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
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px] font-mono">
            r/{subreddit || "reddit"}
          </Badge>
        );
      case "x":
        return (
          <Badge variant="outline" className="bg-sky-500/10 text-sky-600 border-sky-500/20 text-[10px] font-mono">
            X
          </Badge>
        );
      case "hackernews":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-mono">
            Hacker News
          </Badge>
        );
      case "linkedin":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-mono">
            LinkedIn
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-[10px] font-mono">{platform}</Badge>;
    }
  };

  const renderStatusBadge = (status: Opportunity["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Approved</Badge>;
      case "sent":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">Sent</Badge>;
      case "drafted":
      case "new":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Ready for Review</Badge>;
      case "skipped":
        return <Badge variant="outline" className="text-muted-foreground text-[10px]">Skipped</Badge>;
      case "bad_match":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">Bad Match</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
              Signal Engine
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Crawling 5 Active Sources
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Discovered Opportunities
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time discussions evaluated against mission spec criteria with generated contextual drafts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/40">
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
            className="text-xs gap-1.5 cursor-pointer h-8"
          >
            <Download className="size-3.5" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Signals */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Total Discovered</span>
              <Inbox className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {counts.all}
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20 font-mono">
                +14 Today
              </Badge>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Scanned across 5 sources</span>
            <div className="w-16 h-6 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={sparklineData1}>
                  <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Card 2: High Intent Matches */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>High Fit (&gt;88%)</span>
              <Flame className="size-4 text-orange-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {counts.high_score}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {Math.round((counts.high_score / (counts.all || 1)) * 100)}% ratio
              </span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Pain point intensity</span>
            <div className="w-16 h-6 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={sparklineData2}>
                  <Area type="monotone" dataKey="v" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Card 3: Ready for Review */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Ready for Review</span>
              <FileCheck2 className="size-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {counts.drafted}
              </span>
              <Badge variant="outline" className="text-[10px] text-amber-600 bg-amber-500/10 border-amber-500/20 font-mono">
                Action Required
              </Badge>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Contextual drafts prepared</span>
            <div className="w-16 h-6 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={sparklineData3}>
                  <Bar dataKey="v" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Card 4: Approved & Dispatched */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Approved & Sent</span>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {counts.approved}
              </span>
              <span className="text-xs text-emerald-600 font-medium font-mono">
                32% reply rate
              </span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Active outbound dialogue</span>
            <div className="w-16 h-6 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={sparklineData4}>
                  <Bar dataKey="v" fill="#10b981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Main Tabs & Filters */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val || "all")} className="w-full space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex-wrap">
            <TabsTrigger
              value="all"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer"
            >
              All Signals ({counts.all})
            </TabsTrigger>
            <TabsTrigger
              value="drafted"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              Ready for Review
              <span className="size-1.5 rounded-full bg-amber-500"></span>
              ({counts.drafted})
            </TabsTrigger>
            <TabsTrigger
              value="high_score"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer"
            >
              High Fit &gt;88% ({counts.high_score})
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer"
            >
              Approved ({counts.approved})
            </TabsTrigger>
            <TabsTrigger
              value="skipped"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer"
            >
              Skipped ({counts.skipped})
            </TabsTrigger>
          </TabsList>

          {/* Search & Platform Filter Toolbar */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search discussions or why match..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-card border-border/70 rounded-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            <Select value={platformFilter} onValueChange={(val) => setPlatformFilter(val || "all")}>
              <SelectTrigger className="h-8 w-32 text-xs bg-card border-border/70 rounded-lg">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="x">X / Twitter</SelectItem>
                <SelectItem value="hackernews">Hacker News</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tab Content Display */}
        {filteredOpps.length === 0 ? (
          <Card className="p-12 text-center border-dashed rounded-xl shadow-none">
            <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
              <Search className="size-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No opportunities match the criteria</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
              Try adjusting your search terms or selecting a different platform or status tab.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab("all");
                setPlatformFilter("all");
                setSearchQuery("");
              }}
              className="mt-4 text-xs cursor-pointer"
            >
              Reset Filters
            </Button>
          </Card>
        ) : viewMode === "table" ? (
          /* TABLE VIEW */
          <Card className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-16 text-center text-xs">Score</TableHead>
                  <TableHead className="w-28 text-xs">Channel</TableHead>
                  <TableHead className="text-xs">Discussion / Pain Signal</TableHead>
                  <TableHead className="hidden lg:table-cell text-xs">Agent Matching Reason</TableHead>
                  <TableHead className="w-28 text-xs">Status</TableHead>
                  <TableHead className="w-36 text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOpps.map((opp) => (
                  <TableRow
                    key={opp.id}
                    className="hover:bg-muted/20 transition cursor-pointer"
                    onClick={() => handleOpenDetail(opp)}
                  >
                    {/* Score */}
                    <TableCell className="text-center py-3">
                      <div className="flex flex-col items-center">
                        <span className={`text-xs font-bold font-mono ${
                          opp.score >= 0.88 ? "text-emerald-600 font-extrabold" : "text-foreground"
                        }`}>
                          {Math.round(opp.score * 100)}%
                        </span>
                        {opp.score >= 0.88 && (
                          <Flame className="size-3 text-orange-500 fill-orange-500" />
                        )}
                      </div>
                    </TableCell>

                    {/* Channel */}
                    <TableCell className="py-3">
                      <div className="space-y-0.5">
                        {renderPlatformBadge(opp.signal.platform, opp.signal.subreddit)}
                        <div className="text-[10px] text-muted-foreground font-mono truncate max-w-24">
                          {opp.signal.author_handle}
                        </div>
                      </div>
                    </TableCell>

                    {/* Signal content */}
                    <TableCell className="py-3 max-w-md">
                      <div className="space-y-1">
                        {opp.signal.title && (
                          <div className="text-xs font-semibold text-foreground line-clamp-1">
                            {opp.signal.title}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {opp.signal.body}
                        </p>
                      </div>
                    </TableCell>

                    {/* Why Match */}
                    <TableCell className="hidden lg:table-cell py-3 max-w-xs">
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed italic">
                        &ldquo;{opp.why_match}&rdquo;
                      </p>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3">
                      {renderStatusBadge(opp.status)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(opp)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Open Details & Draft"
                        >
                          <Eye className="size-3.5" />
                        </Button>

                        {opp.status !== "approved" && opp.status !== "sent" ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => approveOpportunity(opp.id)}
                              className="h-7 px-2 text-xs text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10 cursor-pointer"
                              title="Approve & Send Draft"
                            >
                              <Check className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => skipOpportunity(opp.id)}
                              className="h-7 px-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Skip"
                            >
                              <X className="size-3.5" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-1 pr-1">
                            <CheckCircle2 className="size-3" /> Dispatched
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          /* CARD / BOARD VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOpps.map((opp) => (
              <Card
                key={opp.id}
                onClick={() => handleOpenDetail(opp)}
                className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-primary/40 transition cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  {/* Top metadata strip */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {renderPlatformBadge(opp.signal.platform, opp.signal.subreddit)}
                      <span className="text-[11px] text-muted-foreground font-mono truncate max-w-28">
                        {opp.signal.author_handle}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-bold font-mono ${
                        opp.score >= 0.88 ? "text-emerald-600" : "text-foreground"
                      }`}>
                        {Math.round(opp.score * 100)}%
                      </span>
                      {opp.score >= 0.88 && <Flame className="size-3 text-orange-500 fill-orange-500" />}
                    </div>
                  </div>

                  {/* Title / Body */}
                  {opp.signal.title && (
                    <h3 className="text-xs font-bold text-foreground line-clamp-1 leading-snug">
                      {opp.signal.title}
                    </h3>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {opp.signal.body}
                  </p>

                  {/* Why match callout */}
                  <div className="p-2 rounded-lg bg-muted/40 border border-border/40 text-[11px] text-foreground/80 space-y-0.5">
                    <div className="text-[10px] uppercase font-mono text-muted-foreground font-semibold flex items-center gap-1">
                      <Sparkles className="size-2.5 text-primary" /> Why Matched
                    </div>
                    <p className="line-clamp-2 italic text-muted-foreground">
                      &ldquo;{opp.why_match}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Footer status & quick action */}
                <div
                  className="pt-2 border-t border-border/50 flex items-center justify-between text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>{renderStatusBadge(opp.status)}</div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetail(opp)}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      View
                    </Button>
                    {opp.status !== "approved" && opp.status !== "sent" ? (
                      <Button
                        size="sm"
                        onClick={() => approveOpportunity(opp.id)}
                        className="h-7 px-2 text-xs gap-1 cursor-pointer bg-primary text-primary-foreground"
                      >
                        <Check className="size-3" /> Approve
                      </Button>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-mono">Dispatched</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Tabs>

      {/* 4. Opportunity Detail & Draft Drawer (Sheet) */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="sm:max-w-xl p-0 gap-0 overflow-hidden flex flex-col">
          {selectedOpp && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <SheetHeader className="p-4 sm:p-5 border-b border-border/70 bg-muted/20">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {renderPlatformBadge(selectedOpp.signal.platform, selectedOpp.signal.subreddit)}
                    <span className="text-xs text-muted-foreground font-mono">
                      {selectedOpp.signal.author_handle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-foreground">
                      Match Score: {Math.round(selectedOpp.score * 100)}%
                    </span>
                    {renderStatusBadge(selectedOpp.status)}
                  </div>
                </div>

                <SheetTitle className="text-base font-bold text-foreground text-left leading-snug">
                  {selectedOpp.signal.title || "Discussion Signal"}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground text-left flex items-center gap-2">
                  <span>Detected {selectedOpp.surfaced_at || selectedOpp.signal.posted_at}</span>
                  {selectedOpp.signal.url && (
                    <a
                      href={selectedOpp.signal.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      Original post <ExternalLink className="size-3" />
                    </a>
                  )}
                </SheetDescription>
              </SheetHeader>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
                {/* Full discussion body */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    Prospect&apos;s Post
                  </h4>
                  <div className="p-3.5 rounded-lg border border-border/70 bg-card text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {selectedOpp.signal.body}
                  </div>
                </div>

                {/* Agent Reasoning */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Sparkles className="size-3 text-primary" /> Evaluation Reasoning
                  </h4>
                  <div className="p-3.5 rounded-lg border border-primary/20 bg-primary/5 text-foreground leading-relaxed">
                    {selectedOpp.why_match}
                  </div>
                </div>

                {/* Draft Outbound Message */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                      Outreach Draft
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingDraft(!isEditingDraft)}
                      className="h-6 px-2 text-xs text-primary gap-1 cursor-pointer"
                    >
                      <Edit3 className="size-3" />
                      {isEditingDraft ? "Cancel Edit" : "Edit Message"}
                    </Button>
                  </div>

                  {isEditingDraft ? (
                    <div className="space-y-2">
                      <Textarea
                        value={draftEditorText}
                        onChange={(e) => setDraftEditorText(e.target.value)}
                        className="min-h-32 text-xs font-normal leading-relaxed rounded-lg border-border"
                        placeholder="Customize outbound reply..."
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEditedDraft}
                          className="h-7 px-3 text-xs cursor-pointer"
                        >
                          Save Draft Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20 text-foreground whitespace-pre-wrap leading-relaxed font-normal">
                      {selectedOpp.drafts[0]?.body || "No draft generated for this item."}
                    </div>
                  )}

                  <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1">
                    <span>Tone calibrated against Active Voice Profile</span>
                    <span>{selectedOpp.drafts[0]?.body?.length || 0} characters</span>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <SheetFooter className="p-4 sm:p-5 border-t border-border/70 bg-card flex flex-col sm:flex-row items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    badMatchOpportunity(selectedOpp.id, "Irrelevant prospect discussion or low intent");
                    setIsDrawerOpen(false);
                  }}
                  className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer gap-1"
                >
                  <ThumbsDown className="size-3.5" /> Mark Bad Match
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      skipOpportunity(selectedOpp.id);
                      setIsDrawerOpen(false);
                    }}
                    className="text-xs cursor-pointer"
                  >
                    Skip
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      approveOpportunity(selectedOpp.id);
                      setIsDrawerOpen(false);
                    }}
                    className="text-xs gap-1.5 cursor-pointer bg-primary text-primary-foreground shadow-xs"
                  >
                    <Check className="size-3.5" /> Approve & Dispatch
                  </Button>
                </div>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
