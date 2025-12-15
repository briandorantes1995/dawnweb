import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { getUserCompanyType, canAccessRoute } from "../utils/routePermissions";
import { DashboardRoute } from "../adminRoutes";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  // Opcional: ruta específica a validar por tipo de empresa
  route?: DashboardRoute;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  route 
}) => {
  const { user, accessToken, loading } = useSelector((state: RootState) => state.auth);

  if (loading) return <div>Cargando…</div>;
  if (!user || !accessToken) return <Navigate to="/login" replace />;

  // Validación de roles
  if (allowedRoles) {
    const userRole = user.roles?.[0]?.name?.toLowerCase?.() ?? null;

    const hasRole = allowedRoles
        .map((r) => r.toLowerCase())
        .includes(userRole);

    if (!hasRole) return <Navigate to="/no-permission" replace />;
  }

  // Validación de tipo de empresa (si se proporciona la ruta)
  if (route) {
    const userCompanyType = getUserCompanyType(user);
    if (!canAccessRoute(route, userCompanyType)) {
      return <Navigate to="/no-permission" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;




