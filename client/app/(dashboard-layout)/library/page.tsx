"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Asset } from "@/lib/dashboard-data";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FolderOpen,
  Plus,
  FileText,
  Globe,
  Sparkles,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  ExternalLink,
  UploadCloud,
  FileCheck,
} from "lucide-react";

export default function LibraryPage() {
  const { assets, addAsset, deleteAsset } = useDashboard();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form states
  const [kind, setKind] = useState<Asset["kind"]>("product_url");
  const [title, setTitle] = useState("");
  const [urlOrContent, setUrlOrContent] = useState("");

  const handleOpenInspect = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDrawerOpen(true);
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addAsset({
      kind,
      title: title.trim(),
      source_url: kind === "product_url" || kind === "link" ? urlOrContent : undefined,
      size_bytes: 350000,
      ingest_status: "ready",
      extracted_summary: `Agent parsed ${title.trim()} into semantic vectors. Extracted core product claims and architectural differentiators for draft personalization.`,
      extracted_points: [
        "Identified 3 core technical value props",
        "Extracted deterministic failure modes and recovery techniques",
        "Saved tone keywords: technical, empathetic, non-promotional",
      ],
      chunk_count: 12,
    });

    setTitle("");
    setUrlOrContent("");
    setIsAddOpen(false);
  };

  const renderKindBadge = (assetKind: Asset["kind"]) => {
    switch (assetKind) {
      case "product_url":
        return <Badge variant="outline" className="text-xs bg-sky-500/10 text-sky-600 border-sky-500/20">Product URL</Badge>;
      case "document":
        return <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/20">Document (PDF)</Badge>;
      case "sample_post":
        return <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">Sample Outreach</Badge>;
      case "resume":
        return <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Founder Bio</Badge>;
      default:
        return <Badge variant="outline">{assetKind}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Knowledge Library
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Material the agent uses to personalize outreach: product docs, founder resume, sample posts, and value props.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddOpen(true)}
          className="text-xs gap-1.5 cursor-pointer"
        >
          <Plus className="size-3.5" /> Add Material / URL
        </Button>
      </div>

      {/* Library Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <Card
            key={asset.id}
            onClick={() => handleOpenInspect(asset)}
            className="cursor-pointer hover:border-primary/40 transition shadow-none flex flex-col justify-between"
          >
            <CardHeader className="p-4 pb-2 space-y-2">
              <div className="flex items-center justify-between">
                {renderKindBadge(asset.kind)}
                <Badge
                  variant="outline"
                  className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 capitalize font-mono"
                >
                  {asset.ingest_status}
                </Badge>
              </div>

              <CardTitle className="text-sm font-semibold line-clamp-2">
                {asset.title}
              </CardTitle>

              {asset.source_url && (
                <div className="text-xs text-muted-foreground truncate font-mono flex items-center gap-1">
                  <Globe className="size-3 shrink-0" />
                  <span className="truncate">{asset.source_url}</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-4 pt-1 space-y-2 text-xs">
              {asset.extracted_summary && (
                <p className="text-muted-foreground line-clamp-3 bg-muted/30 p-2.5 rounded-lg border border-border/40 font-normal">
                  {asset.extracted_summary}
                </p>
              )}

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <Layers className="size-3 text-primary" />
                  {asset.chunk_count || 14} Vector Chunks
                </span>
                <span>{new Date(asset.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>

            <div className="p-4 pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="text-primary font-medium flex items-center gap-1">
                What Agent Extracted <FileCheck className="size-3.5" />
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteAsset(asset.id);
                }}
                className="p-1 rounded text-muted-foreground hover:text-destructive transition cursor-pointer"
                title="Remove asset"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Asset Extraction Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="sm:max-w-xl p-0 gap-0 overflow-y-auto">
          {selectedAsset && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  {renderKindBadge(selectedAsset.kind)}
                  <Badge variant="outline" className="text-xs font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    Parsed & Vectorized
                  </Badge>
                </div>
                <SheetTitle className="text-base font-bold">
                  {selectedAsset.title}
                </SheetTitle>
                <SheetDescription className="text-xs">
                  Read from <code>app.assets</code> and <code>ai.asset_chunks</code> (pgvector embedding 1536d).
                </SheetDescription>
              </SheetHeader>

              <div className="p-6 space-y-6 flex-1 text-xs">
                {/* Extracted Summary */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" />
                    Agent Extracted Synthesis
                  </h4>
                  <div className="p-3.5 rounded-lg border border-border bg-card leading-relaxed text-foreground/90 font-normal">
                    {selectedAsset.extracted_summary}
                  </div>
                </div>

                {/* Key Extracted Value Props */}
                {selectedAsset.extracted_points && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground uppercase tracking-wider text-xs">
                      Key Value Props & Evidence Chunks
                    </h4>
                    <div className="space-y-2">
                      {selectedAsset.extracted_points.map((point, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border border-border bg-muted/30 flex items-start gap-2 text-foreground font-normal"
                        >
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vector Chunks Overview */}
                <div className="p-4 rounded-lg border border-border bg-muted/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Vector Database Footprint</span>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {selectedAsset.chunk_count || 14} Chunks
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Chunked via semantic sentence boundaries with 1536-dimensional embeddings. When an opportunity is scored, cosine distance retrieval fetches the top 3 relevant chunks to draft personalized responses.
                  </p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Material Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UploadCloud className="size-5 text-primary" />
              Add Knowledge Asset
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload product specs, documentation, or founder notes to calibrate agent drafts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAsset} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Asset Kind</label>
              <Select value={kind} onValueChange={(val: any) => setKind(val)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product_url">Product Documentation URL</SelectItem>
                  <SelectItem value="document">Technical Document / Whitepaper</SelectItem>
                  <SelectItem value="sample_post">Sample Outreach Post</SelectItem>
                  <SelectItem value="resume">Founder Resume / Bio</SelectItem>
                  <SelectItem value="link">Reference Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Asset Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Next.js CLI Verification Architecture Spec"
                className="text-xs h-9"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                {kind === "product_url" || kind === "link" ? "URL" : "Content Excerpt"}
              </label>
              <Textarea
                rows={3}
                value={urlOrContent}
                onChange={(e) => setUrlOrContent(e.target.value)}
                placeholder={
                  kind === "product_url" || kind === "link"
                    ? "https://yourproduct.com/docs"
                    : "Paste sample post or key product capabilities..."
                }
                className="text-xs"
                required
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!title.trim()}>
                Ingest & Vectorize
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
