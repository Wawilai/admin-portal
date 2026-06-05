import { createBrowserRouter } from "react-router-dom";

import { AdminShell } from "../components/layout/AdminShell";
import { RequireAuth } from "../features/auth/RequireAuth";
import { AiOpsPage } from "../pages/AiOpsPage";
import { AuditLogPage } from "../pages/AuditLogPage";
import { CreditsPage } from "../pages/CreditsPage";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { NotificationsPage } from "../pages/NotificationsPage";
import { PromoPage } from "../pages/PromoPage";
import { RemoteConfigPage } from "../pages/RemoteConfigPage";
import { SubscriptionsPage } from "../pages/SubscriptionsPage";
import { UserDetailPage } from "../pages/UserDetailPage";
import { UsersPage } from "../pages/UsersPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <AdminShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "users", element: <UsersPage /> },
          { path: "users/:userId", element: <UserDetailPage /> },
          { path: "credits", element: <CreditsPage /> },
          { path: "subscriptions", element: <SubscriptionsPage /> },
          { path: "promo", element: <PromoPage /> },
          { path: "ai-ops", element: <AiOpsPage /> },
          { path: "notifications", element: <NotificationsPage /> },
          { path: "remote-config", element: <RemoteConfigPage /> },
          { path: "audit-log", element: <AuditLogPage /> },
        ],
      },
    ],
  },
]);
