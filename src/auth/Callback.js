import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useHistory } from 'react-router-dom';

const Callback = () => {
  const { isLoading, error } = useAuth0();
  const history = useHistory();

  useEffect(() => {
    if (!isLoading && !error) {
      // Redirigir al dashboard después de la autenticación exitosa
      history.push('/admin/dashboard');
    }
  }, [isLoading, error, history]);

  if (error) {
    return (
      <div className="content">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body text-center">
                  <h2 className="title text-danger">Error de Autenticación</h2>
                  <p className="text-danger">{error.message}</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => history.push('/login')}
                  >
                    Volver al Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <p className="mt-3">Completando autenticación...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Callback;
