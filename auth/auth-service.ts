// Stub temporal de auth-service mientras migramos a Auth0
export type UserAuthData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_id?: string;
  branch_id?: string;
  role_level?: number;
  role_id?: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export async function registerUserWithPassword(_data: UserAuthData) {
  // TODO: migrar a Edge Function con Auth0
  return { success: false, error: 'Not implemented' };
}

export async function registerNormalUser(_data: UserAuthData) {
  // TODO: migrar a Edge Function con Auth0
  return { success: false, error: 'Not implemented' };
}

export async function loginWithPassword(_data: LoginData) {
  // TODO: usar Auth0 en su lugar
  return { success: false, error: 'Use Auth0 login', user: null, userData: null };
}















