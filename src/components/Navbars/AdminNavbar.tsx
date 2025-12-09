import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Dropdown, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { logoutThunk } from "../../store/auththunks";
import { markAllRead } from "../../store/slices/notificationsSlice";
import { canCreateLoads } from "../../utils/companyPermissions";

import adminRoutes from "../../adminRoutes";
import maestroRoutes from "../../maestroRoutes";


function Header() {

  const location = useLocation();
  const currentRoutes = location.pathname.startsWith("/admin") ? adminRoutes : location.pathname.startsWith("/maestro") ? maestroRoutes : [];
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.auth.user);
  const notifications = useSelector((state: RootState) => state.notifications.items);
  const userRole = useSelector((state: RootState) => state.auth.user?.roles?.[0]?.name);

  const unreadCount = notifications.filter(n => !n.read).length;
  const userCanCreateLoads = canCreateLoads(user);
  const hasRolePermission = userRole === "Admin" || userRole === "Maestro";
  const showCargasMenu = userCanCreateLoads && hasRolePermission;

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/login");
  };

  const mobileSidebarToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    document.documentElement.classList.toggle("nav-open");

    const node = document.createElement("div");
    node.id = "bodyClick";
    node.onclick = function (this: HTMLElement) {
      this.parentElement?.removeChild(this);
      document.documentElement.classList.toggle("nav-open");
    };
    document.body.appendChild(node);
  };

  const getBrandText = () => {
    for (let i = 0; i < currentRoutes.length; i++) {
      const r = currentRoutes[i];
      if (location.pathname.startsWith(r.layout + r.path)) {
        return r.name;
      }
    }
    return "Panel";
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return "nc-icon nc-check-2 text-success";
      case "warning": return "nc-icon nc-alert-circle-i text-warning";
      case "error": return "nc-icon nc-simple-remove text-danger";
      default: return "nc-icon nc-bell-55 text-info";
    }
  };

  return (
      <Navbar bg="light" expand="lg">
        <Container fluid>
          {/* LEFT SIDE */}
          <div className="d-flex align-items-center">
            {/* Mobile Sidebar Toggle */}
            <Button
                variant="dark"
                className="d-lg-none btn-fill rounded-circle p-2 mr-2"
                onClick={mobileSidebarToggle}
            >
              <i className="fas fa-ellipsis-v"></i>
            </Button>

            {/* Page Title */}
            <Navbar.Brand
                href="#home"
                onClick={e => e.preventDefault()}
                className="mr-2"
            >
              {getBrandText()}
            </Navbar.Brand>
          </div>

          {/* MOBILE TOGGLE */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="mr-2">
            <span className="navbar-toggler-bar burger-lines"></span>
            <span className="navbar-toggler-bar burger-lines"></span>
            <span className="navbar-toggler-bar burger-lines"></span>
          </Navbar.Toggle>

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto" navbar></Nav>

            {/* RIGHT SIDE */}
            <Nav className="ml-auto" navbar>
              {/* CARGAS DROPDOWN */}
              {showCargasMenu && (
                <Dropdown as={Nav.Item}>
                  <Dropdown.Toggle
                      as={Nav.Link}
                      className="m-0"
                      id="navbar-cargas"
                  >
                    <i className="nc-icon nc-delivery-fast"></i>
                    <span className="no-icon">Cargas</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu-end">
                    <Dropdown.Item
                        onClick={() =>
                            navigate(
                                location.pathname.startsWith("/admin")
                                    ? "/admin/cargas"
                                    : "/maestro/cargas"
                            )}>
                      <i className="nc-icon nc-delivery-fast"></i> Cargas
                    </Dropdown.Item>
                    <Dropdown.Item
                        onClick={() =>
                            navigate(
                                location.pathname.startsWith("/admin")
                                    ? "/admin/cargas-masivas"
                                    : "/maestro/cargas-masivas"
                            )}>
                      <i className="nc-icon nc-layers"></i> Cargas Masivas
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}

              {/* USER */}
              <Nav.Item>
                <Nav.Link className="m-0">
                  <i className="nc-icon nc-single-02"></i>
                  <span className="no-icon">{[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Usuario"}</span>
                </Nav.Link>
              </Nav.Item>
              {/* 🔔 NOTIFICACIONES */}
              <Dropdown
                  as={Nav.Item}
                  onToggle={(open) => open && dispatch(markAllRead())}
              >
                <Dropdown.Toggle
                    as={Nav.Link}
                    className="position-relative m-0"
                    id="navbar-notifications"
                >
                  <i className="nc-icon nc-bell-55 fs-5"></i>

                  {unreadCount > 0 && (
                      <span
                          className="badge bg-danger position-absolute"
                          style={{
                            top: "0px",
                            right: "0px",
                            fontSize: "0.65rem",
                            borderRadius: "50%",
                            padding: "4px 6px",
                            animation: "notif-pop 0.3s ease",
                          }}
                      >
                    {unreadCount}
                  </span>
                  )}
                </Dropdown.Toggle>

                <Dropdown.Menu
                    className="dropdown-menu-end p-0 shadow-sm"
                    style={{ width: "320px" }}
                >
                  <div className="p-2 border-bottom fw-bold">Notificaciones</div>

                  {notifications.length === 0 && (
                      <div className="px-3 py-2 text-muted text-center">
                        No hay notificaciones
                      </div>
                  )}

                  {notifications.map((n) => (
                      <Dropdown.Item
                          key={n.id}
                          className="d-flex align-items-start gap-2 py-2"
                          style={{
                            background: n.read ? "white" : "rgba(0,0,0,0.05)",
                          }}
                      >
                        <i className={getIcon(n.type)}></i>

                        <div className="flex-grow-1">
                          <div className="fw-bold text-capitalize">{n.type}</div>
                          <div>{n.message}</div>
                          <small className="text-muted">
                            {new Date(n.timestamp).toLocaleTimeString()}
                          </small>
                        </div>
                      </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>

              {/* SETTINGS / LOGOUT */}
              <Dropdown as={Nav.Item}>
                <Dropdown.Toggle
                    as={Nav.Link}
                    className="m-0"
                    id="navbar-settings"
                >
                  <i className="nc-icon nc-settings-gear-65"></i>
                  <span className="no-icon">Configuración</span>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item
                      onClick={() =>
                          navigate(
                              location.pathname.startsWith("/admin")
                                  ? "/admin/perfil"
                                  : "/maestro/perfil"
                          )}>
                  <i className="nc-icon nc-single-02"></i> Perfil
                  </Dropdown.Item>

                  <div className="divider"></div>

                  <Dropdown.Item onClick={handleLogout}>
                    <i className="nc-icon nc-button-power"></i> Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
}

export default Header;

