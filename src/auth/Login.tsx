import React, { useState, useEffect, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store/store";
import { loginThunk, logoutThunk,oauthLoginThunk } from "../store/auththunks";

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, accessToken, loading } = useSelector(
  (state: RootState) => state.auth
);
 const isAuthenticated = !!user && !!accessToken;
 const isLoading = loading;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await dispatch(loginThunk({ email, password }));
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutThunk());
  };

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
    <div className="content">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h2 className="title text-center">Fehura</h2>

                {isAuthenticated && user && (
                  <div className="alert alert-success mt-3">
                    <strong>Sesión activa:</strong>
                    <br />
                    {user.email}
                    <br />
                    <small>
                      ¿Quieres usar otra cuenta? Usa los botones de abajo.
                    </small>
                  </div>
                )}

                {isAuthenticated ? (
                  <div className="mt-4 text-center">
                    <button
                      className="btn btn-primary btn-lg mr-3"
                      onClick={() => navigate("/admin/dashboard")}
                    >
                      Continuar al Dashboard
                    </button>
                    <br />
                    <button
                      className="btn btn-danger mt-2"
                      onClick={handleLogout}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <div className="mt-4">
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleLogin}>
                      <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input
                          type="email"
                          className="form-control"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Contraseña</label>
                        <input
                          type="password"
                          className="form-control"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary btn-block btn-lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Procesando..." : "Iniciar Sesión"}
                      </button>
                    </form>

                    <hr className="my-4" />
                   <div className="text-center">
                  <button
                    className="btn btn-outline-danger btn-lg btn-block"
                    onClick={() => dispatch(oauthLoginThunk({ provider: "google" }))}
                  >
                    Continuar con Google
                  </button>

                  <button
                    className="btn btn-outline-primary btn-lg btn-block mt-2"
                    onClick={() => dispatch(oauthLoginThunk({ provider: "microsoft" }))}
                  >
                    Continuar con Microsoft
                  </button>
                </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
