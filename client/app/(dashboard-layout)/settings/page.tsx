"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Settings,
  User,
  Shield,
  Laptop,
  Smartphone,
  Download,
  Trash2,
  Save,
  Clock,
  Globe,
  AlertTriangle,
  History,
} from "lucide-react";

export default function SettingsPage() {
  const { opportunities, missions, threads, setQuickToast } = useDashboard();

  // Profile states
  const [name, setName] = useState("Alex Chen");
  const [email, setEmail] = useState("alex@verifydev.io");
  const [timezone, setTimezone] = useState("UTC");
  const [locale, setLocale] = useState("en-US");
  const [country, setCountry] = useState("United States");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const sessions = [
    {
      id: "sess-01",
      device: "MacBook Pro (Chrome on macOS Sonoma)",
      ip: "157.240.241.35",
      location: "San Francisco, US",
      isCurrent: true,
      lastActive: "Active right now",
      icon: Laptop,
    },
    {
      id: "sess-02",
      device: "iPhone 15 Pro (Safari Mobile)",
      ip: "157.240.241.12",
      location: "San Francisco, US",
      isCurrent: false,
      lastActive: "2 hours ago",
      icon: Smartphone,
    },
  ];

  const auditLogs = [
    { id: 1, actor: "user", event: "mission.updated", entity: "m-101", time: "18m ago" },
    { id: 2, actor: "agent", event: "opportunity.scored", entity: "opp-01", time: "22m ago" },
    { id: 3, actor: "user", event: "approval.created", entity: "appr-84", time: "1 hour ago" },
    { id: 4, actor: "system", event: "channel.health_check", entity: "ch-01", time: "2 hours ago" },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setQuickToast("Profile and localization preferences saved.");
  };

  const handleExportData = () => {
    const exportBundle = {
      user: { name, email, timezone, locale, country },
      missions,
      opportunities,
      threads,
      exportedAt: new Date().toISOString(),
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportBundle, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `verify_account_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setQuickToast("Account data archive exported.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Account & System Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your personal profile, active sessions, GDPR exports, and audit trails from <code>app.users</code> and <code>app.sessions</code>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile & Localization */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-none">
            <CardHeader className="p-4 pb-3 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="size-4 text-primary" />
                Profile & Localization
              </CardTitle>
              <CardDescription className="text-xs">
                Stored in <code>app.users</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted-foreground block text-[11px] mb-1">Full Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-xs h-8"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground block text-[11px] mb-1">Account Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-xs h-8 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-muted-foreground block text-[11px] mb-1">Timezone</label>
                    <Select value={timezone} onValueChange={(val) => setTimezone(val ?? "UTC")}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                        <SelectItem value="America/New_York">US Eastern (ET)</SelectItem>
                        <SelectItem value="America/Los_Angeles">US Pacific (PT)</SelectItem>
                        <SelectItem value="Asia/Kolkata">India (IST GMT+5:30)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-muted-foreground block text-[11px] mb-1">Locale</label>
                    <Select value={locale} onValueChange={(val) => setLocale(val ?? "en-US")}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-muted-foreground block text-[11px] mb-1">Country</label>
                    <Input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button type="submit" size="sm" className="text-xs gap-1.5 cursor-pointer">
                    <Save className="size-3.5" /> Save Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Active Sessions List */}
          <Card className="shadow-none">
            <CardHeader className="p-4 pb-3 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                Active Security Sessions
              </CardTitle>
              <CardDescription className="text-xs">
                Tokens managed in <code>app.sessions</code> with cryptographically hashed secrets.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3 rounded-lg border border-border bg-card flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                      <sess.icon className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{sess.device}</span>
                        {sess.isCurrent && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                            Current Session
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        {sess.ip} • {sess.location} • {sess.lastActive}
                      </div>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setQuickToast("Session revoked successfully.")}
                      className="h-7 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: GDPR Data Export & Danger Zone & Audit Log */}
        <div className="lg:col-span-5 space-y-6">
          {/* Data Export */}
          <Card className="shadow-none">
            <CardHeader className="p-4 pb-2 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Download className="size-4 text-primary" />
                GDPR Data Portability & Export
              </CardTitle>
              <CardDescription className="text-xs">
                Download all your account data, missions, interview notes, and activity history.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Generates a machine-readable JSON archive compliant with GDPR Article 20.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportData}
                className="w-full text-xs gap-1.5 cursor-pointer"
              >
                <Download className="size-3.5" /> Request Full Account Export
              </Button>
            </CardContent>
          </Card>

          {/* Account Audit Log */}
          <Card className="shadow-none overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="size-4 text-muted-foreground" />
                Account Audit Trail
              </CardTitle>
              <CardDescription className="text-xs">
                Recent user & system events from <code>app.audit_log</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 text-xs">
              <div className="divide-y divide-border">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-foreground font-mono">{log.event}</span>
                      <span className="text-[11px] text-muted-foreground block">
                        Actor: {log.actor} • Entity: {log.entity}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">{log.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="shadow-none border-destructive/30 bg-destructive/5">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="size-4" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-3 text-xs">
              <p className="text-muted-foreground">
                Permanently purge your account, missions, and training weights. This action is irreversible.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full text-xs border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
              >
                <Trash2 className="size-3.5 mr-1" /> Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Confirm Account Deletion
            </DialogTitle>
            <DialogDescription className="text-xs">
              Type <strong>DELETE</strong> below to permanently delete your account, cancel all active subscriptions, and purge vector chunks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="text-xs font-mono"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={deleteConfirmText !== "DELETE"}
              onClick={() => {
                alert("Account deletion triggered.");
                setIsDeleteModalOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Permanently Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
