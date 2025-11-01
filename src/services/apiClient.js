const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Helper para normalizar URLs
const normalizeUrl = (baseUrl, path) => {
  const base = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${base}/${cleanPath}`;
};

// Obtener token desde localStorage
export const getAppToken = () => {
  return localStorage.getItem('auth.app_token');
};

// Función principal para hacer fetch a la API
export const apiFetch = async (path, options = {}) => {
  const token = getAppToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Añadir token si existe
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(normalizeUrl(API_URL, path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Request failed: ${response.status}`;
    try {
      const errorText = await response.text();
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

  return response.json();
};

