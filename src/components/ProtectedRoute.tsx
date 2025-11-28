import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store"; 

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, accessToken } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!user && !! accessToken;
  const isLoading = user === undefined && accessToken === undefined;

  if (isLoading) {
    return (
      <div className="content">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Cargando...</span>
                  </div>
                  <p className="mt-3">Verificando autenticación...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
