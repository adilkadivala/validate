export interface ChildItem {
  id?: number | string;
  name: string;
  icon?: LucideIcon;
  items?: ChildItem[];
  item?: unknown;
  url?: string;
  color?: string;
  disabled?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeType?: string;
  badgeContent?: string;
  isActive?: boolean;
  external?: boolean;
  isPro?: boolean;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: LucideIcon;
  id?: number | string;
  to?: string;
  item?: MenuItem[];
  items?: ChildItem[];
  url?: string;
  disabled?: boolean;
  subtitle?: string;
  badgeType?: string;
  badge?: boolean;
  badgeContent?: string;
  isActive?: boolean;
  isPro?: boolean;
}

import {
  Inbox,
  Target,
  MessageSquare,
  Compass,
  Radio,
  FolderOpen,
  Volume2,
  TrendingUp,
  Scale,
  Activity,
  Brain,
  ShieldCheck,
  Plug,
  Bell,
  CreditCard,
  Settings,
  HelpCircle,
  LucideIcon,
} from "lucide-react";

const SidebarContent: MenuItem[] = [
  {
    heading: "Work",
    items: [
      {
        id: "nav-today",
        name: "Today",
        icon: Inbox,
        url: "/",
        badge: true,
        badgeType: "filled",
        badgeContent: "4",
      },
      {
        id: "nav-opps",
        name: "Opportunities",
        icon: Target,
        url: "/opportunities",
      },
      {
        id: "nav-convs",
        name: "Conversations",
        icon: MessageSquare,
        url: "/conversations",
      },
    ],
  },
  {
    heading: "Setup",
    items: [
      {
        id: "nav-mission",
        name: "Mission",
        icon: Compass,
        url: "/mission",
      },
      {
        id: "nav-sources",
        name: "Sources",
        icon: Radio,
        url: "/sources",
      },
      {
        id: "nav-library",
        name: "Library",
        icon: FolderOpen,
        url: "/library",
      },
      {
        id: "nav-voice",
        name: "Voice",
        icon: Volume2,
        url: "/voice",
      },
    ],
  },
  {
    heading: "Insights",
    items: [
      {
        id: "nav-progress",
        name: "Progress",
        icon: TrendingUp,
        url: "/progress",
      },
      {
        id: "nav-verdict",
        name: "Evidence & Verdict",
        icon: Scale,
        url: "/verdict",
      },
    ],
  },
  {
    heading: "Agent",
    items: [
      {
        id: "nav-activity",
        name: "Activity",
        icon: Activity,
        url: "/activity",
      },
      {
        id: "nav-memory",
        name: "Memory",
        icon: Brain,
        url: "/memory",
      },
      {
        id: "nav-guardrails",
        name: "Guardrails",
        icon: ShieldCheck,
        url: "/guardrails",
      },
    ],
  },
  {
    heading: "Account",
    items: [
      {
        id: "nav-channels",
        name: "Channels",
        icon: Plug,
        url: "/channels",
      },
      {
        id: "nav-notifications",
        name: "Notifications",
        icon: Bell,
        url: "/notifications",
      },
      {
        id: "nav-billing",
        name: "Billing & Usage",
        icon: CreditCard,
        url: "/billing",
      },
      {
        id: "nav-settings",
        name: "Settings",
        icon: Settings,
        url: "/settings",
      },
      {
        id: "nav-feedback",
        name: "Help & Feedback",
        icon: HelpCircle,
        url: "/feedback",
      },
    ],
  },
];

export default SidebarContent;
