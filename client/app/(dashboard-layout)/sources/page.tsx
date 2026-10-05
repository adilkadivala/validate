"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Source } from "@/lib/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";

export default function SourcesPage() {
  const {
    sources,
    addSource,
    toggleSource,
    acceptSuggestedSource,
    rejectSuggestedSource,
  } = useDashboard();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [platform, setPlatform] = useState<Source["platform"]>("reddit");
  const [kind, setKind] = useState<Source["kind"]>("subreddit");
  const [value, setValue] = useState("");

  const activeSources = sources.filter((s) => s.status === "active" || s.status === "paused");
  const suggestedSources = sources.filter((s) => s.status === "suggested");

  const totalMatches = activeSources.reduce((acc, s) => acc + s.matches_found, 0);
  const totalApproved = activeSources.reduce((acc, s) => acc + s.approved_count, 0);
  const avgYield = totalMatches > 0 ? Math.round((totalApproved / totalMatches) * 100) : 0;

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
        return <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-600 border-orange-500/20">Reddit</Badge>;
      case "x":
        return <Badge variant="outline" className="text-[10px] bg-sky-500/10 text-sky-600 border-sky-500/20">X</Badge>;
      case "hackernews":
        return <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">HN</Badge>;
      case "linkedin":
        return <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20">LinkedIn</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{plat}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Sources & Watchlist
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure subreddits, keywords, and account feeds the autonomous crawler inspects.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddOpen(true)}
          className="text-xs gap-1.5 cursor-pointer"
        >
          <Plus className="size-3.5" /> Add New Source
        </Button>
      </div>

      {/* Yield Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Monitored Sources</span>
            <Radio className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {activeSources.length}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Across Reddit, X, and Hacker News
          </div>
        </Card>

        <Card className="p-4 shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Matches Surfaced</span>
            <Search className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {totalMatches}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {totalApproved} converted to outreach approvals
          </div>
        </Card>

        <Card className="p-4 shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Average Source Yield</span>
            <TrendingUp className="size-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {avgYield}%
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Approval rate on surfaced items
          </div>
        </Card>
      </div>

      {/* Section: Agent Suggested Sources */}
      {suggestedSources.length > 0 && (
        <Card className="shadow-none border-primary/20 bg-primary/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
              <Sparkles className="size-4" />
              Agent Suggested Sources ({suggestedSources.length})
            </CardTitle>
            <CardDescription className="text-xs text-foreground/80">
              The crawler identified high-intent discussions clustering in these unmonitored channels.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedSources.map((source) => (
                <div
                  key={source.id}
                  className="p-3 rounded-lg border border-border bg-background flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <div className="flex items-center gap-2 mb-1">
                      {renderPlatformBadge(source.platform)}
                      <span className="font-semibold text-foreground truncate">
                        {source.value}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground capitalize">
                      {source.kind} • Detected {source.matches_found} candidate discussions
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => acceptSuggestedSource(source.id)}
                      className="h-7 text-xs gap-1 cursor-pointer bg-primary text-primary-foreground"
                    >
                      <Check className="size-3" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => rejectSuggestedSource(source.id)}
                      className="h-7 text-xs cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" /> Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Watchlist Table */}
      <Card className="shadow-none overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-border bg-muted/20">
          <CardTitle className="text-sm font-semibold">Active Watchlist</CardTitle>
          <CardDescription className="text-xs">
            Crawled continuously by FastAPI background runner according to guardrail quiet hours.
          </CardDescription>
        </CardHeader>
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Channel / Query</TableHead>
              <TableHead className="w-28">Platform</TableHead>
              <TableHead className="w-28">Type</TableHead>
              <TableHead className="w-40">Yield Performance</TableHead>
              <TableHead className="w-32">Last Scanned</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-20 text-right">Toggle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeSources.map((source) => (
              <TableRow key={source.id} className="text-xs">
                <TableCell className="font-semibold text-foreground font-mono">
                  {source.value}
                </TableCell>
                <TableCell>{renderPlatformBadge(source.platform)}</TableCell>
                <TableCell className="capitalize text-muted-foreground">
                  {source.kind}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span>{source.approved_count}/{source.matches_found} matches</span>
                      <span className="font-semibold text-foreground">{source.approval_rate}%</span>
                    </div>
                    <Progress value={source.approval_rate} className="h-1.5" />
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-[11px]">
                  {source.last_scanned_at}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] capitalize ${
                      source.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {source.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleSource(source.id)}
                    className="h-7 text-xs cursor-pointer"
                  >
                    {source.status === "active" ? (
                      <PauseCircle className="size-4 text-amber-500" />
                    ) : (
                      <PlayCircle className="size-4 text-emerald-500" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add Source Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-5 text-primary" />
              Add Monitored Source
            </DialogTitle>
            <DialogDescription className="text-xs">
              Directs the agent crawler to track a new community, query, or account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSource} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Platform</label>
                <Select value={platform} onValueChange={(val: any) => setPlatform(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reddit">Reddit</SelectItem>
                    <SelectItem value="x">X (Twitter)</SelectItem>
                    <SelectItem value="hackernews">Hacker News</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Source Kind</label>
                <Select value={kind} onValueChange={(val: any) => setKind(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subreddit">Subreddit</SelectItem>
                    <SelectItem value="keyword">Keyword</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="query">Search Query</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Value / Handle / Query String
              </label>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={
                  kind === "subreddit"
                    ? "e.g. r/Frontend"
                    : kind === "account"
                    ? "e.g. @rauchg"
                    : "e.g. 'Playwright test timeout'"
                }
                className="text-xs h-9 font-mono"
                required
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!value.trim()}>
                Add to Watchlist
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
