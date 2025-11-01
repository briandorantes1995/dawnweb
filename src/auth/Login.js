import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { useHistory } from 'react-router-dom';

const Login = () => {
  const { loginWithPassword, loginWithOAuth, logout, register, isAuthenticated, user, isLoading } = useAuth();
  const history = useHistory();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await loginWithPassword(email, password);
      history.push('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e) => {
    e?.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await register(email, password, firstName, lastName);
      history.push('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleOAuthLogin = async (provider) => {
    setError('');
    try {
      await loginWithOAuth(provider);
    } catch (err) {
      setError(err.message || 'Error en autenticación OAuth');
    }
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
              <div className="card-body">
                <h2 className="title text-center">Aurevia</h2>
                
                {isAuthenticated && user && (
                  <div className="alert alert-success mt-3">
                    <strong>Sesión activa:</strong><br />
                    {user.email}
                    <br />
                    <small>¿Quieres usar otra cuenta? Usa los botones de abajo.</small>
                  </div>
                )}

                {isAuthenticated ? (
                  <div className="mt-4 text-center">
                    <button 
                      className="btn btn-primary btn-lg mr-3"
                      onClick={handleContinue}
                    >
                      Continuar al Dashboard
                    </button>
                    <br />
                    <button 
                      className="btn btn-danger mt-2"
                      onClick={handleLogout}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <div className="mt-4">
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}
                    
                    <form onSubmit={isRegistering ? handleSignup : handleLogin}>
                      {isRegistering && (
                        <>
                          <div className="form-group">
                            <label>Nombre</label>
                            <input
                              type="text"
                              className="form-control"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Apellido</label>
                            <input
                              type="text"
                              className="form-control"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              required
                            />
                          </div>
                        </>
                      )}
                      <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input
                          type="email"
                          className="form-control"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Contraseña</label>
                        <input
                          type="password"
                          className="form-control"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <button 
                        type="submit"
                        className="btn btn-primary btn-block btn-lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Procesando...' : isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
                      </button>
                    </form>
                    
                    <div className="mt-3 text-center">
                      <button 
                        className="btn btn-link"
                        onClick={() => {
                          setIsRegistering(!isRegistering);
                          setError('');
                        }}
                      >
                        {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                      </button>
                    </div>
                    
                    <hr className="my-4" />
                    
                    <div className="text-center">
                      <p className="text-muted">O continúa con:</p>
                      <button 
                        className="btn btn-outline-primary btn-block"
                        onClick={() => handleOAuthLogin('google')}
                        disabled={isSubmitting}
                      >
                        <i className="fab fa-google mr-2"></i>
                        Google
                      </button>
                      <button 
                        className="btn btn-outline-primary btn-block mt-2"
                        onClick={() => handleOAuthLogin('microsoft')}
                        disabled={isSubmitting}
                      >
                        <i className="fab fa-microsoft mr-2"></i>
                        Microsoft
                      </button>
                    </div>
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
