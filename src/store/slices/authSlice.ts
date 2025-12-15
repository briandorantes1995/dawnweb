import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ContactType } from "../../types/Contact";

export interface MemberRole {
  id: string;
  name: string;
  level?: number;
  description?: string;
  created_at?: string;
}


export interface MemberCompany {
  id: string;
  name: string;
  legal_name?: string | null;
  type?: string;
  plan_id?: string | null;
  owner_user_id?: string;
  created_at?: string;
  invitation_code?: string;
}

export interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  pending_approval?: boolean;
  active?: boolean;
  phone: string;
  contact?: ContactType;
  company_id?: string;
  roles: MemberRole[];
  company?: MemberCompany;
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
      if (action.payload.user) {
        const user = action.payload.user;

        // Normalizar roles siempre
        const normalizedRoles = Array.isArray(user.roles)
            ? user.roles
            : user.roles
                ? [user.roles]
                : [];

        state.user = {
          ...user,
          roles: normalizedRoles
        };
      }

      if (action.payload.accessToken !== undefined) {
        state.accessToken = action.payload.accessToken;
      }

      if (action.payload.refreshToken !== undefined) {
        state.refreshToken = action.payload.refreshToken;
      }

      state.loading = false;
    },
    updateUser(state, action: PayloadAction<Partial<Member>>) {
      if (!state.user) return;

      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
    setSession(state, action: PayloadAction<{ user: any; accessToken: string; refreshToken: string; }>) {
      const user = action.payload.user;
      const normalizedRoles = Array.isArray(user.roles)
          ? user.roles
          : user.roles
              ? [user.roles]
              : [];
      state.user = {
        ...user,
        roles: normalizedRoles
      };
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

export const { restoreSession, setSession, clearSession,updateUser } = authSlice.actions;
export default authSlice.reducer;
