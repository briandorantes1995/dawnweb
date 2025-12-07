// src/hooks/useApi.ts
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { apiFetch } from "../api/apiFetch";

export function useApiFetch() {
    const { loading, accessToken, refreshToken } = useSelector(
        (s: RootState) => s.auth
    );

    const request = async <T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> => {

        if (loading) {
            throw new Error("Auth cargando, espera...");
        }

        return apiFetch<T>(endpoint, options, accessToken, refreshToken);
    };

    return {
        request,

        get: <T>(endpoint: string) =>
            request<T>(endpoint, { method: "GET" }),

        post: <T>(endpoint: string, body?: any) =>
            request<T>(endpoint, {
                method: "POST",
                body: body ? JSON.stringify(body) : undefined,
                headers: { "Content-Type": "application/json" },
            }),

        patch: <T>(endpoint: string, body?: any) =>
            request<T>(endpoint, {
                method: "PATCH",
                body: body ? JSON.stringify(body) : undefined,
                headers: { "Content-Type": "application/json" },
            }),

        put: <T>(endpoint: string, body: any) =>
            request<T>(endpoint, {
                method: "PUT",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            }),

        del: <T>(endpoint: string) =>
            request<T>(endpoint, { method: "DELETE" }),
    };
}
