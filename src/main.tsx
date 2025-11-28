/*!
=========================================================
* Light Bootstrap Dashboard React - Typescript Migration
=========================================================
*/
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./assets/css/animate.min.css";
import "./assets/scss/light-bootstrap-dashboard-react.scss";
import "./assets/css/demo.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/Admin";
import Login from "./auth/Login";
import OAuthCallback from "./auth/0AthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import MaestroDashboard from "./layouts/Maestro";
import NoPermission from "./views/NoPermission";

const container = document.getElementById("root");

if (!container) throw new Error("No se encontró el elemento root");

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
           {/* Maestro */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              />

              {/* Dueño */}
              <Route
                path="/master/*"
                element={
                  <ProtectedRoute allowedRoles={["Maestro"]}>
                    <MaestroDashboard />
                  </ProtectedRoute>
                }
              />

            <Route path="/no-permission" element={<NoPermission />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
