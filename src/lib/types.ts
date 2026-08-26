export type HealthStatus = "ok" | "warning" | "error";

export type AdminRole =
  | "super_admin"
  | "ops_admin"
  | "marketing_admin"
  | "analyst";

export interface AdminSessionUser {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
}

export interface AuthMeResponse {
  user: AdminSessionUser;
  permissions: string[];
  csrfToken: string;
}

export interface PaginatedResponse<T> {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
}

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

export interface UserSummary {
  userId: string;
  email: string;
  tier: string;
  credits: number;
  remainingToday: number;
  lastActiveAt: string;
  locale: string;
}

export interface UserDetail {
  userId: string;
  email: string;
  locale: string;
  tier: string;
  credits: number;
  remainingToday: number;
  zodiac: string;
  element: string;
  pushEnabled: boolean;
  promoCodes: string[];
  devices: { label: string; lastSeenAt: string }[];
  recentUsage: { feature: string; count: number }[];
  subscriptionExpiresAt?: string | null;
  lastActiveAt?: string | null;
}

export interface CreditRow {
  userId: string;
  balance: number;
  usedToday: number;
  remainingToday: number;
  updatedAt: string;
  locked: boolean;
}

export interface CreditPolicy {
  freeDailyBase: number;
  usersWithCredits: number;
  totalBalance: number;
  activeToday?: number;
  creditsExhaustedToday?: number;
  items?: CreditRow[];
}

export interface SubscriptionRow {
  userId: string;
  email: string;
  source: string;
  tier: string;
  expiresAt: string;
  active: boolean;
  daysLeft?: number;
}

export interface PromoCodeRow {
  id?: number;
  code: string;
  rewardLabel: string;
  usedCount: number;
  maxUses: number | null;
  expiresAt: string | null;
  active: boolean;
}

export interface ReferralRow {
  referred_user_id: string;
  inviter_user_id: string;
  referral_code: string;
  claimed_at: string;
  premium_awarded_at: string | null;
  inviter_burst_count: number;
  flagged: boolean;
}

export interface ReferralTree {
  user_id: string;
  referral_code: string | null;
  invited_by: {
    inviter_user_id: string;
    referral_code: string;
    claimed_at: string;
  } | null;
  referred_users: Array<{
    referred_user_id: string;
    claimed_at: string;
    premium_awarded_at: string | null;
  }>;
}

export interface DreamHistoryEntry {
  id: number;
  dream_text: string;
  result_text: string;
  lucky_numbers: string;
  locale: string;
  created_at: string;
}

export interface FcmInventory {
  stale_days: number;
  by_platform: Array<{ platform: string; total: number; stale: number }>;
  total_devices: number;
  total_stale: number;
}

export interface NotificationAudience {
  audience: string;
  device_count: number;
}

export interface NotificationCampaign {
  id: number;
  title: string;
  body: string;
  audience: string;
  sent_by: string;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

export interface AiConfig {
  currentModel: string;
  availableModels: string[];
  hasApiKey: boolean;
  maskedApiKey: string;
}

export interface AiUsageRow {
  id: string;
  feature: string;
  userId: string | null;
  actorType: "user" | "system" | "server_client" | "deleted_user" | "legacy_unattributed";
  actorLabel: string;
  success: boolean;
  responseMs: number;
  model: string;
  createdAt: string;
}

export interface AiUsageSummary {
  totalCalls: number;
  successRate: number;
  avgLatencyMs: number;
  topModel: string;
}

export interface AiUsageResponse extends PaginatedResponse<AiUsageRow> {
  summary: AiUsageSummary;
}

export interface CreditPackConfig {
  credits: number;
  featured: boolean;
}

export interface RemoteConfig {
  storeUrlAndroid: string;
  storeUrlIos: string;
  storeUrlWeb: string;
  features: Record<string, { access: string[] }>;
  creditPacks: Record<string, CreditPackConfig>;
}

export interface AuditRow {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  metadataJson?: string;
  createdAt: string;
}

export interface PurchaseVerificationAttemptRow {
  id: string;
  kind: "credit" | "subscription";
  userId: string;
  productId: string;
  platform: string;
  purchaseToken: string;
  verified: boolean;
  granted: boolean;
  failureReason: string;
  createdAt: string;
}

export interface AdminUserRow {
  id: number;
  username: string;
  role: AdminRole;
  createdAt: string;
}
