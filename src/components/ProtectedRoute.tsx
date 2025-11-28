import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, accessToken, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const isAuthenticated = !!user && !!accessToken;

  if (loading) {
    return (
      <div className="content text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Verificando autenticación…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

    if (allowedRoles) {
      const userRoles = user?.roles ?? [];

      const hasRole = userRoles.some(role => allowedRoles.includes(role));

      if (!hasRole) {
        return <Navigate to="/no-permission" replace />;
      }
    }
  return children;
};

export default ProtectedRoute;


