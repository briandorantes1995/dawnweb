import React, { useRef, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AdminNavbar from "../components/Navbars/AdminNavbar";
import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Sidebar/Sidebar";
import FixedPlugin from "../components/FixedPlugin/FixedPlugin";
import routes, { DashboardRoute } from "../routes";
import sidebarImage from "../assets/img/sidebar-3.jpg";

const Maestro: React.FC = () => {
  const [image, setImage] = useState<string>(sidebarImage);
  const [color, setColor] = useState<string>("black");
  const [hasImage, setHasImage] = useState<boolean>(true);
  const location = useLocation();
  const mainPanel = useRef<HTMLDivElement | null>(null);
  const maestroRoutes = routes.filter((r) => r.layout === "/maestro"); 

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
      {/* 🔥 AQUÍ está la corrección: ahora solo recibe las rutas del maestro */}
      <Sidebar
        color={color}
        image={hasImage ? image : ""}
        routes={maestroRoutes}
      />

      <div className="main-panel" ref={mainPanel}>
        <AdminNavbar />

        <div className="content">
          <Routes>
            {getRoutes(maestroRoutes)}
            <Route
              path="*"
              element={<Navigate to="/maestro/dashboard" replace />}
            />
          </Routes>
        </div>

        <Footer />
      </div>

      <FixedPlugin
        hasImage={hasImage}
        setHasImage={() => setHasImage(!hasImage)}
        color={color}
        setColor={(color: string) => setColor(color)}
        image={image}
        setImage={(image: string) => setImage(image)}
      />
    </div>
  );
};

export default Maestro;

