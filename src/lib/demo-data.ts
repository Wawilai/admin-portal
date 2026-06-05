import type {
  AuditRow,
  CreditPolicy,
  DashboardOverview,
  PromoCodeRow,
  SubscriptionRow,
  TrendPoint,
  UserDetail,
  UserSummary,
} from "./types";

export const dashboardOverview: DashboardOverview = {
  aiCallsToday: 1834,
  aiCallsMonth: 46821,
  activeSubscriptions: 1237,
  totalUsers: 28194,
  creditsExhaustedToday: 347,
  dbStatus: "ok",
  aiStatus: "warning",
  pushStatus: "ok",
};

export const usageTrend: TrendPoint[] = [
  { label: "Mon", total: 5100, dream: 920, horoscope: 1810, companion: 1120 },
  { label: "Tue", total: 5480, dream: 1010, horoscope: 1960, companion: 1204 },
  { label: "Wed", total: 5905, dream: 1140, horoscope: 2085, companion: 1288 },
  { label: "Thu", total: 5722, dream: 1074, horoscope: 2011, companion: 1194 },
  { label: "Fri", total: 6170, dream: 1223, horoscope: 2214, companion: 1320 },
  { label: "Sat", total: 6033, dream: 1160, horoscope: 2170, companion: 1305 },
  { label: "Sun", total: 6450, dream: 1290, horoscope: 2340, companion: 1412 },
];

export const users: UserSummary[] = [
  {
    userId: "uid_001",
    email: "nicha@example.com",
    tier: "premium",
    credits: 22,
    remainingToday: 9999,
    lastActiveAt: "2026-06-05T09:42:00Z",
    locale: "th",
  },
  {
    userId: "uid_002",
    email: "wei@example.com",
    tier: "trial",
    credits: 3,
    remainingToday: 9999,
    lastActiveAt: "2026-06-05T08:19:00Z",
    locale: "zh",
  },
  {
    userId: "uid_003",
    email: "mali@example.com",
    tier: "free",
    credits: 1,
    remainingToday: 0,
    lastActiveAt: "2026-06-05T07:10:00Z",
    locale: "th",
  },
];

export const userDetail: UserDetail = {
  userId: "uid_001",
  email: "nicha@example.com",
  locale: "th",
  tier: "premium",
  credits: 22,
  remainingToday: 9999,
  zodiac: "dragon",
  element: "wood",
  pushEnabled: true,
  promoCodes: ["RERK001"],
  devices: [
    { label: "Android Pixel 8", lastSeenAt: "2026-06-05T09:42:00Z" },
    { label: "Web session", lastSeenAt: "2026-06-03T11:24:00Z" },
  ],
  recentUsage: [
    { feature: "companion_chat", count: 18 },
    { feature: "dream", count: 9 },
    { feature: "daily_horoscope", count: 4 },
  ],
};

export const creditPolicy: CreditPolicy = {
  freeDailyBase: 3,
  usersWithCredits: 7542,
  totalBalance: 41821,
};

export const subscriptions: SubscriptionRow[] = [
  {
    userId: "uid_001",
    email: "nicha@example.com",
    source: "android",
    tier: "premium",
    expiresAt: "2026-07-04T10:00:00Z",
    active: true,
  },
  {
    userId: "uid_002",
    email: "wei@example.com",
    source: "promo",
    tier: "trial",
    expiresAt: "2026-06-14T10:00:00Z",
    active: true,
  },
  {
    userId: "uid_003",
    email: "mali@example.com",
    source: "trial",
    tier: "free",
    expiresAt: "2026-05-28T10:00:00Z",
    active: false,
  },
];

export const promoCodes: PromoCodeRow[] = [
  {
    code: "RERK001",
    rewardLabel: "Premium free 10 days",
    usedCount: 87,
    maxUses: 250,
    expiresAt: "2026-06-30",
    active: true,
  },
  {
    code: "JUNEVIP",
    rewardLabel: "Premium free 30 days",
    usedCount: 12,
    maxUses: 50,
    expiresAt: "2026-06-20",
    active: true,
  },
];

export const auditRows: AuditRow[] = [
  {
    id: "log_001",
    actor: "ops_admin_1",
    role: "ops_admin",
    action: "grant_credit",
    target: "user:uid_003",
    createdAt: "2026-06-05T08:30:00Z",
  },
  {
    id: "log_002",
    actor: "marketing_admin_1",
    role: "marketing_admin",
    action: "deactivate_promo",
    target: "promo:JUNEVIP",
    createdAt: "2026-06-05T07:45:00Z",
  },
  {
    id: "log_003",
    actor: "super_admin_1",
    role: "super_admin",
    action: "update_ai_model",
    target: "config:ai_model",
    createdAt: "2026-06-05T07:10:00Z",
  },
];
