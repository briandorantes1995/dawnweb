import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useHistory } from 'react-router-dom';

const Login = () => {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();
  const history = useHistory();

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'login'
      }
    });
  };

  const handleSignup = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup'
      }
    });
  };

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  const handleContinue = () => {
    history.push('/admin/dashboard');
  };

  // Si está autenticado, redirigir automáticamente al dashboard
  React.useEffect(() => {
    if (isAuthenticated && !isLoading) {
      history.push('/admin/dashboard');
    }
  }, [isAuthenticated, isLoading, history]);

  if (isLoading) {
    return (
      <div className="content">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body text-center">
                  <div className="spinner-border" role="status">
                    <span className="sr-only">Cargando...</span>
                  </div>
                  <p className="mt-3">Cargando...</p>
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
                <h2 className="title">Bienvenido</h2>
                
                {isAuthenticated && user && (
                  <div className="alert alert-success mt-3">
                    <strong>Sesión activa:</strong><br />
                    {user.email}
                    <br />
                    <small>¿Quieres usar otra cuenta? Usa los botones de abajo.</small>
                  </div>
                )}

                {isAuthenticated ? (
                  <div className="mt-4">
                    <button 
                      className="btn btn-primary btn-lg mr-3"
                      onClick={handleContinue}
                    >
                      Continuar al Dashboard
                    </button>
                    <br />
                    <button 
                      className="btn btn-info mt-2 mr-2"
                      onClick={handleLogin}
                    >
                      Cambiar de cuenta
                    </button>
                    <button 
                      className="btn btn-danger mt-2"
                      onClick={handleLogout}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <button 
                      className="btn btn-primary btn-lg mr-3"
                      onClick={handleLogin}
                    >
                      Iniciar Sesión
                    </button>
                    <button 
                      className="btn btn-success btn-lg"
                      onClick={handleSignup}
                    >
                      Crear Cuenta
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
