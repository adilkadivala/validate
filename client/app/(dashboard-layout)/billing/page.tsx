"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  CreditCard,
  Zap,
  CheckCircle2,
  Download,
  AlertCircle,
  ExternalLink,
  Coins,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Flame,
  Check,
} from "lucide-react";

export default function BillingPage() {
  const { quota, invoices } = useDashboard();
  const [activeTab, setActiveTab] = useState<string>("overview");

  const monthlyPercent = Math.min(
    100,
    Math.round((quota.monthlyUsed / quota.monthlyLimit) * 100)
  );

  const queryPercent = Math.min(
    100,
    Math.round((quota.queriesUsed / quota.queriesLimit) * 100)
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-mono">
              Subscription & Fuel
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              app.subscriptions & app.usage_counters
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Billing & Usage Counters
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time quota monitoring and subscription management.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => alert("Redirecting to Razorpay Customer Billing Portal...")}
          className="text-xs gap-1.5 cursor-pointer h-8 bg-primary text-primary-foreground"
        >
          Customer Billing Portal <ExternalLink className="size-3" />
        </Button>
      </div>

      {/* 2. Top Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Current Tier</span>
              <CreditCard className="size-4 text-primary" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground tracking-tight">
                Pro Tier
              </span>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-mono">
                Active
              </Badge>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-primary/10 text-[11px] text-muted-foreground">
            ₹2,999 / mo • Renews Nov 01
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Monthly Fuel</span>
              <Zap className="size-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {quota.monthlyLimit - quota.monthlyUsed}
              </span>
              <span className="text-xs text-muted-foreground font-mono">actions left</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40">
            <Progress value={monthlyPercent} className="h-1.5" />
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Lifetime Grant</span>
              <Coins className="size-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                {quota.lifetimeLimit - quota.lifetimeUsed}
              </span>
              <span className="text-xs text-muted-foreground font-mono">bonus left</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40">
            <Progress value={Math.round((quota.lifetimeUsed / quota.lifetimeLimit) * 100)} className="h-1.5" />
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="rounded-xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>AI Compute Cost</span>
              <Cpu className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                ${quota.aiCostDollars}
              </span>
              <span className="text-xs text-muted-foreground font-mono">incurred</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            {quota.queriesUsed} inference queries
          </div>
        </Card>
      </div>

      {/* 3. Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val || "overview")} className="w-full space-y-4">
        <div className="border-b border-border/60 pb-3">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex-wrap">
            <TabsTrigger
              value="overview"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="size-3.5" />
              Usage Fuel & Meters
            </TabsTrigger>
            <TabsTrigger
              value="plans"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CreditCard className="size-3.5" />
              Subscription Plans
            </TabsTrigger>
            <TabsTrigger
              value="invoices"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="size-3.5" />
              Invoices & Receipts ({invoices.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: USAGE METERS */}
        <TabsContent value="overview" className="space-y-6">
          {/* Subscription Banner */}
          <Card className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <CreditCard className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-foreground">Pro Founder Subscription</h3>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-mono">
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ₹2,999 / month • Next automated renewal on <strong>Nov 01, 2026</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => alert("Subscription paused until next cycle.")}
                  className="text-xs cursor-pointer h-8 rounded-lg"
                >
                  Pause Subscription
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => alert("Are you sure you want to cancel your plan?")}
                  className="text-xs text-muted-foreground hover:text-destructive cursor-pointer h-8"
                >
                  Cancel Plan
                </Button>
              </div>
            </div>
          </Card>

          {/* Usage Meters Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 rounded-xl border border-border/70 bg-card shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Zap className="size-3.5 text-amber-500 fill-amber-500" />
                  Monthly Outreach Actions
                </span>
                <span className="font-bold text-foreground font-mono">
                  {quota.monthlyUsed} / {quota.monthlyLimit}
                </span>
              </div>
              <Progress value={monthlyPercent} className="h-2 rounded-full" />
              <div className="text-[11px] text-muted-foreground flex justify-between font-mono">
                <span>{quota.monthlyLimit - quota.monthlyUsed} actions remaining</span>
                <span>{monthlyPercent}% used</span>
              </div>
            </Card>

            <Card className="p-5 rounded-xl border border-border/70 bg-card shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Coins className="size-3.5 text-primary" />
                  Free Lifetime Grant
                </span>
                <span className="font-bold text-foreground font-mono">
                  {quota.lifetimeUsed} / {quota.lifetimeLimit}
                </span>
              </div>
              <Progress
                value={Math.round((quota.lifetimeUsed / quota.lifetimeLimit) * 100)}
                className="h-2 rounded-full"
              />
              <div className="text-[11px] text-muted-foreground flex justify-between font-mono">
                <span>{quota.lifetimeLimit - quota.lifetimeUsed} actions left</span>
                <span>Bonus grant</span>
              </div>
            </Card>

            <Card className="p-5 rounded-xl border border-border/70 bg-card shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Cpu className="size-3.5 text-primary" />
                  AI Inference Ledger
                </span>
                <span className="font-bold text-foreground font-mono">
                  ${quota.aiCostDollars}
                </span>
              </div>
              <Progress value={queryPercent} className="h-2 rounded-full" />
              <div className="text-[11px] text-muted-foreground flex justify-between font-mono">
                <span>{quota.queriesUsed} / {quota.queriesLimit} scans</span>
                <span>{queryPercent}% quota</span>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: PLANS COMPARISON */}
        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free Tier */}
            <Card className="p-6 rounded-xl border border-border/70 bg-card shadow-xs space-y-4">
              <div>
                <h4 className="font-bold text-base text-foreground">Free Starter</h4>
                <div className="text-2xl font-extrabold text-foreground mt-1 font-mono">₹0</div>
                <p className="text-xs text-muted-foreground mt-0.5">20 lifetime approval actions</p>
              </div>
              <div className="space-y-2 text-xs text-foreground/90 border-t border-border/60 pt-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>1 active mission</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>Reddit & HN crawler</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>Standard draft generation</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs rounded-lg" disabled>
                Completed
              </Button>
            </Card>

            {/* Pro Tier (Current) */}
            <Card className="p-6 rounded-xl border-2 border-primary bg-primary/5 shadow-xs space-y-4 relative">
              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px]">
                Current Plan
              </Badge>
              <div>
                <h4 className="font-bold text-base text-foreground">Pro Founder</h4>
                <div className="text-2xl font-extrabold text-foreground mt-1 font-mono">
                  ₹2,999 <span className="text-xs font-normal text-muted-foreground font-sans">/ month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">100 monthly outreach approvals</p>
              </div>
              <div className="space-y-2 text-xs text-foreground/90 border-t border-border/60 pt-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>Up to 5 active missions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>Official X & Reddit APIs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>WhatsApp daily approval digest</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>Evidence & Verdict synthesis</span>
                </div>
              </div>
              <Button size="sm" className="w-full text-xs rounded-lg bg-primary text-primary-foreground" disabled>
                Active Plan
              </Button>
            </Card>

            {/* Scale Tier */}
            <Card className="p-6 rounded-xl border border-border/70 bg-card shadow-xs space-y-4">
              <div>
                <h4 className="font-bold text-base text-foreground">Scale & Team</h4>
                <div className="text-2xl font-extrabold text-foreground mt-1 font-mono">
                  ₹7,999 <span className="text-xs font-normal text-muted-foreground font-sans">/ month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Unlimited automated actions</p>
              </div>
              <div className="space-y-2 text-xs text-foreground/90 border-t border-border/60 pt-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>Unlimited missions & seats</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>LinkedIn auto-drafting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>Custom fine-tuned voice model</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>Dedicated Slack channel</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert("Upgrading to Scale Tier...")}
                className="w-full text-xs cursor-pointer rounded-lg"
              >
                Upgrade to Scale
              </Button>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: INVOICES TABLE */}
        <TabsContent value="invoices" className="space-y-4">
          <Card className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/10">
              <CardTitle className="text-sm font-semibold">Invoices & Billing Receipts</CardTitle>
              <CardDescription className="text-xs">
                Download GST/VAT compliant receipts for your tax filings.
              </CardDescription>
            </CardHeader>
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-36 text-xs">Invoice ID</TableHead>
                  <TableHead className="w-32 text-xs">Date</TableHead>
                  <TableHead className="text-xs">Plan Description</TableHead>
                  <TableHead className="w-24 text-xs">Amount</TableHead>
                  <TableHead className="w-24 text-xs">Status</TableHead>
                  <TableHead className="w-28 text-right text-xs">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id} className="text-xs hover:bg-muted/20 transition">
                    <TableCell className="font-mono font-medium text-foreground">
                      {inv.id}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{inv.date}</TableCell>
                    <TableCell className="text-foreground">{inv.plan}</TableCell>
                    <TableCell className="font-mono font-semibold text-foreground">
                      {inv.amount}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] uppercase font-mono">
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => alert(`Downloading PDF invoice for ${inv.id}...`)}
                        className="h-7 text-xs gap-1 cursor-pointer text-primary"
                      >
                        <Download className="size-3" /> PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
