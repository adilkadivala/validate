"use client";

import React from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

export default function BillingPage() {
  const { quota, invoices } = useDashboard();

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Billing & Usage Counters
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time quota monitoring and subscription management from <code>app.subscriptions</code> and <code>app.usage_counters</code>.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => alert("Redirecting to Razorpay Customer Billing Portal...")}
          className="text-xs gap-1.5 cursor-pointer"
        >
          Customer Billing Portal <ExternalLink className="size-3" />
        </Button>
      </div>

      {/* Current Subscription Hero Banner */}
      <Card className="shadow-none border-primary/20 bg-primary/5 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <CreditCard className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-foreground">Pro Tier Subscription</h3>
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
              className="text-xs cursor-pointer"
            >
              Pause Subscription
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => alert("Are you sure you want to cancel your plan?")}
              className="text-xs text-muted-foreground hover:text-destructive cursor-pointer"
            >
              Cancel Plan
            </Button>
          </div>
        </div>
      </Card>

      {/* Usage Counters Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Monthly Actions */}
        <Card className="p-4 shadow-none space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Zap className="size-3.5 text-amber-500 fill-amber-500" />
              Monthly Outreach Actions
            </span>
            <span className="font-bold text-foreground font-mono">
              {quota.monthlyUsed} / {quota.monthlyLimit}
            </span>
          </div>
          <Progress value={monthlyPercent} className="h-2" />
          <div className="text-[11px] text-muted-foreground flex justify-between">
            <span>{quota.monthlyLimit - quota.monthlyUsed} actions remaining</span>
            <span>{monthlyPercent}% used</span>
          </div>
        </Card>

        {/* Free Lifetime Meter */}
        <Card className="p-4 shadow-none space-y-2">
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
            className="h-2"
          />
          <div className="text-[11px] text-muted-foreground flex justify-between">
            <span>{quota.lifetimeLimit - quota.lifetimeUsed} actions left</span>
            <span>Bonus grant</span>
          </div>
        </Card>

        {/* AI Query & Cost Ledger */}
        <Card className="p-4 shadow-none space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Cpu className="size-3.5 text-primary" />
              AI Inference Cost (ai.cost_ledger)
            </span>
            <span className="font-bold text-foreground font-mono">
              ${quota.aiCostDollars}
            </span>
          </div>
          <Progress value={queryPercent} className="h-2" />
          <div className="text-[11px] text-muted-foreground flex justify-between">
            <span>{quota.queriesUsed} / {quota.queriesLimit} scans performed</span>
            <span>{queryPercent}% quota</span>
          </div>
        </Card>
      </div>

      {/* Plan Comparison & Tiers */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Available Subscription Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Free Tier */}
          <Card className="p-5 shadow-none space-y-4">
            <div>
              <h4 className="font-bold text-base text-foreground">Free Starter</h4>
              <div className="text-2xl font-extrabold text-foreground mt-1">₹0</div>
              <p className="text-xs text-muted-foreground mt-0.5">20 lifetime approval actions</p>
            </div>
            <div className="space-y-2 text-xs text-foreground/90 border-t border-border pt-3">
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
            <Button variant="outline" size="sm" className="w-full text-xs" disabled>
              Completed
            </Button>
          </Card>

          {/* Pro Tier (Current) */}
          <Card className="p-5 shadow-none border-primary bg-primary/5 space-y-4 relative">
            <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px]">
              Current Plan
            </Badge>
            <div>
              <h4 className="font-bold text-base text-foreground">Pro Founder</h4>
              <div className="text-2xl font-extrabold text-foreground mt-1">
                ₹2,999 <span className="text-xs font-normal text-muted-foreground">/ month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">100 monthly outreach approvals</p>
            </div>
            <div className="space-y-2 text-xs text-foreground/90 border-t border-border pt-3">
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
            <Button size="sm" className="w-full text-xs" disabled>
              Active Plan
            </Button>
          </Card>

          {/* Scale Tier */}
          <Card className="p-5 shadow-none space-y-4">
            <div>
              <h4 className="font-bold text-base text-foreground">Scale & Team</h4>
              <div className="text-2xl font-extrabold text-foreground mt-1">
                ₹7,999 <span className="text-xs font-normal text-muted-foreground">/ month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Unlimited automated actions</p>
            </div>
            <div className="space-y-2 text-xs text-foreground/90 border-t border-border pt-3">
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
                <span>Dedicated Slack / Discord channel</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Upgrading to Scale Tier...")}
              className="w-full text-xs cursor-pointer"
            >
              Upgrade to Scale
            </Button>
          </Card>
        </div>
      </div>

      {/* Invoices Table */}
      <Card className="shadow-none overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-border bg-muted/20">
          <CardTitle className="text-sm font-semibold">Invoices & Billing Receipts</CardTitle>
          <CardDescription className="text-xs">
            Download GST/VAT compliant receipts for your tax filings.
          </CardDescription>
        </CardHeader>
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-36">Invoice ID</TableHead>
              <TableHead className="w-32">Date</TableHead>
              <TableHead>Plan Description</TableHead>
              <TableHead className="w-24">Amount</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-28 text-right">Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id} className="text-xs">
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
                    className="h-7 text-xs gap-1 cursor-pointer"
                  >
                    <Download className="size-3" /> PDF
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
