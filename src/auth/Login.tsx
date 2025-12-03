import React, { useState, useEffect, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store/store";
import { loginThunk,loginWithQrThunk,logoutThunk, oauthLoginThunk } from "../store/auththunks";
import { MemberRole } from "../store/slices/authSlice";
import QrLogin from "./QrLogin";

const Login: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user, accessToken, loading } = useSelector((state: RootState) => state.auth);
    const isAuthenticated = !!user && !!accessToken;
    const isLoading = loading;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showQr, setShowQr] = useState(false);

    // Redirección si ya esta autenticado
    useEffect(() => {
        if (isAuthenticated && user) {
            const hasAdmin = user.roles.some((r) => r.name.toLowerCase() === "admin");
            const hasMaestro = user.roles.some(
                (r) => r.name.toLowerCase() === "maestro"
            );

            if (hasAdmin) navigate("/admin/dashboard");
            else if (hasMaestro) navigate("/maestro/dashboard");
            else navigate("/no-permission");
        }
    }, [isAuthenticated, navigate]);

    // --------------------------------------
    // LOGIN POR QR (desde el socket)
    // --------------------------------------
    const handleQrAuth = async (payload: any) => {
        const { tokens, user } = payload;

        try {
            await dispatch(
                loginWithQrThunk({
                    tokens,
                    user
                })
            );
            const hasAdmin = user.roles.some((r: MemberRole) => r.name.toLowerCase() === "admin");
            const hasMaestro = user.roles.some((r: MemberRole) => r.name.toLowerCase() === "maestro");

            if (hasAdmin) navigate("/admin/dashboard");
            else if (hasMaestro) navigate("/maestro/dashboard");
            else navigate("/no-permission");
        } catch (err) {
            console.error("Error al autenticar con QR:", err);
        }
    };

    // --------------------------------------
    // LOGIN NORMAL
    // --------------------------------------
    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const result = await dispatch(loginThunk({ email, password })).unwrap();
            const user = result.user;
            const hasAdmin = user.roles.some((r: MemberRole) => r.name.toLowerCase() === "admin");
            const hasMaestro = user.roles.some((r: MemberRole) => r.name.toLowerCase() === "maestro");

            if (hasAdmin) navigate("/admin/dashboard");
            else if (hasMaestro) navigate("/maestro/dashboard");
            else navigate("/no-permission");
        } catch (err: any) {
            setError(err.message || "Error al iniciar sesión");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = async () => {
        await dispatch(logoutThunk());
    };

    // ---------------------------- UI ----------------------------
    if (isLoading) {
        return (
            <div className="content">
                <div className="container-fluid">
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-body text-center">
                                    <div className="spinner-border text-primary" role="status" />
                                    <p className="mt-3">Cargando...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="d-flex align-items-center justify-content-center"
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #2F80ED, #56CCF2)",
                padding: "20px",
            }}
        >
            <div
                className="card shadow-lg"
                style={{
                    width: "100%",
                    maxWidth: "450px",
                    borderRadius: "20px",
                    backdropFilter: "blur(12px)",
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.2)",
                }}
            >
                <div className="card-body p-4">
                    <h2 className="text-center mb-4"
                        style={{
                            fontWeight: 700,
                            color: "#FFD700",
                            textShadow: "0 0 8px rgba(255, 215, 0, 0.6)",
                        }}>
                        Fehura
                    </h2>

                    {error && <div className="alert alert-danger text-center">{error}</div>}

                    {/* ======================================================
               MODO QR ACTIVADO
             ====================================================== */}
                    {showQr ? (
                        <>
                            <QrLogin onLogin={handleQrAuth} />

                            <button
                                className="btn btn-light btn-lg w-100 mt-4"
                                style={{ borderRadius: "12px" }}
                                onClick={() => setShowQr(false)}
                            >
                                Iniciar con contraseña o Auth
                            </button>
                        </>
                    ) : (
                        <>
                            {/* ======================================================
                   MODO LOGIN NORMAL
                 ====================================================== */}
                            {!isAuthenticated && (
                                <>
                                    <form onSubmit={handleLogin}>
                                        <div className="form-group mb-3">
                                            <label style={{ color: "white" }}>Correo Electrónico</label>
                                            <input
                                                type="email"
                                                className="form-control form-control-lg"
                                                style={{
                                                    borderRadius: "12px",
                                                    border: "1px solid rgba(255,255,255,0.4)",
                                                    background: "rgba(255,255,255,0.25)",
                                                    color: "white",
                                                }}
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group mb-4">
                                            <label style={{ color: "white" }}>Contraseña</label>
                                            <input
                                                type="password"
                                                className="form-control form-control-lg"
                                                style={{
                                                    borderRadius: "12px",
                                                    border: "1px solid rgba(255,255,255,0.4)",
                                                    background: "rgba(255,255,255,0.25)",
                                                    color: "white",
                                                }}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg btn-block w-100"
                                            style={{
                                                borderRadius: "12px",
                                                background: "#1e87f0",
                                                border: "none",
                                                padding: "12px",
                                                color: "#0a0a0a",
                                                fontWeight: 600,
                                                textShadow: "0 0 2px rgba(255,255,255,0.6)"
                                            }}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Procesando..." : "Iniciar Sesión"}
                                        </button>
                                    </form>

                                    <hr className="my-4" style={{ borderColor: "rgba(255,255,255,0.3)" }} />

                                    {/* Autenticación con Google / Microsoft */}
                                    <div className="text-center">
                                        <button
                                            className="btn btn-light btn-lg w-100 mb-2"
                                            style={{
                                                borderRadius: "12px",
                                                color: "#0a0a0a",
                                                fontWeight: 600,
                                                textShadow: "0 0 2px rgba(255,255,255,0.5)"
                                            }}
                                            onClick={() => dispatch(oauthLoginThunk({ provider: "google" }))}
                                        >
                                            <i className="fab fa-google mr-2"></i> Continuar con Google
                                        </button>

                                        <button
                                            className="btn btn-outline-light btn-lg w-100"
                                            style={{
                                                borderRadius: "12px",
                                                color: "#ffffff",
                                                fontWeight: 600,
                                                textShadow: "1px 1px 3px rgba(0,0,0,0.8)"
                                            }}
                                            onClick={() => dispatch(oauthLoginThunk({ provider: "azure" }))}
                                        >
                                            <i className="fab fa-microsoft mr-2"></i> Continuar con Microsoft
                                        </button>
                                    </div>

                                    {/* Botón QR */}
                                    <button
                                        className="btn btn-outline-light btn-lg w-100 mt-3"
                                        style={{
                                            borderRadius: "12px",
                                            color: "#0a0a0a",
                                            fontWeight: 600,
                                            textShadow: "0 0 2px rgba(255,255,255,0.5)"
                                        }}
                                        onClick={() => setShowQr(true)}
                                    >
                                        <i className="fas fa-qrcode mr-2"></i> Iniciar con QR
                                    </button>
                                </>
                            )}

                            {/* SESIÓN YA ACTIVA */}
                            {isAuthenticated && user && (
                                <div className="text-center">
                                    <div className="alert alert-success">
                                        <strong>Sesión activa</strong> <br />
                                        {user.email}
                                    </div>

                                    <button
                                        className="btn btn-primary btn-lg w-100 mb-2"
                                        style={{
                                            borderRadius: "12px",
                                            color: "#0a0a0a",
                                            fontWeight: 600,
                                            textShadow: "0 0 2px rgba(255,255,255,0.6)"
                                        }}
                                        onClick={() => navigate("/admin/dashboard")}
                                    >
                                        Continuar
                                    </button>

                                    <button
                                        className="btn btn-danger btn-lg w-100"
                                        style={{
                                            borderRadius: "12px",
                                            color: "#ffffff",
                                            fontWeight: 700,
                                            textShadow: "1px 1px 4px rgba(0,0,0,0.9)"
                                        }}
                                        onClick={handleLogout}
                                    >
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;

