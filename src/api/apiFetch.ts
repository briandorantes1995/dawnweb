// src/api/apiFetch.ts
import { store } from "../store/store";
import { setSession } from "../store/slices/authSlice";

const API_URL = import.meta.env.VITE_SSE_URL || "https://microservicio-notificacionespush-production.up.railway.app";

export async function apiFetch<T = any>(
    endpoint: string,
    options: RequestInit = {},
    accessToken?: string,
    refreshToken?: string
): Promise<T> {

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    const url = `${API_URL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;
    let res = await fetch(url, { ...options, headers });

    // 🔄 Intentar refresh
    if (res.status === 401 && refreshToken) {
        const refreshed = await attemptRefresh(refreshToken);

        if (refreshed) {
            headers.Authorization = `Bearer ${refreshed.accessToken}`;
            res = await fetch(url, { ...options, headers });
        } else {
            throw new Error("Sesión expirada");
        }
    }

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Error ${res.status}: ${msg}`);
    }

    return res.json() as Promise<T>;
}

/********************************************
 * 🔄 Refresh Token
 ********************************************/
async function attemptRefresh(refreshToken: string) {
    try {
        const MAIN_API = import.meta.env.VITE_API_URL;

        const res = await fetch(`${MAIN_API}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) return null;

        const data = await res.json();

        const state = store.getState().auth;
        if (state.user) {
            store.dispatch(
                setSession({
                    user: state.user,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                })
            );
        }

        return data;
    } catch {
        return null;
    }
}

