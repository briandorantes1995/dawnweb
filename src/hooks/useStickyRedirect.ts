import { useCallback, useEffect } from 'react';

/**
 * Hook para navegar a sticky.fehura.net con la sesión compartida
 * 
 * Uso en fehura.net:
 * 
 * import { useStickyRedirect } from './hooks/useStickyRedirect';
 * 
 * function MyComponent() {
 *   const navigateToSticky = useStickyRedirect();
 *   
 *   return (
 *     <button onClick={() => navigateToSticky('/boards')}>
 *       Ir a Sticky
 *     </button>
 *   );
 * }
 */

const REDUX_PERSIST_KEY = 'persist:auth';
const STICKY_BASE_URL = 'https://sticky.fehura.net';

interface AuthData {
  token: string;
  user: any;
}

/**
 * Obtiene el token y usuario de Redux persist
 */
function getAuthFromReduxPersist(): AuthData | null {
  try {
    const reduxPersist = localStorage.getItem(REDUX_PERSIST_KEY);
    if (!reduxPersist) return null;
    
    const parsed = JSON.parse(reduxPersist);
    
    // Parsear accessToken si viene escapado (formato de Redux persist)
    let token = parsed.accessToken;
    if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
      token = JSON.parse(token);
    }
    
    if (!token) return null;
    
    // Parsear user si viene como string
    let user = parsed.user;
    if (typeof user === 'string') {
      user = JSON.parse(user);
    }
    
    if (!user) return null;
    
    return { token, user };
  } catch (error) {
    console.error('Error leyendo Redux persist:', error);
    return null;
  }
}

/**
 * Hook para navegar a sticky.fehura.net con sesión compartida
 * @param openInNewWindow Si es true, abre en nueva ventana/pestaña. Si es false, redirige en la misma ventana
 * @returns Función para navegar a sticky.fehura.net con el token y usuario en la URL
 */
export function useStickyRedirect(openInNewWindow: boolean = true) {
  const navigateToSticky = useCallback((path: string = '/') => {
    const auth = getAuthFromReduxPersist();
    
    // Construir URL
    const url = new URL(path, STICKY_BASE_URL);
    
    // Si hay sesión, agregar token y usuario como parámetros
    if (auth && auth.token && auth.user) {
      url.searchParams.set('token', encodeURIComponent(auth.token));
      url.searchParams.set('user', encodeURIComponent(JSON.stringify(auth.user)));
    }
    
    // Abrir en nueva ventana o redirigir según el parámetro
    if (openInNewWindow) {
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url.toString();
    }
  }, [openInNewWindow]);
  
  return navigateToSticky;
}

/**
 * Hook para interceptar automáticamente enlaces a sticky.fehura.net
 * Úsalo en tu App.tsx o layout principal
 * 
 * @example
 * function App() {
 *   useStickyLinkInterceptor();
 *   return <YourApp />;
 * }
 */
export function useStickyLinkInterceptor() {
  const navigateToSticky = useStickyRedirect();
  
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href) return;
      
      // Verificar si el enlace es a sticky.fehura.net
      if (href.includes('sticky.fehura.net') || href.includes('sticky-fehura')) {
        e.preventDefault();
        
        // Extraer el path de la URL
        try {
          const url = new URL(href, window.location.origin);
          navigateToSticky(url.pathname + url.search);
        } catch {
          // Si falla, usar el href completo
          navigateToSticky(href);
        }
      }
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [navigateToSticky]);
}
