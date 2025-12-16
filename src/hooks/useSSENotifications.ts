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
                console.log("🔌 Conectando SSE... (intento", reconnectAttempts.current + 1, ")");

                const res = await apiFetchSSE("/events", {}, accessToken, refreshToken);

                console.log("✅ Respuesta SSE recibida, status:", res.status);

                // Verificar headers SSE
                const contentType = res.headers.get("content-type");
                console.log("📋 SSE Headers:", {
                    "content-type": contentType,
                    "cache-control": res.headers.get("cache-control"),
                    "connection": res.headers.get("connection"),
                    status: res.status,
                    statusText: res.statusText,
                    "transfer-encoding": res.headers.get("transfer-encoding")
                });

                if (!contentType?.includes("text/event-stream")) {
                    console.warn("⚠️ El servidor no está enviando SSE. Content-Type:", contentType);
                    // No reconectar si el Content-Type es incorrecto, podría ser un error del servidor
                    reconnectAttempts.current = MAX_RECONNECT_ATTEMPTS;
                    return;
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
                let buffer = ""; // Buffer para manejar chunks parciales
                let hasReceivedData = false;

                console.log("📖 Iniciando lectura del stream SSE...");

                const read = async () => {
                    if (isClosed.current) {
                        console.log("🛑 Conexión SSE marcada como cerrada, cancelando reader...");
                        reader.cancel();
                        return;
                    }

                    try {
                        console.log("⏳ Esperando datos del stream...");
                        const { value, done } = await reader.read();

                        if (done) {
                            console.log("🔚 Stream cerrado. Has recibido datos:", hasReceivedData, "Buffer:", buffer.length, "bytes");
                            
                            // Si el buffer tiene contenido, procesarlo antes de cerrar
                            if (buffer.trim()) {
                                console.log("📥 Procesando buffer final antes de cierre:", buffer);
                                // Procesar el buffer restante
                                const messages = buffer.split("\n\n");
                                messages.forEach((message) => {
                                    if (!message.trim()) return;
                                    const lines = message.split("\n");
                                    for (const line of lines) {
                                        if (line.startsWith("data: ") || line.startsWith("data:")) {
                                            const dataLine = line.startsWith("data: ") 
                                                ? line.substring(6) 
                                                : line.substring(5).trim();
                                            try {
                                                const data = JSON.parse(dataLine);
                                                store.dispatch(addNotification({ type: data.type, message: data.message }));
                                                if (!muteNotifications) {
                                                    toast(data.message || "Nueva notificación", {
                                                        icon: "🔔",
                                                        position: "top-right",
                                                        duration: 3000
                                                    });
                                                }
                                            } catch (err) {
                                                console.error("Error parseando buffer final:", err);
                                            }
                                        }
                                    }
                                });
                            }
                            if (!hasReceivedData) {
                                console.warn("⚠️ SSE cerrado por servidor SIN enviar datos. El servidor puede estar cerrando conexiones inactivas.");
                            } else {
                                console.warn("⚠️ SSE cerrado por servidor después de recibir datos.");
                            }
                            reconnectAttempts.current++;
                            
                            // Si no recibimos datos, esperar un poco más antes de reconectar
                            if (!hasReceivedData && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
                                console.log("⏸️ Esperando 5s adicionales antes de reconectar (servidor puede estar rechazando conexiones)...");
                                await new Promise((r) => setTimeout(r, 5000));
                            }
                            
                            return connect();
                        }

                        // Decodificar y agregar al buffer
                        const chunk = decoder.decode(value, { stream: true });
                        hasReceivedData = true;
                        console.log("📦 Chunk recibido (" + chunk.length + " bytes):", chunk.substring(0, 100) + (chunk.length > 100 ? "..." : ""));
                        
                        buffer += chunk;

                        // Procesar mensajes completos (separados por \n\n)
                        const messages = buffer.split("\n\n");
                        // Mantener el último mensaje incompleto en el buffer
                        buffer = messages.pop() || "";
                        
                        console.log("📊 Mensajes completos encontrados:", messages.length, "Buffer restante:", buffer.length, "bytes");

                        messages.forEach((message) => {
                            if (!message.trim()) return; // Ignorar mensajes vacíos

                            // Log raw para debugging
                            console.log("📥 SSE raw:", message);

                            // Manejar comentarios (keep-alive)
                            if (message.startsWith(":")) {
                                console.log("💓 SSE keep-alive recibido");
                                return;
                            }

                            // Buscar línea "data: "
                            const lines = message.split("\n");
                            let dataLine = "";

                            for (const line of lines) {
                                if (line.startsWith("data: ")) {
                                    dataLine = line.substring(6); // Remover "data: "
                                    break;
                                } else if (line.startsWith("data:")) {
                                    // Algunos servidores no tienen espacio después de "data:"
                                    dataLine = line.substring(5).trim();
                                    break;
                                }
                            }

                            if (!dataLine) {
                                console.warn("⚠️ Mensaje SSE sin línea 'data:', ignorando:", message);
                                return;
                            }

                            try {
                                const data = JSON.parse(dataLine);

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
                                console.error("Error parseando SSE JSON:", err, "Data:", dataLine);
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


