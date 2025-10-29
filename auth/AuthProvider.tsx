import React, {createContext,useCallback,useContext,useEffect,useMemo,useState,} from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import Auth0 from "react-native-auth0";
import { apiFetch } from "../api/apiclient";
import type { AuthUser, AuthContextValue } from "./types";


const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
const AUTH0_DOMAIN = process.env.EXPO_PUBLIC_AUTH0_DOMAIN ?? "";
const AUTH0_CLIENT_ID = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID ?? "";
const AUTH0_AUDIENCE = process.env.EXPO_PUBLIC_AUTH0_AUDIENCE;
const APP_SCHEME = process.env.EXPO_PUBLIC_APP_SCHEME ?? "dawnapp";
const ANDROID_PACKAGE =
  process.env.EXPO_PUBLIC_ANDROID_PACKAGE ?? "com.brand.dawnapp";

const auth0 = new Auth0({
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_CLIENT_ID,
});

//Claves de almacenamiento
const SECURE_KEY_ACCESS_TOKEN = "auth.access_token";
const SECURE_KEY_APP_TOKEN = "auth.app_token";
const SECURE_KEY_USER = "auth.user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [appToken, setAppToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const redirectUri = useMemo(() => {
    return Platform.OS === "android"
      ? `${ANDROID_PACKAGE}.auth0://${AUTH0_DOMAIN}/android/${ANDROID_PACKAGE}/callback`
      : `${APP_SCHEME}://callback`;
  }, []);

  // Cargar sesion desde almacenamiento
  useEffect(() => {
    (async () => {
      try {
        const [storedAccess, storedApp, storedUser] = await Promise.all([
          SecureStore.getItemAsync(SECURE_KEY_ACCESS_TOKEN),
          SecureStore.getItemAsync(SECURE_KEY_APP_TOKEN),
          SecureStore.getItemAsync(SECURE_KEY_USER),
        ]);

        if (storedAccess) setAccessToken(storedAccess);
        if (storedApp) setAppToken(storedApp);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (err) {
        console.warn("[Auth] Error loading session:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Intercambiar token de Auth0 → token interno
  const exchangeToken = useCallback(async (auth0Token: string) => {
    const res = await fetch(`${API_URL}/auth/exchange`, {
      method: "POST",
      headers: { Authorization: `Bearer ${auth0Token}` },
    });

    if (!res.ok) throw new Error(`Exchange failed: ${res.status}`);

    const { token: newAppToken, user: apiUser } = await res.json();
    console.log("token interno",newAppToken);

    setAppToken(newAppToken);
    setUser(apiUser);

    await SecureStore.setItemAsync(SECURE_KEY_APP_TOKEN, newAppToken);
    await SecureStore.setItemAsync(SECURE_KEY_USER, JSON.stringify(apiUser));
  }, []);

  //Login con Auth0
  const login = useCallback(
    async (forcePrompt = false) => {
      try {
        const result = await auth0.webAuth.authorize({
          scope: "openid profile email",
          audience: AUTH0_AUDIENCE,
          redirectUrl: redirectUri,
          ...(forcePrompt ? { prompt: "login" } : {}),
        });

        const token = result.accessToken;
        if (!token) throw new Error("Auth0 no devolvió accessToken");

        setAccessToken(token);
        await SecureStore.setItemAsync(SECURE_KEY_ACCESS_TOKEN, token);

        // Intercambio con backend
        await exchangeToken(token);
      } catch (err) {
        console.error("[Auth] Login failed:", err);
      }
    },
    [redirectUri, exchangeToken]
  );

  //Logout
  const logout = useCallback(async () => {
    try {
      await auth0.webAuth.clearSession({ federated: true });
    } catch (err) {
      console.warn("[Auth] clearSession warning:", err);
    } finally {
      await Promise.all([
        SecureStore.deleteItemAsync(SECURE_KEY_ACCESS_TOKEN),
        SecureStore.deleteItemAsync(SECURE_KEY_APP_TOKEN),
        SecureStore.deleteItemAsync(SECURE_KEY_USER),
      ]);
      setAccessToken(null);
      setAppToken(null);
      setUser(null);
    }
  }, []);

  //Refrescar usuario desde el backend
  const refreshUser = useCallback(async () => {
    try {
      const updatedUser = await apiFetch("/users/me");
      setUser(updatedUser);
      await SecureStore.setItemAsync(SECURE_KEY_USER, JSON.stringify(updatedUser));
    } catch (err) {
      console.warn("[Auth] Failed to refresh user:", err);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(appToken && user),
      isLoading,
      login,
      logout,
      refreshUser,
      accessToken,
      appToken,
    }),
    [user, appToken, accessToken, isLoading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

//Hook de acceso
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider />");
  return ctx;
}



