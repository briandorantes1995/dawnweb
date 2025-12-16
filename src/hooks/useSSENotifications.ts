import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { apiFetchSSE } from "../api/apiFetchSSE";
import { store } from "../store/store";
import { addNotification } from "../store/slices/notificationsSlice";

const MAX_RECONNECT_ATTEMPTS = 10;
const MAX_DELAY = 30000; // 30 segundos

export function useSSENotifications() {
    const { accessToken, refreshToken } = store.getState().auth;
    const { muteNotifications } = store.getState().ui;
    const reconnectAttempts = useRef(0);
    const isClosed = useRef(false);

    useEffect(() => {
        if (!accessToken) return;

        isClosed.current = false;
        reconnectAttempts.current = 0;

        const connect = async () => {
            if (isClosed.current) return;

            // Limitar reintentos
            if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
                console.error("❌ Máximo de reintentos SSE alcanzado. Deteniendo reconexión.");
                return;
            }

            const attempt = reconnectAttempts.current;

            if (attempt > 0) {
                const delay = Math.min(1000 * 2 ** attempt, MAX_DELAY);
                console.log(`⏳ Reintentando SSE en ${delay / 1000}s... (intento ${attempt}/${MAX_RECONNECT_ATTEMPTS})`);
                await new Promise((r) => setTimeout(r, delay));
            }

            try {
                console.log("🔌 Conectando SSE...");

                const res = await apiFetchSSE("/events", {}, accessToken, refreshToken);

                // Verificar headers SSE
                const contentType = res.headers.get("content-type");
                if (!contentType?.includes("text/event-stream")) {
                    console.warn("⚠️ El servidor no está enviando SSE. Content-Type:", contentType);
                }

                if (!res.ok) {
                    console.error(`❌ Error HTTP ${res.status} al conectar SSE`);
                    reconnectAttempts.current++;
                    return connect();
                }

                reconnectAttempts.current = 0; // reset backoff

                if (!res.body) {
                    console.warn("⚠️ SSE sin body, intentando reconectar…");
                    reconnectAttempts.current++;
                    return connect();
                }

                const reader = res.body.getReader();
                const decoder = new TextDecoder();

                const read = async () => {
                    if (isClosed.current) {
                        reader.cancel();
                        return;
                    }

                    try {
                        const { value, done } = await reader.read();

                        if (done) {
                            console.warn("⚠️ SSE cerrado por servidor.");
                            reconnectAttempts.current++;
                            return connect();
                        }

                        const text = decoder.decode(value, { stream: true });

                        text.split("\n\n").forEach((chunk) => {
                            if (chunk.startsWith("data: ")) {
                                const json = chunk.replace("data: ", "");

                                try {
                                    const data = JSON.parse(json);

                                    store.dispatch(addNotification({ type: data.type, message: data.message }));

                                    if (!muteNotifications) {
                                        toast(data.message || "Nueva notificación", {
                                            icon: "🔔",
                                            position: "top-right",
                                            duration: 3000
                                        });
                                    }

                                    console.log("📨 SSE recibido:", data);

                                } catch (err) {
                                    console.error("Error parseando SSE:", err);
                                }
                            }
                        });

                        await read(); // continuar escuchando
                    } catch (error) {
                        console.error("Error leyendo SSE:", error);
                        reconnectAttempts.current++;
                        connect();
                    }
                };

                await read();

            } catch (error) {
                console.error("❌ SSE ERROR:", error);
                reconnectAttempts.current++;
                connect();
            }
        };

        connect();

        return () => {
            isClosed.current = true;
        };

    }, [accessToken, refreshToken, muteNotifications]);
}


