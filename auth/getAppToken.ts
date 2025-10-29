import * as SecureStore from "expo-secure-store";

const SECURE_KEY_APP_TOKEN = "auth.app_token";

/**
 * Obtiene el token interno (del backend) desde SecureStore.
 * Lanza un error si no existe.
 */
export async function getAppToken(): Promise<string> {
  try {
    const token = await SecureStore.getItemAsync(SECURE_KEY_APP_TOKEN);
    if (!token) {
      throw new Error("No app token found. User may not be authenticated.");
    }
    return token;
  } catch (err) {
    console.error("[Auth] Error reading app token:", err);
    throw err;
  }
}
