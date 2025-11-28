import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  pending_approval?: boolean;
  active?: boolean;
  company_id?: string;
  roles?: string[];
}

interface AuthState {
  user: Member | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: true
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    restoreSession(state, action: PayloadAction<Partial<AuthState>>) {
      Object.assign(state, action.payload);
      state.loading = false;
    },
    setSession(
      state,
      action: PayloadAction<{
        user: Member;
        accessToken: string;
        refreshToken: string;
      }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.loading = false;
    },
    clearSession(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.loading = false;
    }
  }
});

export const { restoreSession, setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
