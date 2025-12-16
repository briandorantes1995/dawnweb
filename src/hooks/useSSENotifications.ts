import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { apiFetchSSE } from "../api/apiFetchSSE";
import { store } from "../store/store";
import { addNotification } from "../store/slices/notificationsSlice";

const MAX_RECONNECT_ATTEMPTS = 10;
const MAX_DELAY = 30000; // 30 segundos
const HEROKU_TIMEOUT = 25000; // 25 segundos - reconectar antes del timeout de Heroku (30s)

// Singleton global para SSE - solo una conexión activa en toda la app
let activeReader: ReadableStreamDefaultReader<Uint8Array> | null = null;
let isConnecting = false;
let globalReconnectAttempts = 0;
let globalIsClosed = false;
let globalHerokuTimeout: ReturnType<typeof setTimeout> | null = null;

// Función singleton para iniciar SSE
function startSSEConnection() {
    // Si ya hay una conexión activa o se está conectando, no hacer nada
    if (activeReader || isConnecting) {
        return;
    }

    const { accessToken, refreshToken } = store.getState().auth;
    if (!accessToken) return;

    isConnecting = true;
    globalIsClosed = false;
    globalReconnectAttempts = 0;

    const connect = async () => {
        if (globalIsClosed) {
            isConnecting = false;
            return;
        }

        // Si ya hay otra conexión activa, cancelar esta
        if (activeReader) {
            console.log("⚠️ Ya hay una conexión SSE activa, cancelando...");
            isConnecting = false;
            return;
        }

        // Limitar reintentos
        if (globalReconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.error("❌ Máximo de reintentos SSE alcanzado. Deteniendo reconexión.");
            isConnecting = false;
            return;
        }

        const attempt = globalReconnectAttempts;

        if (attempt > 0) {
            const delay = Math.min(1000 * 2 ** attempt, MAX_DELAY);
            console.log(`⏳ Reintentando SSE en ${delay / 1000}s... (intento ${attempt}/${MAX_RECONNECT_ATTEMPTS})`);
            await new Promise((r) => setTimeout(r, delay));
        }

        try {
            console.log("🔌 Conectando SSE... (intento", globalReconnectAttempts + 1, ")");

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
                globalReconnectAttempts = MAX_RECONNECT_ATTEMPTS;
                isConnecting = false;
                return;
            }

            if (!res.ok) {
                console.error(`❌ Error HTTP ${res.status} al conectar SSE`);
                globalReconnectAttempts++;
                isConnecting = false;
                return connect();
            }

            globalReconnectAttempts = 0; // reset backoff
            isConnecting = false;

            if (!res.body) {
                console.warn("⚠️ SSE sin body, intentando reconectar…");
                globalReconnectAttempts++;
                return connect();
            }

            const reader = res.body.getReader();
            activeReader = reader;
            
            const decoder = new TextDecoder();
            let buffer = ""; // Buffer para manejar chunks parciales
            let hasReceivedData = false;
            let lastActivity = Date.now();

            // Timeout para reconectar antes de que Heroku cierre la conexión
            globalHerokuTimeout = setTimeout(() => {
                if (!globalIsClosed && activeReader === reader) {
                    console.log("⏰ Timeout preventivo de Heroku (25s), reconectando...");
                    reader.cancel().catch(() => {});
                    activeReader = null;
                    globalReconnectAttempts = 0; // Reset porque es preventivo
                    connect();
                }
            }, HEROKU_TIMEOUT);
            
            const resetHerokuTimeout = () => {
                if (globalHerokuTimeout) clearTimeout(globalHerokuTimeout);
                globalHerokuTimeout = setTimeout(() => {
                    if (!globalIsClosed && activeReader === reader) {
                        console.log("⏰ Timeout preventivo de Heroku, reconectando...");
                        reader.cancel().catch(() => {});
                        activeReader = null;
                        globalReconnectAttempts = 0;
                        connect();
                    }
                }, HEROKU_TIMEOUT);
            };

            console.log("📖 Iniciando lectura del stream SSE...");

            const read = async () => {
                if (globalIsClosed || activeReader !== reader) {
                    if (globalHerokuTimeout) clearTimeout(globalHerokuTimeout);
                    reader.cancel().catch(() => {});
                    if (activeReader === reader) {
                        activeReader = null;
                    }
                    return;
                }

                try {
                    const { value, done } = await reader.read();

                    if (done) {
                        if (globalHerokuTimeout) clearTimeout(globalHerokuTimeout);
                        if (activeReader === reader) {
                            activeReader = null;
                        }
                        const timeOpen = Date.now() - lastActivity;
                        console.log("🔚 Stream cerrado. Tiempo abierto:", Math.round(timeOpen / 1000), "s. Datos recibidos:", hasReceivedData);
                        
                        // Si el buffer tiene contenido, procesarlo antes de cerrar
                        if (buffer.trim()) {
                            console.log("📥 Procesando buffer final:", buffer.substring(0, 200));
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
                                            const { muteNotifications } = store.getState().ui;
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
                        
                        globalReconnectAttempts++;
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
                            const { muteNotifications } = store.getState().ui;

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
                    if (globalHerokuTimeout) clearTimeout(globalHerokuTimeout);
                    if (activeReader === reader) {
                        activeReader = null;
                    }
                    console.error("❌ Error leyendo SSE:", error);
                    globalReconnectAttempts++;
                    connect();
                }
            };

            await read();

        } catch (error) {
            console.error("❌ SSE ERROR:", error);
            globalReconnectAttempts++;
            isConnecting = false;
            connect();
        }
    };

    connect();
}

// Función para detener SSE
function stopSSEConnection() {
    globalIsClosed = true;
    if (globalHerokuTimeout) {
        clearTimeout(globalHerokuTimeout);
        globalHerokuTimeout = null;
    }
    if (activeReader) {
        activeReader.cancel().catch(() => {});
        activeReader = null;
    }
    isConnecting = false;
}

export function useSSENotifications() {
    const { accessToken } = store.getState().auth;

    useEffect(() => {
        if (!accessToken) {
            stopSSEConnection();
            return;
        }

        // Iniciar conexión singleton
        startSSEConnection();

        return () => {
            // No detener la conexión al desmontar, solo si no hay accessToken
            // Esto permite que la conexión persista entre navegaciones
        };

    }, [accessToken]);
}


