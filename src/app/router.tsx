import { createBrowserRouter } from "react-router-dom";

import { AdminShell } from "../components/layout/AdminShell";
import { RequireAuth } from "../features/auth/RequireAuth";
import { RequirePermission } from "../features/auth/RequirePermission";
import { AiOpsPage } from "../pages/AiOpsPage";
import { AdminUsersPage } from "../pages/AdminUsersPage";
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
          {
            element: <RequirePermission permission="dashboard.read" />,
            children: [{ index: true, element: <DashboardPage /> }],
          },
          {
            element: <RequirePermission permission="users.read" />,
            children: [
              { path: "users", element: <UsersPage /> },
              { path: "users/:userId", element: <UserDetailPage /> },
            ],
          },
          {
            element: <RequirePermission permission="credits.read" />,
            children: [{ path: "credits", element: <CreditsPage /> }],
          },
          {
            element: <RequirePermission permission="subscriptions.read" />,
            children: [{ path: "subscriptions", element: <SubscriptionsPage /> }],
          },
          {
            element: <RequirePermission permission="promo.read" />,
            children: [{ path: "promo", element: <PromoPage /> }],
          },
          {
            element: <RequirePermission permission="dashboard.read" />,
            children: [{ path: "ai-ops", element: <AiOpsPage /> }],
          },
          {
            element: <RequirePermission permission="notifications.read" />,
            children: [{ path: "notifications", element: <NotificationsPage /> }],
          },
          {
            element: <RequirePermission permission="config.read" />,
            children: [{ path: "remote-config", element: <RemoteConfigPage /> }],
          },
          {
            element: <RequirePermission permission="audit.read" />,
            children: [{ path: "audit-log", element: <AuditLogPage /> }],
          },
          {
            element: <RequirePermission permission="admin_users.read" />,
            children: [{ path: "admin-users", element: <AdminUsersPage /> }],
          },
        ],
      },
    ],
  },
]);
