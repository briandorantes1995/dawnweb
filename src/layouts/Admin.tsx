import React, { useRef, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AdminNavbar from "../components/Navbars/AdminNavbar";
import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Sidebar/Sidebar";
import FixedPlugin from "../components/FixedPlugin/FixedPlugin";
import routes, { DashboardRoute } from "../adminRoutes";
import { useSSENotifications } from "../hooks/useSSENotifications";
import { useSelector} from "react-redux";
import { RootState } from "../store/store";

const Admin: React.FC = () => {
    useSSENotifications();

    const location = useLocation();
    const mainPanel = useRef<HTMLDivElement | null>(null);
    const adminRoutes = routes.filter((r) => r.layout === "/admin");
    const { sidebarColor, sidebarImage, sidebarHasImage } = useSelector(
        (state: RootState) => state.ui);


    // Render dinamico de rutas
    const getRoutes = (routes: DashboardRoute[]) =>
        routes.map((prop, key) => {
            const Component = prop.component;
            return <Route key={key} path={prop.path} element={<Component />} />;
        });

    // Scroll top y cierre del menú móvil
    useEffect(() => {
        document.documentElement.scrollTop = 0;
        document.scrollingElement!.scrollTop = 0;
        if (mainPanel.current) mainPanel.current.scrollTop = 0;

        if (
            window.innerWidth < 993 &&
            document.documentElement.classList.contains("nav-open")
        ) {
            document.documentElement.classList.remove("nav-open");
            const element = document.getElementById("bodyClick");
            if (element?.parentNode) element.parentNode.removeChild(element);
        }
    }, [location]);

    return (
        <div className="wrapper">
            {/*IDEBAR CONTROLADO POR REDUX */}
            <Sidebar
                color={sidebarColor}
                image={sidebarHasImage ? sidebarImage : ""}
                routes={adminRoutes}
            />

            <div className="main-panel" ref={mainPanel}>
                <AdminNavbar />

                <div className="content">
                    <Routes>
                        {getRoutes(adminRoutes)}
                        <Route
                            path="*"
                            element={<Navigate to="/admin/dashboard" replace />}
                        />
                    </Routes>
                </div>

                <Footer />
            </div>

            {/*PANEL DE CONFIGURACIÓN */}
            <FixedPlugin/>
        </div>
    );
};

export default Admin;




