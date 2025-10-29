export type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  companyId?: string;
  role?: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (forcePrompt?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  accessToken: string | null; // Token Auth0
  appToken: string | null;    // Token interno backend
};