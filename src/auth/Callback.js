import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const normalizeUrl = (baseUrl, path) => {
  const base = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${base}/${cleanPath}`;
};

const Callback = () => {
  const history = useHistory();
  const location = useLocation();
  const { exchangeOAuthToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener parámetros de la URL (code, access_token, etc.)
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const provider = params.get('provider') || 'google'; // Por defecto google

        if (!accessToken && !code) {
          throw new Error('No se recibió token de autenticación');
        }

        // Intercambiar el token con el backend usando el método del AuthProvider
        await exchangeOAuthToken(accessToken, code, refreshToken, provider);

        // Redirigir al dashboard
        history.push('/admin/dashboard');
      } catch (err) {
        console.error('[Callback] Error:', err);
        history.push('/login?error=' + encodeURIComponent(err.message || 'Error en la autenticación'));
      }
    };

    handleCallback();
  }, [location, history, exchangeOAuthToken]);

  return (
    <div className="content">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Procesando autenticación...</span>
                </div>
                <p className="mt-3">Procesando autenticación...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Callback;
