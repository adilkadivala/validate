"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Source } from "@/lib/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Radio,
  Plus,
  Sparkles,
  Check,
  X,
  PlayCircle,
  PauseCircle,
  TrendingUp,
  Search,
  ExternalLink,
  Flame,
  Layers,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export default function SourcesPage() {
  const {
    sources,
    addSource,
    toggleSource,
    acceptSuggestedSource,
    rejectSuggestedSource,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<string>("monitored");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [platform, setPlatform] = useState<Source["platform"]>("reddit");
  const [kind, setKind] = useState<Source["kind"]>("subreddit");
  const [value, setValue] = useState("");

  const activeSources = sources.filter((s) => s.status === "active" || s.status === "paused");
  const suggestedSources = sources.filter((s) => s.status === "suggested");

  const totalMatches = activeSources.reduce((acc, s) => acc + s.matches_found, 0);
  const totalApproved = activeSources.reduce((acc, s) => acc + s.approved_count, 0);
  const avgYield = totalMatches > 0 ? Math.round((totalApproved / totalMatches) * 100) : 0;

  const yieldChartData = activeSources.map((s) => ({
    name: s.value,
    matches: s.matches_found,
    approved: s.approved_count,
    rate: s.matches_found > 0 ? Math.round((s.approved_count / s.matches_found) * 100) : 0,
  }));

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    addSource({
      platform,
      kind,
      value: value.trim(),
      created_by: "user",
      status: "active",
    });

    setValue("");
    setIsAddOpen(false);
  };

  const renderPlatformBadge = (plat: string) => {
    switch (plat) {
      case "reddit":
        return <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-600 border-orange-500/20 font-mono">Reddit</Badge>;
      case "x":
        return <Badge variant="outline" className="text-[10px] bg-sky-500/10 text-sky-600 border-sky-500/20 font-mono">X</Badge>;
      case "hackernews":
        return <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20 font-mono">HN</Badge>;
      case "linkedin":
        return <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20 font-mono">LinkedIn</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] font-mono">{plat}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-mono">
              Crawler Watchlist
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Crawled every 15 minutes
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Sources & Channel Watchlist
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure subreddits, keywords, and account feeds the autonomous crawler inspects for buyer signals.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddOpen(true)}
          className="text-xs gap-1.5 cursor-pointer h-8 bg-primary text-primary-foreground"
        >
          <Plus className="size-3.5" /> Add New Source
        </Button>
      </div>

      {/* 2. Top Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Monitored Sources</span>
              <Radio className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {activeSources.length}
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20 font-mono">
                All Active
              </Badge>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            Reddit, X, and Hacker News
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Discussions Found</span>
              <Search className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {totalMatches}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {totalApproved} converted
              </span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            Processed via mission embeddings
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Average Channel Yield</span>
              <TrendingUp className="size-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
                {avgYield}%
              </span>
              <span className="text-xs text-emerald-600 font-mono font-medium">High Relevance</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            Approval rate on surfaced items
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>AI Recommendations</span>
              <Sparkles className="size-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {suggestedSources.length}
              </span>
              <Badge variant="outline" className="text-[10px] text-amber-600 bg-amber-500/10 border-amber-500/20 font-mono">
                New Clusters
              </Badge>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            Discovered from outbound replies
          </div>
        </Card>
      </div>

      {/* 3. Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val || "monitored")} className="w-full space-y-4">
        <div className="border-b border-border/60 pb-3">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex-wrap">
            <TabsTrigger
              value="monitored"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Radio className="size-3.5" />
              Active Watchlist ({activeSources.length})
            </TabsTrigger>
            <TabsTrigger
              value="suggestions"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="size-3.5" />
              AI Suggestions ({suggestedSources.length})
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <BarChart3 className="size-3.5" />
              Yield Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: ACTIVE WATCHLIST */}
        <TabsContent value="monitored" className="space-y-4">
          <Card className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-28 text-xs">Channel</TableHead>
                  <TableHead className="text-xs">Source / Keyword Target</TableHead>
                  <TableHead className="w-28 text-xs">Status</TableHead>
                  <TableHead className="w-48 text-xs">Discussions & Yield</TableHead>
                  <TableHead className="w-28 text-right text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSources.map((source) => {
                  const yieldRate =
                    source.matches_found > 0
                      ? Math.round((source.approved_count / source.matches_found) * 100)
                      : 0;

                  return (
                    <TableRow key={source.id} className="hover:bg-muted/20 transition">
                      <TableCell className="py-3.5">
                        {renderPlatformBadge(source.platform)}
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="font-semibold text-xs text-foreground font-mono">
                          {source.value}
                        </div>
                        <div className="text-[11px] text-muted-foreground capitalize">
                          {source.kind} • Added by {source.created_by}
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono capitalize ${
                            source.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {source.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-foreground">{source.approved_count} approved</span>
                            <span className="text-muted-foreground">{yieldRate}% yield</span>
                          </div>
                          <Progress value={yieldRate} className="h-1.5 rounded-full" />
                        </div>
                      </TableCell>

                      <TableCell className="text-right py-3.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSource(source.id)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {source.status === "active" ? (
                            <span className="flex items-center gap-1 text-amber-600">
                              <PauseCircle className="size-3.5" /> Pause
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <PlayCircle className="size-3.5" /> Resume
                            </span>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* TAB 2: AI SUGGESTIONS */}
        <TabsContent value="suggestions" className="space-y-4">
          {suggestedSources.length === 0 ? (
            <Card className="p-8 text-center border-dashed rounded-xl shadow-none">
              <CheckCircle2 className="size-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-foreground">No pending AI suggestions</h3>
              <p className="text-xs text-muted-foreground mt-1">
                The agent is continuously scanning connected platforms and will recommend new channels when high-intent clusters emerge.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedSources.map((source) => (
                <Card key={source.id} className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {renderPlatformBadge(source.platform)}
                      <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/20">
                        Discovered Signal Cluster
                      </Badge>
                    </div>

                    <h4 className="text-base font-bold text-foreground font-mono">
                      {source.value}
                    </h4>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      High concentration of prospective buyers actively discussing integration test flakiness and CI queue delays.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-primary/10 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      ~12 matches/week estimated
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => rejectSuggestedSource(source.id)}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => acceptSuggestedSource(source.id)}
                        className="h-7 px-2.5 text-xs gap-1 cursor-pointer bg-primary text-primary-foreground"
                      >
                        <Check className="size-3" /> Approve & Monitor
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: YIELD ANALYTICS */}
        <TabsContent value="analytics" className="space-y-4">
          <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/10">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                Channel Yield Comparison: Found vs Approved
              </CardTitle>
              <CardDescription className="text-xs">
                Analyzing the quality ratio of discussions surfaced across each monitored community.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="h-72 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={yieldChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#888888" interval={0} angle={-10} textAnchor="end" height={40} />
                    <YAxis tick={{ fontSize: 11 }} stroke="#888888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Bar dataKey="matches" name="Discussions Found" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="approved" name="Approved Outreach" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 4. Add Source Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateSource}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Add Monitored Source</DialogTitle>
              <DialogDescription className="text-xs">
                The agent will periodically query this channel for matching prospect discussions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Platform</label>
                <Select value={platform} onValueChange={(val) => setPlatform(val as any)}>
                  <SelectTrigger className="h-8 text-xs rounded-lg">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reddit">Reddit</SelectItem>
                    <SelectItem value="x">X / Twitter</SelectItem>
                    <SelectItem value="hackernews">Hacker News</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Target Type</label>
                <Select value={kind} onValueChange={(val) => setKind(val as any)}>
                  <SelectTrigger className="h-8 text-xs rounded-lg">
                    <SelectValue placeholder="Kind" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subreddit">Subreddit (e.g. r/QualityAssurance)</SelectItem>
                    <SelectItem value="keyword">Keyword Query (e.g. &apos;flaky cypress tests&apos;)</SelectItem>
                    <SelectItem value="account">Account Feed (e.g. @tech_founder)</SelectItem>
                    <SelectItem value="group">Group / Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Identifier / Search Value</label>
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={
                    kind === "subreddit"
                      ? "r/softwaretesting"
                      : kind === "keyword"
                      ? "playwright flaky CI"
                      : "@cto_handle"
                  }
                  className="h-8 text-xs rounded-lg"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs cursor-pointer bg-primary text-primary-foreground"
              >
                Add Source to Watchlist
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
