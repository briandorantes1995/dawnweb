import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Nav } from "react-bootstrap";
import { DashboardRoute } from "../../adminRoutes";
import reactLogo from "../../assets/img/fehura_logo.png";

interface SidebarProps {
  color?: string;
  image?: string;
  routes: DashboardRoute[];
}

const Sidebar: React.FC<SidebarProps> = ({ color, image, routes }) => {
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState<Record<number, boolean>>({});

  const toggleSubmenu = (index: number) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const isRouteActive = (route: DashboardRoute): boolean => {
    const currentPath = location.pathname;
    const routePath = `${route.layout}${route.path}`;
    
    if (currentPath === routePath) return true;
    
    // Verificar si algún submenú está activo
    if (route.submenu) {
      return route.submenu.some(subRoute => {
        const subRoutePath = `${subRoute.layout}${subRoute.path}`;
        return currentPath === subRoutePath;
      });
    }
    
    return false;
  };

  return (
    <div className="sidebar" data-image={image} data-color={color}>
      <div className="sidebar-background" style={{ backgroundImage: `url(${image})` }} />
      <div className="sidebar-wrapper">
        <div className="logo d-flex align-items-center justify-content-start">
          <a className="simple-text logo-mini mx-1">
            <div className="logo-img">
              <img src={reactLogo} alt="..."/>
            </div>
          </a>
          <a className="simple-text">Fehura</a>
        </div>

        <Nav as="ul">
          {routes.map((route, key) => {
            if (route.redirect) return null;
            
            const hasSubmenu = route.submenu && route.submenu.length > 0;
            const isActive = isRouteActive(route);
            const isSubmenuOpen = openSubmenus[key] !== undefined ? openSubmenus[key] : isActive;

            if (hasSubmenu) {
              return (
                <li 
                  className={`${isActive ? "active" : ""} ${route.upgrade ? "active-pro" : ""}`} 
                  key={key}
                >
                  <a
                    href="#"
                    className="nav-link"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSubmenu(key);
                    }}
                  >
                    <i className={route.icon} />
                    <p>
                      {route.name}
                      <b className="caret" style={{ 
                        transform: isSubmenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease"
                      }}></b>
                    </p>
                  </a>
                  <div 
                    className={`collapse ${isSubmenuOpen ? "show" : ""}`}
                    style={{
                      maxHeight: isSubmenuOpen ? "500px" : "0",
                      overflow: "hidden",
                      transition: "max-height 0.3s ease"
                    }}
                  >
                    <ul className="nav">
                      {route.submenu!.map((subRoute, subKey) => {
                        const subRoutePath = `${subRoute.layout}${subRoute.path}`;
                        const isSubActive = location.pathname === subRoutePath;
                        
                        return (
                          <li key={subKey} className={isSubActive ? "active" : ""}>
                            <NavLink
                              to={subRoutePath}
                              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                            >
                              <i className={subRoute.icon} />
                              <p>{subRoute.name}</p>
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </li>
              );
            }

            return (
              <li className={route.upgrade ? "active active-pro" : ""} key={key}>
                <NavLink
                  to={`${route.layout}${route.path}`}
                  className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                >
                  <i className={route.icon} />
                  <p>{route.name}</p>
                </NavLink>
              </li>
            );
          })}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;
