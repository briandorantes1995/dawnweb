// src/store/auththunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { setSession, clearSession } from "./slices/authSlice";
import { apiFetch } from "../api/apiClient";

/**
 * Login normal con email/password
 * payload: { email, password }
 */
export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue, dispatch }) => {
    try {
      const data = await apiFetch<{
        token: { accessToken: string; refreshToken: string };
        user: any;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const user = data.user;

      if (user.pending_approval) {
        return rejectWithValue("Cuenta pendiente de aprobación.");
      }
      if (user.active === false) {
        return rejectWithValue("Cuenta desactivada. Contacta a tu empresa.");
      }

        dispatch(
            setSession({
                user: data.user,
                accessToken: data.token.accessToken,
                refreshToken: data.token.refreshToken,
            })
        );
        return user;
    } catch (err: any) {
      return rejectWithValue(err.message || "Error al iniciar sesión");
    }
  }
);

/**
 * Inicia el flujo QR
 */
export const loginWithQrThunk = createAsyncThunk("auth/loginWithQr",
    async (
        { tokens, user }: { tokens: { accessToken: string; refreshToken: string }; user: any },
        { rejectWithValue, dispatch }
    ) => {
        try {
            if (user.pending_approval) {
                return rejectWithValue("Cuenta pendiente de aprobación.");
            }
            if (user.active === false) {
                return rejectWithValue("Cuenta desactivada. Contacta a tu empresa.");
            }

            dispatch(
                setSession({
                    user,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                })
            );

            return user;
        } catch (err: any) {
            return rejectWithValue(err.message || "Error en QR login");
        }
    }
);


/**
 * Inicia el flujo OAuth: backend devuelve url de autorización
 * payload: { provider: "google" | "microsoft" }
 */
export const oauthLoginThunk = createAsyncThunk(
  "auth/oauthLogin",
  async ({ provider }: { provider: "google" | "azure" }, { rejectWithValue }) => {
    try {
      const redirectTo = `${window.location.origin}/oauth/callback`;
      const res = await apiFetch<{ url: string }>("/auth/oauth-login", {
        method: "POST",
        body: JSON.stringify({ provider, redirectTo }),
      });

      window.location.href = res.url;
      return res.url;
    } catch (err: any) {
      return rejectWithValue(err.message || "Error iniciando OAuth");
    }
  }
);

/**
 * Intercambia code/state por tokens y user
 * payload: { code, state }
 */
export const exchangeTokenThunk = createAsyncThunk(
  "auth/exchangeToken",
  async ({ code, state }: { code: string; state: string }, { rejectWithValue, dispatch }) => {
    try {
      const data = await apiFetch<{
        token: { accessToken: string; refreshToken: string };
        user: any;
      }>("/auth/exchange-token", {
        method: "POST",
        body: JSON.stringify({ code, state }),
      });
        dispatch(
            setSession({
                user: data.user,
                accessToken: data.token.accessToken,
                refreshToken: data.token.refreshToken,
            })
        );
        return data.user;
    } catch (err: any) {
      return rejectWithValue(err.message || "Error intercambiando token");
    }
  }
);

/**
 * Logout sencillo — borra sesión
 */
export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    dispatch(clearSession());
  }
);
