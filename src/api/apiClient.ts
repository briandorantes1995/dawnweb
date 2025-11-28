import { store } from "../store/store";
import { clearSession, setSession } from "../store/slices/authSlice";

const API_URL = process.env.REACT_APP_API_URL || "https://dawnapi.fly.dev";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const state = store.getState().auth;
  let accessToken = state.accessToken;
  let refreshToken = state.refreshToken;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>)
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const url = `${API_URL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;

  let res = await fetch(url, { ...options, headers });

  // TOKEN EXPIRED → REFRESH
  if (res.status === 401 && refreshToken) {
    const refreshed = await attemptRefresh(refreshToken);

    if (refreshed) {
      headers.Authorization = `Bearer ${refreshed.accessToken}`;
      res = await fetch(url, { ...options, headers });
    } else {
      store.dispatch(clearSession());
      throw new Error("Sesión expirada");
    }
  }

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Error ${res.status}: ${msg}`);
  }

  return res.json();
}

async function attemptRefresh(refreshToken: string) {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    });

    if (!res.ok) return null;

    const data = await res.json();

    const state = store.getState().auth;
    if (state.user) {
      store.dispatch(
        setSession({
          user: state.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken
        })
      );
    }

    return data;
  } catch {
    return null;
  }
}
