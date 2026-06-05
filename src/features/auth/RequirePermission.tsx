import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useSession } from "./SessionContext";

interface RequirePermissionProps {
  permission: string;
}

export function RequirePermission({ permission }: RequirePermissionProps) {
  const location = useLocation();
  const { defaultRoute, hasPermission, isBootstrapping } = useSession();

  if (isBootstrapping) {
    return null;
  }

  if (!hasPermission(permission)) {
    return <Navigate replace state={{ from: location }} to={defaultRoute} />;
  }

  return <Outlet />;
}
