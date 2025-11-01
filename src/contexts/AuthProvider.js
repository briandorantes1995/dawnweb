import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch, getAppToken } from '../services/apiClient';

const AuthContext = createContext(undefined);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Helper para normalizar URLs
const normalizeUrl = (baseUrl, path) => {
  const base = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${base}/${cleanPath}`;
};

export function AuthProvider({ children }) {
  const [appToken, setAppToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar sesión desde localStorage al iniciar
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = localStorage.getItem('auth.app_token');
        const storedUser = localStorage.getItem('auth.user');

        if (storedToken) {
          setAppToken(storedToken);
        }
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Si hay token, intentar validarlo obteniendo el usuario actual
        if (storedToken) {
          try {
            const currentUser = await apiFetch('/auth0/me');
            setUser(currentUser);
            localStorage.setItem('auth.user', JSON.stringify(currentUser));
          } catch (error) {
            console.warn('[Auth] Token inválido, limpiando sesión:', error);
            // Token inválido, limpiar sesión
            localStorage.removeItem('auth.app_token');
            localStorage.removeItem('auth.user');
            setAppToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('[Auth] Error loading session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  // Registro con email/password
  const register = useCallback(async (email, password, firstName, lastName) => {
    try {
      const res = await fetch(normalizeUrl(API_URL, '/auth0/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      if (!res.ok) {
        let errorMessage = `Register failed: ${res.status}`;
        try {
          const errorText = await res.text();
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch {
          // Si no se puede leer, usar el mensaje por defecto
        }
        throw new Error(errorMessage);
      }

      const { token, user: apiUser } = await res.json();
      setAppToken(token);
      setUser(apiUser);
      localStorage.setItem('auth.app_token', token);
      localStorage.setItem('auth.user', JSON.stringify(apiUser));
    } catch (err) {
      console.error('[Auth] Register failed:', err);
      throw err;
    }
  }, []);

  // Login con email/password
  const loginWithPassword = useCallback(async (email, password) => {
    try {
      const res = await fetch(normalizeUrl(API_URL, '/auth0/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let errorMessage = `Login failed: ${res.status}`;
        try {
          const errorText = await res.text();
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch {
          // Si no se puede leer, usar el mensaje por defecto
        }
        throw new Error(errorMessage);
      }

      const { token, user: apiUser } = await res.json();
      setAppToken(token);
      setUser(apiUser);
      localStorage.setItem('auth.app_token', token);
      localStorage.setItem('auth.user', JSON.stringify(apiUser));
    } catch (err) {
      console.error('[Auth] Login failed:', err);
      throw err;
    }
  }, []);

  // Login con OAuth (Google, Microsoft, etc.)
  const loginWithOAuth = useCallback(async (provider) => {
    try {
      // Obtener URL de OAuth del backend
      const res = await fetch(normalizeUrl(API_URL, '/auth0/oauth-login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          provider, 
          redirectTo: window.location.origin + '/auth/callback' 
        }),
      });

      if (!res.ok) {
        let errorMessage = `OAuth login failed: ${res.status}`;
        try {
          const errorText = await res.text();
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch {
          // Si no se puede leer, usar el mensaje por defecto
        }
        throw new Error(errorMessage);
      }

      const { url } = await res.json();
      
      // Redirigir al usuario a la URL de OAuth
      window.location.href = url;
    } catch (err) {
      console.error('[Auth] OAuth login failed:', err);
      throw err;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      // Opcional: notificar al backend (si tiene endpoint de logout)
      // await apiFetch('/auth0/logout', { method: 'POST' });
    } catch (err) {
      console.warn('[Auth] Logout warning:', err);
    } finally {
      localStorage.removeItem('auth.app_token');
      localStorage.removeItem('auth.user');
      setAppToken(null);
      setUser(null);
    }
  }, []);

  // Refrescar usuario desde backend
  const refreshUser = useCallback(async () => {
    try {
      const updatedUser = await apiFetch('/auth0/me');
      setUser(updatedUser);
      localStorage.setItem('auth.user', JSON.stringify(updatedUser));
    } catch (err) {
      console.warn('[Auth] Failed to refresh user:', err);
      throw err;
    }
  }, []);

  // Intercambiar token de OAuth con token interno
  const exchangeOAuthToken = useCallback(async (accessToken, code, refreshToken, provider) => {
    try {
      const res = await fetch(normalizeUrl(API_URL, '/auth0/exchange-token'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, code, refreshToken, provider }),
      });

      if (!res.ok) {
        let errorMessage = `Token exchange failed: ${res.status}`;
        try {
          const errorText = await res.text();
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch {
          // Si no se puede leer, usar el mensaje por defecto
        }
        throw new Error(errorMessage);
      }

      const { token, user: apiUser } = await res.json();
      setAppToken(token);
      setUser(apiUser);
      localStorage.setItem('auth.app_token', token);
      localStorage.setItem('auth.user', JSON.stringify(apiUser));
    } catch (err) {
      console.error('[Auth] Token exchange failed:', err);
      throw err;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(appToken && user),
      isLoading,
      loginWithPassword,
      loginWithOAuth,
      register,
      logout,
      refreshUser,
      exchangeOAuthToken,
      appToken,
      setAppToken: (token) => {
        setAppToken(token);
        if (token) {
          localStorage.setItem('auth.app_token', token);
        } else {
          localStorage.removeItem('auth.app_token');
        }
      },
    }),
    [user, appToken, isLoading, loginWithPassword, loginWithOAuth, register, logout, refreshUser, exchangeOAuthToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook de acceso
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider />');
  return ctx;
}
