"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { NotificationItem, NotificationPrefs } from "@/lib/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  MessageCircle,
  Mail,
  Clock,
  CheckCircle2,
  Calendar,
  Save,
  Send,
} from "lucide-react";

export default function NotificationsPage() {
  const {
    notificationPrefs,
    updateNotificationPrefs,
    notifications,
  } = useDashboard();

  const [whatsappDigest, setWhatsappDigest] = useState(notificationPrefs.whatsapp_digest_enabled);
  const [digestTime, setDigestTime] = useState(notificationPrefs.digest_time);
  const [digestMaxItems, setDigestMaxItems] = useState(notificationPrefs.digest_max_items);
  const [weeklySummary, setWeeklySummary] = useState(notificationPrefs.weekly_summary_enabled);
  const [weeklyDow, setWeeklyDow] = useState(notificationPrefs.weekly_summary_dow);
  const [emailFallback, setEmailFallback] = useState(notificationPrefs.email_fallback_enabled);
  const [fallbackEmail, setFallbackEmail] = useState(notificationPrefs.fallback_email);

  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationPrefs({
      whatsapp_digest_enabled: whatsappDigest,
      digest_time: digestTime,
      digest_max_items: digestMaxItems,
      weekly_summary_enabled: weeklySummary,
      weekly_summary_dow: weeklyDow,
      email_fallback_enabled: emailFallback,
      fallback_email: fallbackEmail,
    });
  };

  const renderChannelBadge = (ch: NotificationItem["channel"]) => {
    switch (ch) {
      case "whatsapp":
        return <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">WhatsApp</Badge>;
      case "email":
        return <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20">Email</Badge>;
      case "in_app":
        return <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/20">In-App</Badge>;
      default:
        return <Badge variant="outline">{ch}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Notification Preferences & Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure digest timing, WhatsApp batch deliveries, and inspect dispatched alerts from <code>app.notifications</code>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preferences Form */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="shadow-none">
            <CardHeader className="p-4 pb-3 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bell className="size-4 text-primary" />
                Delivery Schedules
              </CardTitle>
              <CardDescription className="text-xs">
                Stored in <code>app.notification_prefs</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-5 text-xs">
              <form onSubmit={handleSavePrefs} className="space-y-5">
                {/* 1. WhatsApp Daily Digest */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <MessageCircle className="size-3.5 text-emerald-500" />
                        WhatsApp Morning Digest
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Batch of top candidate drafts sent directly to your phone.
                      </p>
                    </div>
                    <Switch
                      checked={whatsappDigest}
                      onCheckedChange={setWhatsappDigest}
                    />
                  </div>

                  {whatsappDigest && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-muted-foreground block text-[11px] mb-1">
                          Delivery Time (Local)
                        </label>
                        <Input
                          type="time"
                          value={digestTime}
                          onChange={(e) => setDigestTime(e.target.value)}
                          className="text-xs h-8 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-muted-foreground block text-[11px] mb-1">
                          Max Items ({digestMaxItems})
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={digestMaxItems}
                          onChange={(e) => setDigestMaxItems(Number(e.target.value))}
                          className="text-xs h-8 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Weekly Summary */}
                <div className="space-y-2 pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-primary" />
                        Weekly Summary Report
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Aggregated yield, conversion rates, and validation milestone progress.
                      </p>
                    </div>
                    <Switch
                      checked={weeklySummary}
                      onCheckedChange={setWeeklySummary}
                    />
                  </div>

                  {weeklySummary && (
                    <div>
                      <label className="text-muted-foreground block text-[11px] mb-1">Day of Week</label>
                      <Select
                        value={String(weeklyDow)}
                        onValueChange={(val) => setWeeklyDow(val ? Number(val) : 1)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Every Monday at 9:00 AM</SelectItem>
                          <SelectItem value="5">Every Friday at 5:00 PM</SelectItem>
                          <SelectItem value="0">Every Sunday at 6:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* 3. Email Fallback */}
                <div className="space-y-2 pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Mail className="size-3.5 text-primary" />
                        Email Notification Fallback
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Triggered if WhatsApp message delivery is delayed or unread after 3 hours.
                      </p>
                    </div>
                    <Switch
                      checked={emailFallback}
                      onCheckedChange={setEmailFallback}
                    />
                  </div>

                  {emailFallback && (
                    <div>
                      <label className="text-muted-foreground block text-[11px] mb-1">Fallback Email</label>
                      <Input
                        type="email"
                        value={fallbackEmail}
                        onChange={(e) => setFallbackEmail(e.target.value)}
                        className="text-xs h-8 font-mono"
                      />
                    </div>
                  )}
                </div>

                <Button type="submit" size="sm" className="w-full text-xs gap-1.5 cursor-pointer">
                  <Save className="size-3.5" /> Save Preferences
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sent Notifications Log */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="shadow-none overflow-hidden">
            <CardHeader className="p-4 pb-3 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-semibold">Message & Digest History</CardTitle>
              <CardDescription className="text-xs">
                Real-time delivery log of dispatched notifications.
              </CardDescription>
            </CardHeader>
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-24">Channel</TableHead>
                  <TableHead>Notification Details</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-28 text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notif) => (
                  <TableRow key={notif.id} className="text-xs">
                    <TableCell>{renderChannelBadge(notif.channel)}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground truncate max-w-sm">
                        {notif.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {notif.body}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono capitalize bg-muted"
                      >
                        {notif.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground font-mono text-[11px]">
                      {notif.sent_at}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
