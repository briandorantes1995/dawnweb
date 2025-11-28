import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { apiFetch } from "../api/apiClient";

export function useApi() {
  const { loading } = useSelector((s: RootState) => s.auth);

  const request = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    if (loading) {
      throw new Error("Auth cargando, espera...");
    }

    return apiFetch<T>(endpoint, options);
  };

  return {
    request,
    get: <T>(e: string) => request<T>(e, { method: "GET" }),
    post: <T>(e: string, b: any) =>
      request<T>(e, {
        method: "POST",
        body: JSON.stringify(b),
        headers: { "Content-Type": "application/json" }
      }),
    put: <T>(e: string, b: any) =>
      request<T>(e, {
        method: "PUT",
        body: JSON.stringify(b),
        headers: { "Content-Type": "application/json" }
      }),
    del: <T>(e: string) => request<T>(e, { method: "DELETE" })
  };
}
