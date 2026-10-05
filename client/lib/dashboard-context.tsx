"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Mission,
  Opportunity,
  Thread,
  Source,
  Asset,
  VoiceProfile,
  EvidenceItem,
  VerdictData,
  AgentRun,
  UserMemory,
  Guardrails,
  ChannelConnection,
  NotificationPrefs,
  NotificationItem,
  Invoice,
  FeedbackSubmission,
  InterviewNote,
} from "./dashboard-data";
import {
  initialMissions,
  initialOpportunities,
  initialThreads,
  initialSources,
  initialAssets,
  initialVoiceProfiles,
  initialEvidenceList,
  initialVerdict,
  initialAgentRuns,
  initialMemories,
  initialGuardrails,
  initialChannels,
  initialNotificationPrefs,
  initialNotifications,
  initialInvoices,
} from "./dashboard-initial-state";

export type EdgeStateSimulation =
  | "normal"
  | "first_scan"
  | "empty_queue"
  | "mission_paused"
  | "quota_used_up"
  | "channel_disconnected";

interface DashboardContextType {
  // Missions
  missions: Mission[];
  activeMissionId: string;
  activeMission: Mission;
  setActiveMissionId: (id: string) => void;
  updateMission: (id: string, updates: Partial<Mission>) => void;
  toggleMissionStatus: (id: string) => void;
  createMission: (mission: Partial<Mission>) => void;

  // Opportunities / Approval Queue
  opportunities: Opportunity[];
  approveOpportunity: (id: string, editedBody?: string) => void;
  skipOpportunity: (id: string) => void;
  badMatchOpportunity: (id: string, reason: string) => void;
  snoozeOpportunity: (id: string) => void;
  updateDraft: (opportunityId: string, draftId: string, newBody: string) => void;

  // Conversations / Threads
  threads: Thread[];
  sendMessage: (threadId: string, body: string) => void;
  sendSuggestedFollowup: (threadId: string) => void;
  addInterviewNote: (threadId: string, note: Omit<InterviewNote, "id" | "created_at">) => void;

  // Sources
  sources: Source[];
  addSource: (source: Omit<Source, "id" | "matches_found" | "approved_count" | "approval_rate" | "last_scanned_at">) => void;
  toggleSource: (id: string) => void;
  acceptSuggestedSource: (id: string) => void;
  rejectSuggestedSource: (id: string) => void;

  // Library Assets
  assets: Asset[];
  addAsset: (asset: Omit<Asset, "id" | "created_at">) => void;
  deleteAsset: (id: string) => void;

  // Voice Profiles
  voiceProfiles: VoiceProfile[];
  updateVoiceProfile: (id: string, updates: Partial<VoiceProfile>) => void;
  setDefaultVoiceProfile: (id: string) => void;

  // Evidence & Verdict
  evidenceList: EvidenceItem[];
  verdict: VerdictData;

  // Agent Transparency
  agentRuns: AgentRun[];
  agentStatus: {
    state: "scanning" | "idle" | "paused";
    lastRun: string;
    nextRun: string;
    sourcesCount: number;
    oppsToday: number;
    draftsReady: number;
  };
  triggerManualScan: () => void;

  // Memory
  memories: UserMemory[];
  toggleMemory: (id: string) => void;
  deleteMemory: (id: string) => void;
  addMemory: (memory: Omit<UserMemory, "id" | "created_at">) => void;
  isAutoLearningEnabled: boolean;
  setIsAutoLearningEnabled: (val: boolean) => void;

  // Guardrails
  guardrails: Guardrails;
  updateGuardrails: (updates: Partial<Guardrails>) => void;

  // Channels
  channels: ChannelConnection[];
  updateChannelMode: (id: string, mode: ChannelConnection["mode"]) => void;
  reconnectChannel: (id: string) => void;
  disconnectChannel: (id: string) => void;
  whatsAppStatus: {
    verified: boolean;
    lastTestMessageSent?: string;
  };
  sendWhatsAppTestMessage: () => void;

