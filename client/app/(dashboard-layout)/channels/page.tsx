"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { ChannelConnection } from "@/lib/dashboard-data";
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
  Plug,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  ExternalLink,
  ShieldCheck,
  Plus,
} from "lucide-react";

export default function ChannelsPage() {
  const {
    channels,
    updateChannelMode,
    reconnectChannel,
    disconnectChannel,
    whatsAppStatus,
    sendWhatsAppTestMessage,
  } = useDashboard();

  const [testingWhatsApp, setTestingWhatsApp] = useState(false);

  const handleTestWhatsApp = () => {
    setTestingWhatsApp(true);
    sendWhatsAppTestMessage();
    setTimeout(() => {
      setTestingWhatsApp(false);
    }, 800);
  };

  const renderStatusBadge = (status: ChannelConnection["status"]) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Connected</Badge>;
      case "needs_reauth":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">Needs Reauth</Badge>;
      case "error":
      case "revoked":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Disconnected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Channels & Social Connections
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage authenticated platforms, API access modes, and mobile WhatsApp notifications from <code>app.channel_connections</code>.
          </p>
        </div>
      </div>

      {/* WhatsApp Mobile Integration Hero Card */}
      <Card className="shadow-none border-emerald-500/30 bg-emerald-500/5 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
              <MessageCircle className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-foreground">
                  WhatsApp Direct Approval Bot
                </h3>
                <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                  Verified Phone
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Connected to <strong className="text-foreground">+1 (415) 555-0199</strong> • Receives daily morning digests and inbound reply alerts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              disabled={testingWhatsApp}
              onClick={handleTestWhatsApp}
              className="text-xs gap-1.5 cursor-pointer border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
            >
              <Send className="size-3" />
              {testingWhatsApp ? "Dispatching..." : "Send Test Message"}
            </Button>
          </div>
        </div>

        {whatsAppStatus.lastTestMessageSent && (
          <div className="mt-3 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
            <span>Last interactive approval ping delivered: {whatsAppStatus.lastTestMessageSent}</span>
            <span>Webhook Status: 200 OK (Twilio/Meta WhatsApp Cloud API)</span>
          </div>
        )}
      </Card>

      {/* Connection List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((ch) => (
          <Card key={ch.id} className="shadow-none flex flex-col justify-between p-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{ch.name}</span>
                </div>
                {renderStatusBadge(ch.status)}
              </div>

              <div className="text-xs space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Handle / Identifier:</span>
                  <span className="font-mono font-medium text-foreground">{ch.handle}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Last Handshake:</span>
                  <span className="font-mono">{ch.last_checked}</span>
                </div>
              </div>

              {ch.notes && (
                <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40 font-normal">
                  {ch.notes}
                </p>
              )}

              {/* Mode Selector */}
              <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-foreground">Outreach Mode:</span>
                <Select
                  value={ch.mode}
                  onValueChange={(val: any) => updateChannelMode(ch.id, val)}
                >
                  <SelectTrigger className="h-8 text-xs w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="official_api">Official API</SelectItem>
                    <SelectItem value="draft_only">Draft Only</SelectItem>
                    <SelectItem value="read_only">Read Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              {ch.status === "needs_reauth" ? (
                <Button
                  size="sm"
                  onClick={() => reconnectChannel(ch.id)}
                  className="h-7 text-xs gap-1 cursor-pointer bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <RefreshCw className="size-3" /> Reconnect OAuth
                </Button>
              ) : ch.status === "connected" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => disconnectChannel(ch.id)}
                  className="h-7 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => reconnectChannel(ch.id)}
                  className="h-7 text-xs cursor-pointer"
                >
                  Reconnect
                </Button>
              )}

              <span className="text-[11px] text-muted-foreground font-mono">
                Credentials in Secret Vault
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
