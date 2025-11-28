import React from "react";
import { NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";
import { DashboardRoute } from "../../routes";

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
          <a href="https://www.creative-tim.com?ref=lbd-sidebar" className="simple-text logo-mini mx-1">
            <div className="logo-img">
              <img src={require("../../assets/img/reactlogo.png")} alt="..." />
            </div>
          </a>
          <a className="simple-text" href="http://www.creative-tim.com">Creative Tim</a>
        </div>

        <Nav as="ul">
          {routes.map((route, key) => {
            if (route.redirect) return null;
            return (
              <li className={route.upgrade ? "active active-pro" : ""} key={key}>
                <NavLink
                  to={route.path.slice(1)}
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
