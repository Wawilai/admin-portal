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

export interface AiConfig {
  currentModel: string;
  availableModels: string[];
  hasApiKey: boolean;
  maskedApiKey: string;
}

export interface AiUsageRow {
  id: string;
  feature: string;
  userId: string;
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

export interface RemoteConfig {
  storeUrlAndroid: string;
  storeUrlIos: string;
  storeUrlWeb: string;
  features: Record<string, { access: string[] }>;
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

export interface AdminUserRow {
  id: number;
  username: string;
  role: AdminRole;
  createdAt: string;
}
