import React from "react";
import { NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";
import { DashboardRoute } from "../../routes";
import reactLogo from "../../assets/img/fehura_logo.png";

interface SidebarProps {
  color?: string;
  image?: string;
  routes: DashboardRoute[];
}

const Sidebar: React.FC<SidebarProps> = ({ color, image, routes }) => {
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
