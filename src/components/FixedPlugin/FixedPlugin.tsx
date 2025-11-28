/* eslint-disable */
import React from "react";
import { Dropdown, Badge, Form } from "react-bootstrap";

import sideBarImage1 from "../../assets/img/sidebar-1.jpg";
import sideBarImage2 from "../../assets/img/sidebar-2.jpg";
import sideBarImage3 from "../../assets/img/sidebar-3.jpg";
import sideBarImage4 from "../../assets/img/sidebar-4.jpg";

interface FixedPluginProps {
  hasImage: boolean;
  setHasImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  color: string;
  setColor: (color: string) => void;
  image: string;
  setImage: (image: string) => void;
}

const FixedPlugin: React.FC<FixedPluginProps> = ({hasImage, setHasImage, color, setColor, image, setImage,}) => {
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
            {/* Toggle imagen de fondo */}
            <li className="adjustments-line d-flex align-items-center justify-content-between">
              <p>Background Image</p>
              <Form.Check
                  type="switch"
                  id="custom-switch-1-image"
                  checked={hasImage}
                  onChange={setHasImage}
              />
            </li>

            {/* Filtros */}
            <li className="adjustments-line mt-3">
              <p>Filters</p>
              <div className="pull-right">
                <Badge
                    bg="secondary"
                    className={color === "black" ? "active" : ""}
                    onClick={() => setColor("black")}
                />
                <Badge
                    bg="info"
                    className={color === "azure" ? "active" : ""}
                    onClick={() => setColor("azure")}
                />
                <Badge
                    bg="success"
                    className={color === "green" ? "active" : ""}
                    onClick={() => setColor("green")}
                />
                <Badge
                    bg="warning"
                    className={color === "orange" ? "active" : ""}
                    onClick={() => setColor("orange")}
                />
                <Badge
                    bg="danger"
                    className={color === "red" ? "active" : ""}
                    onClick={() => setColor("red")}
                />
                <Badge
                    bg="purple"
                    className={color === "purple" ? "active" : ""}
                    onClick={() => setColor("purple")}
                />
              </div>
              <div className="clearfix"></div>
            </li>

            {/* Sidebar Images */}
            <li className="header-title">Sidebar Images</li>

            {[sideBarImage1, sideBarImage2, sideBarImage3, sideBarImage4].map(
                (img, idx) => (
                    <li key={idx} className={image === img ? "active" : ""}>
                      <a
                          className="img-holder switch-trigger d-block"
                          href="#!"
                          onClick={(e) => {
                            e.preventDefault();
                            setImage(img);
                          }}
                      >
                        <img alt="sidebar" src={img} />
                      </a>
                    </li>
                )
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>
  );
};

export default FixedPlugin;

