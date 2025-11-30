import React, { useRef, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AdminNavbar from "../components/Navbars/AdminNavbar";
import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Sidebar/Sidebar";
import FixedPlugin from "../components/FixedPlugin/FixedPlugin";
import maestroRoutes, { DashboardRoute } from "../maestroRoutes";
import { useSSENotifications } from "../hooks/useSSENotifications";
import { useSelector} from "react-redux";
import { RootState } from "../store/store";

const Maestro: React.FC = () => {
    const location = useLocation();
    const mainPanel = useRef<HTMLDivElement | null>(null);
    const masterRoutes = maestroRoutes.filter((r) => r.layout === "/maestro");
    const { sidebarImage, sidebarColor, sidebarHasImage } = useSelector(
        (s: RootState) => s.ui
    );

    useSSENotifications();

    const getRoutes = (routes: DashboardRoute[]) =>
        routes.map((prop, key) => {
            const Component = prop.component;
            return <Route key={key} path={prop.path} element={<Component />} />;
        });

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
            <Sidebar
                color={sidebarColor}
                image={sidebarHasImage ? sidebarImage : ""}
                routes={masterRoutes}
            />

            <div className="main-panel" ref={mainPanel}>
                <AdminNavbar />

                <div className="content">
                    <Routes>
                        {getRoutes(masterRoutes)}
                        <Route
                            path="*"
                            element={<Navigate to="/maestro/dashboard" replace />}
                        />
                    </Routes>
                </div>

                <Footer />
            </div>

            {/*Configuración visual */}
            <FixedPlugin/>
        </div>
    );
};

export default Maestro;



