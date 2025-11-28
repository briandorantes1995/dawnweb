import { AppDispatch } from "./store";
import { setSession, clearSession } from "./slices/authSlice";
import { apiFetch } from "../api/apiClient";

export const loginThunk =
  (email: string, password: string) => async (dispatch: AppDispatch) => {
    const data = await apiFetch<{
      token: { accessToken: string; refreshToken: string };
      user: any;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    const user = data.user;

    if (user.pending_approval)
      throw new Error("Cuenta pendiente de aprobación.");

    if (user.active === false)
      throw new Error("Cuenta desactivada. Contacta a tu empresa.");

    dispatch(
      setSession({
        user,
        accessToken: data.token.accessToken,
        refreshToken: data.token.refreshToken
      })
    );

    return user;
  };

export const logoutThunk = () => async (dispatch: AppDispatch) => {
  dispatch(clearSession());
};