  // Notifications
  notificationPrefs: NotificationPrefs;
  updateNotificationPrefs: (updates: Partial<NotificationPrefs>) => void;
  notifications: NotificationItem[];

  // Billing & Quota
  quota: {
    lifetimeUsed: number;
    lifetimeLimit: number;
    monthlyUsed: number;
    monthlyLimit: number;
    aiCostDollars: number;
    queriesUsed: number;
    queriesLimit: number;
  };
  invoices: Invoice[];

  // Feedback
  feedbacks: FeedbackSubmission[];
  submitFeedback: (feedback: Omit<FeedbackSubmission, "id" | "created_at">) => void;

  // Global UI states
  isCmdOpen: boolean;
  setIsCmdOpen: (val: boolean) => void;
  isFeedbackOpen: boolean;
  setIsFeedbackOpen: (val: boolean) => void;
  edgeState: EdgeStateSimulation;
  setEdgeState: (state: EdgeStateSimulation) => void;
  quickToast: string | null;
  setQuickToast: (msg: string | null) => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [activeMissionId, setActiveMissionId] = useState<string>("m-101");
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpportunities);
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>(initialVoiceProfiles);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(initialEvidenceList);
  const [verdict, setVerdict] = useState<VerdictData>(initialVerdict);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>(initialAgentRuns);
  const [memories, setMemories] = useState<UserMemory[]>(initialMemories);
  const [isAutoLearningEnabled, setIsAutoLearningEnabled] = useState(true);
  const [guardrails, setGuardrails] = useState<Guardrails>(initialGuardrails);
  const [channels, setChannels] = useState<ChannelConnection[]>(initialChannels);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(initialNotificationPrefs);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [invoices] = useState<Invoice[]>(initialInvoices);
  const [feedbacks, setFeedbacks] = useState<FeedbackSubmission[]>([]);

  // Agent status state
  const [agentStatus, setAgentStatus] = useState<{
    state: "scanning" | "idle" | "paused";
    lastRun: string;
    nextRun: string;
    sourcesCount: number;
    oppsToday: number;
    draftsReady: number;
  }>({
    state: "scanning",
    lastRun: "12m ago",
    nextRun: "48m",
    sourcesCount: 5,
    oppsToday: 18,
    draftsReady: 4,
  });

  // Quota
  const [quota, setQuota] = useState({
    lifetimeUsed: 14,
    lifetimeLimit: 20,
    monthlyUsed: 68,
    monthlyLimit: 100,
    aiCostDollars: 4.28,
    queriesUsed: 1420,
    queriesLimit: 5000,
  });

  // Global modals
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [edgeState, setEdgeState] = useState<EdgeStateSimulation>("normal");
  const [quickToast, setQuickToast] = useState<string | null>(null);

  // WhatsApp verification
  const [whatsAppStatus, setWhatsAppStatus] = useState({
    verified: true,
    lastTestMessageSent: "Yesterday, 3:12 PM",
  });

  // Active mission
  const activeMission =
    missions.find((m) => m.id === activeMissionId) || missions[0];

  // Auto clear toast
  useEffect(() => {
    if (quickToast) {
      const timer = setTimeout(() => setQuickToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [quickToast]);

  // Keyboard shortcut for Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Actions
  const approveOpportunity = (id: string, editedBody?: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === id) {
          const updatedDrafts = editedBody
            ? opp.drafts.map((d) => ({
                ...d,
                body: editedBody,
                status: "approved" as const,
              }))
            : opp.drafts.map((d) => ({
                ...d,
                status: "approved" as const,
              }));
          return {
            ...opp,
            status: "approved" as const,
            drafts: updatedDrafts,
          };
        }
        return opp;
      })
    );

    // Update quota & guardrails counters
    setQuota((q) => ({
      ...q,
      monthlyUsed: Math.min(q.monthlyLimit, q.monthlyUsed + 1),
      lifetimeUsed: Math.min(q.lifetimeLimit, q.lifetimeUsed + 1),
    }));

    setGuardrails((g) => ({
      ...g,
      actions_today: g.actions_today + 1,
    }));

    // Add activity log
    const targetOpp = opportunities.find((o) => o.id === id);
    const newRun: AgentRun = {
      id: `run-${Date.now()}`,
      kind: "execute_action",
      trigger_type: "user",
      status: "succeeded",
      description: `Approved outreach on ${targetOpp?.signal.platform.toUpperCase() || "Platform"}`,
      details: `Action dispatched to ${targetOpp?.signal.author_handle}. Draft approved by user with zero policy blocks.`,
      tokens_in: 320,
      tokens_out: 85,
      cost_micros: 940,
      latency_ms: 480,
      started_at: "Just now",
    };
    setAgentRuns((prev) => [newRun, ...prev]);

    setQuickToast("Action approved & queued for sending via connected channel!");
  };

  const skipOpportunity = (id: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => (opp.id === id ? { ...opp, status: "skipped" } : opp))
    );
    setQuickToast("Opportunity skipped.");
  };

  const badMatchOpportunity = (id: string, reason: string) => {
    setOpportunities((prev) =>
      prev.map((opp) =>
        opp.id === id ? { ...opp, status: "bad_match", bad_match_reason: reason } : opp
      )
    );

    // Agent learns from negative feedback
    if (isAutoLearningEnabled) {
      const newMemory: UserMemory = {
        id: `mem-${Date.now()}`,
        kind: "avoid",
        content: `Tuned down matching for queries related to: "${reason}". User rejected match as irrelevant.`,
        confidence: 0.85,
        evidence_count: 1,
        source: "feedback",
        is_active: true,
        created_at: new Date().toISOString().split("T")[0],
      };
      setMemories((m) => [newMemory, ...m]);
    }

    setQuickToast(`Marked bad match (${reason}). Agent memory updated.`);
  };

  const snoozeOpportunity = (id: string) => {
    setQuickToast("Opportunity snoozed until tomorrow.");
  };

  const updateDraft = (opportunityId: string, draftId: string, newBody: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === opportunityId) {
          return {
            ...opp,
            drafts: opp.drafts.map((d) =>
              d.id === draftId
                ? {
                    ...d,
                    body: newBody,
                    version: d.version + 1,
                    status: "edited",
                    quality_checks: {
                      ...d.quality_checks,
                      length: newBody.length,
                    },
                  }
                : d
            ),
          };
        }
        return opp;
      })
    );
    setQuickToast("Draft updated successfully.");
  };

  const updateMission = (id: string, updates: Partial<Mission>) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newVersion = m.spec_version + 1;
          const newHistory = [
            {
              version: newVersion,
              changed_by: "user" as const,
              change_note: "Updated mission parameters via web settings.",
              created_at: new Date().toISOString(),
            },
            ...m.versions,
          ];
          return {
            ...m,
            ...updates,
            spec_version: newVersion,
            updated_at: new Date().toISOString(),
            versions: newHistory,
          };
        }
        return m;
      })
    );
    setQuickToast("Mission spec updated and new version saved.");
  };

  const toggleMissionStatus = (id: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStatus = m.status === "active" ? "paused" : "active";
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
    setQuickToast("Mission status updated.");
  };

  const createMission = (newM: Partial<Mission>) => {
    const fullMission: Mission = {
      id: `m-${Date.now()}`,
      title: newM.title || "Untitled Mission",
      intent: newM.intent || "validate_idea",
      goal_text: newM.goal_text || "Gather validation interviews",
      target_metric: newM.target_metric || { current: 0, goal: 20, unit: "Interviews" },
      status: "active",
      audience: newM.audience || "Engineering leads & tech founders",
      channels: newM.channels || ["Reddit", "X", "Hacker News"],
      will_do: newM.will_do || ["Provide value upfront", "Engage organically"],
      wont_do: newM.wont_do || ["No spamming", "No mass DMs"],
      spec_version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      versions: [
        {
          version: 1,
          changed_by: "user",
          change_note: "Initial mission setup",
          created_at: new Date().toISOString(),
        },
      ],
    };
    setMissions((prev) => [fullMission, ...prev]);
    setActiveMissionId(fullMission.id);
    setQuickToast("New mission created and set as active!");
  };

  const sendMessage = (threadId: string, body: string) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      direction: "outbound" as const,
      body,
      sent_at: "Just now",
      platform: "web",
    };
    setThreads((prev) =>
      prev.map((th) =>
        th.id === threadId
          ? {
              ...th,
              messages: [...th.messages, newMsg],
              last_message_at: "Just now",
            }
          : th
      )
    );
    setQuickToast("Message sent via connected channel!");
  };

  const sendSuggestedFollowup = (threadId: string) => {
    const target = threads.find((t) => t.id === threadId);
    if (!target || !target.suggested_draft) return;
    sendMessage(threadId, target.suggested_draft.body);
  };

  const addInterviewNote = (threadId: string, noteData: Omit<InterviewNote, "id" | "created_at">) => {
    const newNote: InterviewNote = {
      id: `in-${Date.now()}`,
      thread_id: threadId,
      ...noteData,
      created_at: new Date().toISOString(),
    };

    setThreads((prev) =>
      prev.map((th) =>
        th.id === threadId
          ? {
              ...th,
              stage: "interviewed",
              interview_notes: [...(th.interview_notes || []), newNote],
            }
          : th
      )
    );

    // Also add to Evidence list automatically!
    const newEvidence: EvidenceItem = {
      id: `ev-${Date.now()}`,
      source: `Discovery Call (${noteData.contact_name})`,
      platform: "interview",
      author: noteData.contact_name,
      quote: noteData.raw_note.slice(0, 160) + "...",
      sentiment: noteData.willingness_to_pay === "yes" ? "willing_to_pay" : "strong_pain",
      weight: noteData.pain_score >= 4 ? 0.95 : 0.75,
      created_at: "Just now",
    };
    setEvidenceList((prev) => [newEvidence, ...prev]);

    setQuickToast("Interview note saved & added to Evidence & Verdict model!");
  };

  const addSource = (newSourceData: Omit<Source, "id" | "matches_found" | "approved_count" | "approval_rate" | "last_scanned_at">) => {
    const newSource: Source = {
      id: `src-${Date.now()}`,
      ...newSourceData,
      matches_found: 0,
      approved_count: 0,
      approval_rate: 0,
      last_scanned_at: "Just added",
    };
    setSources((prev) => [newSource, ...prev]);
    setQuickToast(`Added source: ${newSource.value}`);
  };

  const toggleSource = (id: string) => {
    setSources((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const next = s.status === "active" ? "paused" : "active";
          return { ...s, status: next };
        }
        return s;
      })
    );
    setQuickToast("Source monitoring status toggled.");
  };

  const acceptSuggestedSource = (id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "active" as const } : s))
    );
    setQuickToast("Agent suggested source accepted & added to active watchlist!");
  };

  const rejectSuggestedSource = (id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "rejected" as const } : s))
    );
    setQuickToast("Suggested source dismissed.");
  };

  const addAsset = (assetData: Omit<Asset, "id" | "created_at">) => {
    const newAsset: Asset = {
      id: `ast-${Date.now()}`,
      ...assetData,
      ingest_status: "ready",
      chunk_count: 14,
      created_at: new Date().toISOString(),
    };
    setAssets((prev) => [newAsset, ...prev]);
    setQuickToast("Asset uploaded and successfully processed by agent parser!");
  };

  const deleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setQuickToast("Asset removed from agent library.");
  };

  const updateVoiceProfile = (id: string, updates: Partial<VoiceProfile>) => {
    setVoiceProfiles((prev) =>
      prev.map((vp) => (vp.id === id ? { ...vp, ...updates } : vp))
    );
    setQuickToast("Voice profile rules updated.");
  };

  const setDefaultVoiceProfile = (id: string) => {
    setVoiceProfiles((prev) =>
      prev.map((vp) => ({
        ...vp,
        is_default: vp.id === id,
      }))
    );
    setQuickToast("Default voice profile updated.");
  };

  const toggleMemory = (id: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_active: !m.is_active } : m))
    );
  };

  const deleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    setQuickToast("Learned rule permanently removed from agent memory.");
  };

  const addMemory = (memoryData: Omit<UserMemory, "id" | "created_at">) => {
    const newMem: UserMemory = {
      id: `mem-${Date.now()}`,
      ...memoryData,
      created_at: new Date().toISOString().split("T")[0],
    };
    setMemories((prev) => [newMem, ...prev]);
    setQuickToast("Custom memory preference added.");
  };

  const updateGuardrails = (updates: Partial<Guardrails>) => {
    setGuardrails((prev) => ({ ...prev, ...updates }));
    setQuickToast("Guardrails policy updated and enforced.");
  };

  const updateChannelMode = (id: string, mode: ChannelConnection["mode"]) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, mode } : c))
    );
    setQuickToast("Channel outreach mode changed.");
  };

  const reconnectChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "connected" as const } : c))
    );
    setQuickToast("Channel successfully reauthorized.");
  };

  const disconnectChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "revoked" as const } : c))
    );
    setQuickToast("Channel disconnected.");
  };

  const sendWhatsAppTestMessage = () => {
    setWhatsAppStatus({
      verified: true,
      lastTestMessageSent: "Just now",
    });
    setQuickToast("Test approval message sent to your WhatsApp!");
  };

  const updateNotificationPrefs = (updates: Partial<NotificationPrefs>) => {
    setNotificationPrefs((prev) => ({ ...prev, ...updates }));
    setQuickToast("Notification schedule and preferences saved.");
  };

  const submitFeedback = (fb: Omit<FeedbackSubmission, "id" | "created_at">) => {
    const submission: FeedbackSubmission = {
      id: `fb-${Date.now()}`,
      ...fb,
      created_at: new Date().toISOString(),
    };
    setFeedbacks((prev) => [submission, ...prev]);
    setIsFeedbackOpen(false);
    setQuickToast("Thank you! Your feedback was logged to app.feedback.");
  };

  const triggerManualScan = () => {
    setAgentStatus((prev) => ({
      ...prev,
      state: "scanning",
      lastRun: "Just now",
    }));

    setTimeout(() => {
      setAgentStatus((prev) => ({
        ...prev,
        state: "idle",
        lastRun: "1m ago",
        oppsToday: prev.oppsToday + 2,
      }));
      setQuickToast("Scan complete: 2 new high-relevance discussions discovered.");
    }, 2500);

    setQuickToast("Manual multi-source scan triggered...");
  };

  return (
    <DashboardContext.Provider
      value={{
        missions,
        activeMissionId,
        activeMission,
        setActiveMissionId,
        updateMission,
        toggleMissionStatus,
        createMission,

        opportunities,
        approveOpportunity,
        skipOpportunity,
        badMatchOpportunity,
        snoozeOpportunity,
        updateDraft,

        threads,
        sendMessage,
        sendSuggestedFollowup,
        addInterviewNote,

        sources,
        addSource,
        toggleSource,
        acceptSuggestedSource,
        rejectSuggestedSource,

        assets,
        addAsset,
        deleteAsset,

        voiceProfiles,
        updateVoiceProfile,
        setDefaultVoiceProfile,

        evidenceList,
        verdict,

        agentRuns,
        agentStatus,
        triggerManualScan,

        memories,
        toggleMemory,
        deleteMemory,
        addMemory,
        isAutoLearningEnabled,
        setIsAutoLearningEnabled,

        guardrails,
        updateGuardrails,

        channels,
        updateChannelMode,
        reconnectChannel,
        disconnectChannel,
        whatsAppStatus,
        sendWhatsAppTestMessage,

        notificationPrefs,
        updateNotificationPrefs,
        notifications,

        quota,
        invoices,

        feedbacks,
        submitFeedback,

        isCmdOpen,
        setIsCmdOpen,
        isFeedbackOpen,
        setIsFeedbackOpen,
        edgeState,
        setEdgeState,
        quickToast,
        setQuickToast,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
