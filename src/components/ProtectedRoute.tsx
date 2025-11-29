import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, accessToken, loading } = useSelector((state: RootState) => state.auth);

  if (loading) return <div>Cargando…</div>;
  if (!user || !accessToken) return <Navigate to="/login" replace />;

  console.log("DEBUG ROUTE →", {
    rolesInUser: user.roles,
    allowedRoles,
  });

  if (allowedRoles) {
    const userRole = user.roles?.[0]?.name?.toLowerCase?.() ?? null;

    const hasRole = allowedRoles
        .map((r) => r.toLowerCase())
        .includes(userRole);

    if (!hasRole) return <Navigate to="/no-permission" replace />;
  }

  return children;
};

export default ProtectedRoute;




