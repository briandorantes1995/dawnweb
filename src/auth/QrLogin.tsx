import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { apiFetch } from "../api/apiClient";

interface QrResponse {
    sessionId: string;
    qr: string;
}

const MAX_REFRESHES = 4;
const QR_LIFETIME = 60; // seconds

const QrLogin: React.FC<{ onLogin: (data: any) => void }> = ({ onLogin }) => {
    const [qr, setQr] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [refreshCount, setRefreshCount] = useState(0);
    const [expiresIn, setExpiresIn] = useState(QR_LIFETIME);
    const [isExpired, setIsExpired] = useState(false);

    const socketRef = useRef<any>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const connectSocket = (session: string) => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        const socket = io(import.meta.env.VITE_API_URL, {
            transports: ["websocket"],
        });

        socket.on("connect", () => {
            socket.emit("qr-session", { sessionId: session });
        });

        socket.on("qr:authenticated", (payload) => {
            onLogin(payload);
        });

        socketRef.current = socket;
    };

    const fetchQr = async () => {
        if (refreshCount >= MAX_REFRESHES) {
            setIsExpired(true);
            return;
        }

        const data = await apiFetch<QrResponse>("/auth/qr-create");

        setQr(data.qr);
        setSessionId(data.sessionId);
        setRefreshCount((c) => c + 1);

        setExpiresIn(QR_LIFETIME);
        setIsExpired(false);

        connectSocket(data.sessionId);

        // reset timer
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setExpiresIn((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        fetchQr();

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return (
        <div className="text-center mt-4">
            <h4 className="text-white mb-3">Iniciar con QR</h4>

            <div
                style={{
                    position: "relative",
                    width: "260px",
                    height: "260px",
                    margin: "0 auto",
                }}
            >
                {qr && (
                    <img
                        src={qr}
                        alt="QR"
                        style={{
                            width: "100%",
                            height: "100%",
                            background: "white",
                            padding: "10px",
                            borderRadius: "12px",
                            transition: "opacity 0.3s",
                            opacity: isExpired ? 0.35 : 1,
                            filter: isExpired ? "grayscale(100%)" : "none",
                        }}
                    />
                )}

                {/* Overlay tipo WhatsApp Web */}
                {isExpired && refreshCount < MAX_REFRESHES && (
                    <div
                        onClick={fetchQr}
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                            zIndex: 5,
                        }}
                    >
                        <div
                            style={{
                                width: "90px",
                                height: "90px",
                                background: "rgba(0,0,0,0.6)",
                                borderRadius: "50%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                backdropFilter: "blur(2px)",
                                transition: "0.2s",
                            }}
                        >
                            {/* Icono de reload tipo WhatsApp */}
                            <span
                                style={{
                                    fontSize: "45px",
                                    color: "white",
                                    transform: "rotate(0deg)",
                                }}
                            >
                ↻
              </span>
                        </div>
                    </div>
                )}
            </div>

            {!isExpired && (
                <p className="text-white mt-2">
                    Expira en: <strong>{expiresIn}s</strong>
                </p>
            )}

            {refreshCount >= MAX_REFRESHES && isExpired && (
                <p className="text-warning mt-3">
                    Límite alcanzado. Espera 1 minuto para regenerar.
                </p>
            )}
        </div>
    );
};

export default QrLogin;
