export type HealthStatus = "ok" | "warning" | "error";

export type AdminRole =
  | "super_admin"
  | "ops_admin"
  | "marketing_admin"
  | "analyst";

export interface DashboardOverview {
  aiCallsToday: number;
  aiCallsMonth: number;
  activeSubscriptions: number;
  totalUsers: number;
  creditsExhaustedToday: number;
  dbStatus: HealthStatus;
  aiStatus: HealthStatus;
  pushStatus: HealthStatus;
}

export interface TrendPoint {
  label: string;
  total: number;
  dream: number;
  horoscope: number;
  companion: number;
}

export interface UserSummary {
  userId: string;
  email: string;
  tier: "free" | "trial" | "premium";
  credits: number;
  remainingToday: number;
  lastActiveAt: string;
  locale: "th" | "zh";
}

export interface UserDetail {
  userId: string;
  email: string;
  locale: "th" | "zh";
  tier: "free" | "trial" | "premium";
  credits: number;
  remainingToday: number;
  zodiac: string;
  element: string;
  pushEnabled: boolean;
  promoCodes: string[];
  devices: { label: string; lastSeenAt: string }[];
  recentUsage: { feature: string; count: number }[];
}

export interface CreditPolicy {
  freeDailyBase: number;
  usersWithCredits: number;
  totalBalance: number;
}

export interface SubscriptionRow {
  userId: string;
  email: string;
  source: "manual" | "promo" | "trial" | "android" | "ios";
  tier: "free" | "trial" | "premium";
  expiresAt: string;
  active: boolean;
}

export interface PromoCodeRow {
  code: string;
  rewardLabel: string;
  usedCount: number;
  maxUses: number | null;
  expiresAt: string | null;
  active: boolean;
}

export interface AuditRow {
  id: string;
  actor: string;
  role: AdminRole;
  action: string;
  target: string;
  createdAt: string;
}

