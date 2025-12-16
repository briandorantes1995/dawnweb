import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { apiFetchSSE } from "../api/apiFetchSSE";
import { store } from "../store/store";
import { addNotification } from "../store/slices/notificationsSlice";

const MAX_RECONNECT_ATTEMPTS = 10;
const MAX_DELAY = 30000; // 30 segundos
const HEROKU_TIMEOUT = 25000; // 25 segundos - reconectar antes del timeout de Heroku (30s)

// Variable global para prevenir múltiples conexiones SSE simultáneas
let activeReader: ReadableStreamDefaultReader<Uint8Array> | null = null;

export function useSSENotifications() {
    const { accessToken, refreshToken } = store.getState().auth;
    const { muteNotifications } = store.getState().ui;
    const reconnectAttempts = useRef(0);
    const isClosed = useRef(false);
    const currentReader = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

    useEffect(() => {
        if (!accessToken) return;

        isClosed.current = false;
        reconnectAttempts.current = 0;

        const connect = async () => {
            if (isClosed.current) return;

            // Prevenir múltiples conexiones simultáneas
            if (activeReader) {
                console.log("⚠️ Ya hay una conexión SSE activa, cancelando conexión anterior...");
                activeReader.cancel().catch(() => {});
                activeReader = null;
            }

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
                currentReader.current = reader;
                activeReader = reader;
                
                const decoder = new TextDecoder();
                let buffer = ""; // Buffer para manejar chunks parciales
                let hasReceivedData = false;
                let lastActivity = Date.now();

                // Timeout para reconectar antes de que Heroku cierre la conexión
                let herokuTimeout: ReturnType<typeof setTimeout> | null = setTimeout(() => {
                    if (!isClosed.current) {
                        console.log("⏰ Timeout preventivo de Heroku (25s), reconectando...");
                        reader.cancel();
                        reconnectAttempts.current = 0; // Reset porque es preventivo
                        connect();
                    }
                }, HEROKU_TIMEOUT);
                
                const resetHerokuTimeout = () => {
                    if (herokuTimeout) clearTimeout(herokuTimeout);
                    herokuTimeout = setTimeout(() => {
                        if (!isClosed.current) {
                            console.log("⏰ Timeout preventivo de Heroku, reconectando...");
                            reader.cancel();
                            reconnectAttempts.current = 0;
                            connect();
                        }
                    }, HEROKU_TIMEOUT);
                };

                console.log("📖 Iniciando lectura del stream SSE...");

                const read = async () => {
                    if (isClosed.current || activeReader !== reader) {
                        if (herokuTimeout) clearTimeout(herokuTimeout);
                        reader.cancel().catch(() => {});
                        if (activeReader === reader) {
                            activeReader = null;
                        }
                        currentReader.current = null;
                        return;
                    }

                    try {
                        const { value, done } = await reader.read();

                        if (done) {
                            if (herokuTimeout) clearTimeout(herokuTimeout);
                            if (activeReader === reader) {
                                activeReader = null;
                            }
                            currentReader.current = null;
                            const timeOpen = Date.now() - lastActivity;
                            console.log("🔚 Stream cerrado. Tiempo abierto:", Math.round(timeOpen / 1000), "s. Datos recibidos:", hasReceivedData);
                            
                            // Si el buffer tiene contenido, procesarlo antes de cerrar
                            if (buffer.trim()) {
                                console.log("📥 Procesando buffer final:", buffer.substring(0, 200));
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
                            if (!hasReceivedData && timeOpen < 5000) {
                                // Si se cerró muy rápido (< 5s), probablemente es Heroku o un error del servidor
                                console.warn("⚠️ SSE cerrado muy rápido (" + Math.round(timeOpen / 1000) + "s). Probable timeout de Heroku o error del servidor.");
                            } else if (!hasReceivedData) {
                                console.warn("⚠️ SSE cerrado sin datos después de", Math.round(timeOpen / 1000), "s");
                            }
                            
                            reconnectAttempts.current++;
                            return connect();
                        }

                        // Decodificar y agregar al buffer
                        const chunk = decoder.decode(value, { stream: true });
                        hasReceivedData = true;
                        lastActivity = Date.now();
                        
                        // Resetear timeout de Heroku si recibimos datos
                        resetHerokuTimeout();
                        
                        buffer += chunk;

                        // Procesar mensajes completos (separados por \n\n)
                        const messages = buffer.split("\n\n");
                        // Mantener el último mensaje incompleto en el buffer
                        buffer = messages.pop() || "";

                        messages.forEach((message) => {
                            if (!message.trim()) return; // Ignorar mensajes vacíos

                            // Manejar comentarios (keep-alive)
                            if (message.startsWith(":")) {
                                // Keep-alive recibido, conexión está viva
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

                                console.log("📨 Notificación SSE:", data.type, "-", data.message);

                            } catch (err) {
                                console.error("Error parseando SSE JSON:", err, "Data:", dataLine);
                            }
                        });

                        await read(); // continuar escuchando
                    } catch (error) {
                        if (herokuTimeout) clearTimeout(herokuTimeout);
                        if (activeReader === reader) {
                            activeReader = null;
                        }
                        currentReader.current = null;
                        console.error("❌ Error leyendo SSE:", error);
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
            if (currentReader.current) {
                currentReader.current.cancel().catch(() => {});
                currentReader.current = null;
            }
            if (activeReader) {
                activeReader.cancel().catch(() => {});
                activeReader = null;
            }
        };

    }, [accessToken, refreshToken, muteNotifications]);
}


