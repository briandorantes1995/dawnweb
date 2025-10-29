import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Redirect } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

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
    return <Redirect to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
