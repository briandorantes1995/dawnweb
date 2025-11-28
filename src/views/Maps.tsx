import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression, Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = new Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconAnchor: [12, 41],
});

const Maps: React.FC = () => {
  const position: LatLngExpression = [40.748817, -73.985428];

  return (
    <div className="map-container" style={{ height: "600px", width: "100%" }}>
      <MapContainer
        center={position as [number, number]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position as [number, number]} icon={defaultIcon}>
          <Popup>
            <h2>Light Bootstrap Dashboard PRO React</h2>
            <p>Un admin premium usando React-Bootstrap, Bootstrap y React Hooks.</p>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Maps;
