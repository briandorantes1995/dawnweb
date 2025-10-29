# Configuración de Auth0

## Pasos para configurar Auth0 en tu aplicación

### 1. Crear archivo .env
Crea un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```env
REACT_APP_AUTH0_DOMAIN=tu-dominio.auth0.com
REACT_APP_AUTH0_CLIENT_ID=tu-client-id
REACT_APP_AUTH0_AUDIENCE=tu-api-audience
REACT_APP_AUTH0_REDIRECT_URI=http://localhost:3000/callback
```

### 2. Configurar Auth0 Dashboard

1. Ve a [Auth0 Dashboard](https://manage.auth0.com/)
2. Crea una nueva aplicación o usa una existente
3. Configura los siguientes valores:

#### Application Settings:
- **Application Type**: Single Page Application
- **Allowed Callback URLs**: `http://localhost:3000/callback`
- **Allowed Logout URLs**: `http://localhost:3000`
- **Allowed Web Origins**: `http://localhost:3000`

#### Advanced Settings > Grant Types:
- ✅ Authorization Code
- ✅ Refresh Token

### 3. Obtener las credenciales

1. **Domain**: Se encuentra en la pestaña "Settings" de tu aplicación
2. **Client ID**: Se encuentra en la pestaña "Settings" de tu aplicación
3. **Audience**: Si tienes una API, usa su identifier. Si no, puedes dejarlo vacío o usar `https://tu-dominio.auth0.com/userinfo`

### 4. Ejecutar la aplicación

```bash
npm start
```

La aplicación se abrirá en `http://localhost:3000` y redirigirá automáticamente a la página de login de Auth0.

## Funcionalidades implementadas

- ✅ Login con Auth0
- ✅ Registro de nuevos usuarios
- ✅ Logout
- ✅ Protección de rutas
- ✅ Información del usuario en la navbar
- ✅ Redirección automática después del login

## Estructura de archivos creados

- `src/contexts/Auth0Provider.js` - Proveedor de contexto de Auth0
- `src/auth/Login.js` - Componente de login
- `src/auth/Callback.js` - Manejo del callback de Auth0
- `src/components/ProtectedRoute.js` - Componente para proteger rutas
- `src/components/Navbars/AdminNavbar.js` - Navbar actualizada con logout
