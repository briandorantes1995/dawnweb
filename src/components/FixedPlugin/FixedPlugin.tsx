/* eslint-disable */
import React from "react";
import { Dropdown, Badge, Form } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import {toggleMuteNotifications, setSidebarColor, setSidebarImage, setSidebarHasImage} from "../../store/slices/uiSlice";

const sidebarImages = Object.values(
    import.meta.glob("../../assets/img/background-images/*.{jpg,jpeg,png,webp,gif}", {eager: true})
).map((mod: any) => mod.default);

const FixedPlugin: React.FC = () => {
  const dispatch = useDispatch();

  const {
    sidebarHasImage,
    sidebarColor,
    sidebarImage,
    muteNotifications
  } = useSelector((s: RootState) => s.ui);

  return (
      <div className="fixed-plugin">
        <Dropdown>
          <Dropdown.Toggle
              id="dropdown-fixed-plugin"
              variant=""
              className="text-white border-0 opacity-100"
          >
            <i className="fas fa-cogs fa-2x mt-1"></i>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {/* Toggle Imagen */}
            <li className="adjustments-line d-flex align-items-center justify-content-between">
              <p>Background Image</p>
              <Form.Check
                  type="switch"
                  checked={sidebarHasImage}
                  onChange={(e) => dispatch(setSidebarHasImage(e.target.checked))}
              />
            </li>

            {/* Silenciar notificaciones */}
            <li className="adjustments-line d-flex align-items-center justify-content-between">
              <p>Silenciar notificaciones</p>
              <Form.Check
                  type="switch"
                  checked={muteNotifications}
                  onChange={() => dispatch(toggleMuteNotifications())}
              />
            </li>

            {/* Colores */}
            <li className="adjustments-line mt-3">
              <p>Filters</p>
              <div className="pull-right">
                {[
                  { key: "black", bg: "secondary" },
                  { key: "azure", bg: "info" },
                  { key: "green", bg: "success" },
                  { key: "orange", bg: "warning" },
                  { key: "red", bg: "danger" },
                  { key: "purple", bg: "purple" },
                ].map((c) => (
                    <Badge
                        key={c.key}
                        bg={c.bg as any}
                        className={sidebarColor === c.key ? "active" : ""}
                        onClick={() => dispatch(setSidebarColor(c.key))}
                        style={{ cursor: "pointer" }}
                    />
                ))}
              </div>
              <div className="clearfix"></div>
            </li>

            {/* Imágenes Sidebar dinámicas */}
            <li className="header-title">Sidebar Images</li>

            {sidebarImages.map((img, idx) => (
                <li
                    key={idx}
                    className={sidebarImage === img ? "active" : ""}
                    style={{ cursor: "pointer" }}
                >
                  <a
                      className="img-holder switch-trigger d-block"
                      href="#!"
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(setSidebarImage(img));
                      }}
                  >
                    <img alt="sidebar" src={img} />
                  </a>
                </li>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
  );
};

export default FixedPlugin;





