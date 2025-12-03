import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { LatLngExpression, Icon } from "leaflet";
import { Card, Form, Spinner, Container, Button, ButtonGroup } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import io, { Socket } from "socket.io-client";
import "leaflet/dist/leaflet.css";
import { useAssignmentService, Assignment } from "../api/assignments";
import { useDriversService} from "../api/drivers";
import { Driver } from "../types/Driver";
import toast from "react-hot-toast";

const defaultIcon = new Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconAnchor: [12, 41],
});

// Icono para el driver
const driverIcon = new Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconAnchor: [12, 41],
  className: "driver-marker",
});


// Componente para actualizar el centro del mapa
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

type TrackingType = "driver" | "assignment";

const Maps: React.FC = () => {
  const defaultPosition: LatLngExpression = [40.748817, -73.985428];
  const { fetchAssignments } = useAssignmentService();
  const { fetchDrivers } = useDriversService();
  
  // Función para extraer última ubicación del assignment (similar a la app móvil)
  const extractLastLocation = (assignment: Assignment | undefined): { lat: number; lng: number } | null => {
    if (!assignment) return null;
    
    const lastLocation = assignment.last_location;
    if (!lastLocation || typeof lastLocation !== 'object') return null;
    
    if ('lat' in lastLocation && 'lng' in lastLocation) {
      const lat = typeof lastLocation.lat === 'number' ? lastLocation.lat : parseFloat(String(lastLocation.lat));
      const lng = typeof lastLocation.lng === 'number' ? lastLocation.lng : parseFloat(String(lastLocation.lng));
      
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    
    return null;
  };

  // Función para extraer última ubicación del driver
  const extractDriverLastLocation = (driver: Driver | undefined): { lat: number; lng: number } | null => {
    if (!driver) return null;
    
    const lastLocation = driver.last_location;
    if (!lastLocation || typeof lastLocation !== 'object') return null;
    
    if ('lat' in lastLocation && 'lng' in lastLocation) {
      const lat = typeof lastLocation.lat === 'number' ? lastLocation.lat : parseFloat(String(lastLocation.lat));
      const lng = typeof lastLocation.lng === 'number' ? lastLocation.lng : parseFloat(String(lastLocation.lng));
      
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    
    return null;
  };
  const { accessToken, user } = useSelector((state: RootState) => state.auth);
  const [trackingType, setTrackingType] = useState<TrackingType>("driver");
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.748817, -73.985428]);
  const socketRef = useRef<Socket | null>(null);
  const currentIdRef = useRef<string>("");
  const selectedIdRef = useRef<string>("");
  const trackingTypeRef = useRef<TrackingType>("driver");
  
  // Actualizar refs cuando cambian los valores
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);
  
  useEffect(() => {
    trackingTypeRef.current = trackingType;
  }, [trackingType]);

  // Debug: Log cuando cambia la ubicación
  useEffect(() => {
    if (location) {
      console.log("📍 Estado de ubicación actualizado:", location);
    } else {
      console.log("📍 Estado de ubicación limpiado (null)");
    }
  }, [location]);

  // Cargar drivers o asignaciones según el tipo seleccionado
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setSelectedId("");
        setLocation(null);
        
        if (trackingType === "driver") {
          const result = await fetchDrivers();
          setDrivers(result.active || []);
          setAssignments([]);
        } else {
          const result = await fetchAssignments();
          const activeAssignments = [
            ...(result.pendiente || []),
            ...(result.problema_reportado || []),
          ];
          setAssignments(activeAssignments);
          setDrivers([]);
          console.log("Asignaciones cargadas:", activeAssignments.length);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
        toast.error(`No se pudieron cargar los ${trackingType === "driver" ? "drivers" : "asignaciones"}`);
        if (trackingType === "driver") {
          setDrivers([]);
        } else {
          setAssignments([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingType]);

  // Cargar última ubicación cuando se selecciona un driver o asignación
  useEffect(() => {
    if (!selectedId) {
      // Limpiar ubicación cuando no hay selección
      setLocation(null);
      setMapCenter([40.748817, -73.985428]);
      return;
    }

    if (trackingType === "driver" && selectedId) {
      // Buscar el driver seleccionado en la lista
      const selectedDriver = drivers.find(d => d.id === selectedId);
      console.log("Driver seleccionado:", selectedDriver);
      const lastLocation = extractDriverLastLocation(selectedDriver);
      
      if (lastLocation) {
        console.log("✓ Última ubicación extraída del driver:", lastLocation);
        setLocation(lastLocation);
        setMapCenter([lastLocation.lat, lastLocation.lng]);
        console.log("✓ Estado de ubicación actualizado y mapa centrado");
      } else {
        console.log("⚠ No se encontró última ubicación en el driver - esperando actualización del socket");
        console.log("Driver completo:", selectedDriver);
        // Si no hay última ubicación, mantener la ubicación actual hasta que llegue del socket
        // No limpiar para evitar que desaparezca el marcador si ya había uno
      }
    } else if (trackingType === "assignment" && selectedId) {
      // Buscar el assignment seleccionado en la lista
      const selectedAssignment = assignments.find(a => a.id === selectedId);
      console.log("Assignment seleccionado:", selectedAssignment);
      const lastLocation = extractLastLocation(selectedAssignment);
      
      if (lastLocation) {
        console.log("Última ubicación extraída del assignment:", lastLocation);
        setLocation(lastLocation);
        setMapCenter([lastLocation.lat, lastLocation.lng]);
      } else {
        console.log("No se encontró última ubicación en el assignment - esperando actualización del socket");
        // Si no hay última ubicación, mantener la ubicación actual hasta que llegue del socket
        // No limpiar para evitar que desaparezca el marcador
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, trackingType, assignments, drivers]);

  // Asegurar que estamos en la sala correcta cuando cambia el trackingType
  useEffect(() => {
    if (!socketRef.current?.connected || !user?.company_id) {
      return;
    }

    if (trackingType === "driver") {
      socketRef.current.emit("join", { panel: "drivers", companyId: user.company_id });
      console.log(`✓ Cambiado a modo driver - Unido a la sala drivers:${user.company_id}`);
    }
  }, [trackingType, user?.company_id]);

  // Conectar socket una vez cuando hay company_id (similar a React Native - se mantiene conectado)
  useEffect(() => {
    if (!accessToken || !user?.company_id) {
      return;
    }

    // Si ya hay un socket conectado, no crear uno nuevo
    if (socketRef.current?.connected) {
      console.log("Socket ya está conectado, reutilizando conexión");
      return;
    }

    // Conectar socket
    const socket = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: {
        token: accessToken,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✓ Socket conectado exitosamente");
      
      // Unirse a la sala de drivers cuando estamos en modo driver
      if (trackingTypeRef.current === "driver") {
        socket.emit("join", { panel: "drivers", companyId: user.company_id });
        console.log(`✓ Unido a la sala drivers:${user.company_id}`);
      }
    });

    // Si el socket ya está conectado, unirse inmediatamente
    if (socket.connected && trackingType === "driver") {
      socket.emit("join", { panel: "drivers", companyId: user.company_id });
      console.log(`✓ Unido a la sala drivers:${user.company_id} (socket ya estaba conectado)`);
    }

    socket.on("connect_error", (error) => {
      console.error("Error conectando socket:", error);
      toast.error("Error conectando con el servidor en tiempo real");
    });

    // Cleanup: desconectar solo cuando el componente se desmonte
    return () => {
      if (socketRef.current) {
        if (user?.company_id) {
          socketRef.current.emit("leave", { panel: "drivers", companyId: user.company_id });
        }
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [accessToken, user?.company_id, trackingType]);

  // Escuchar eventos de drivers (similar a React Native - escucha TODOS los eventos)
  useEffect(() => {
    if (!socketRef.current) {
      console.log("⚠ Socket no disponible para escuchar eventos de driver");
      return;
    }

    if (!socketRef.current.connected) {
      console.log("⚠ Socket no conectado, esperando conexión...");
      return;
    }

    if (trackingType !== "driver") {
      console.log("⚠ No estamos en modo driver, no se escucharán eventos de driver");
      return;
    }

    console.log("✓ Configurando listener para eventos driver:update");

    // Asegurarse de estar en la sala de drivers
    if (user?.company_id) {
      socketRef.current.emit("join", { panel: "drivers", companyId: user.company_id });
      console.log(`✓ Asegurado unirse a la sala drivers:${user.company_id}`);
    }

    // Handler para actualizaciones de drivers - escucha TODOS los eventos (como React Native)
    const handleDriverUpdate = (payload: { driverId: string; lat: number; lng: number; updatedAt: number }) => {
      console.log("=== Actualización de driver recibida ===");
      console.log("Payload completo:", payload);
      
      // Convertir ambos IDs a string para comparación segura
      const payloadDriverId = String(payload.driverId);
      const currentSelectedId = String(selectedIdRef.current);
      
      console.log("Driver ID en payload:", payloadDriverId);
      console.log("Driver ID seleccionado:", currentSelectedId);
      
      // Solo actualizar si es el driver seleccionado
      if (payloadDriverId === currentSelectedId && currentSelectedId !== "") {
        console.log("✓ Coincidencia! Actualizando ubicación...");
        if (typeof payload.lat === "number" && typeof payload.lng === "number" && 
            !isNaN(payload.lat) && !isNaN(payload.lng)) {
          const newLocation = { lat: payload.lat, lng: payload.lng };
          console.log("✓ Estableciendo nueva ubicación:", newLocation);
          setLocation(newLocation);
          setMapCenter([payload.lat, payload.lng]);
          console.log("✓ Estado de ubicación y centro del mapa actualizados");
        } else {
          console.error("✗ Coordenadas inválidas:", payload.lat, payload.lng);
        }
      } else {
        console.log("✗ No coincide el driver ID o no hay selección, ignorando");
        console.log("  - Payload driverId:", payloadDriverId);
        console.log("  - Selected driverId:", currentSelectedId);
        console.log("  - Hay selección:", currentSelectedId !== "");
      }
    };

    socketRef.current.on("driver:update", handleDriverUpdate);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("driver:update", handleDriverUpdate);
      }
    };
  }, [trackingType, selectedId, user?.company_id]);

  // Manejar asignaciones por separado
  useEffect(() => {
    if (!selectedId || trackingType !== "assignment" || !socketRef.current) {
      return;
    }

    if (!socketRef.current.connected) {
      return;
    }

    // Unirse a la sala del assignment
    socketRef.current.emit("join-assignment", { assignmentId: selectedId });
    console.log(`Unido a la sala assignment:${selectedId}`);

    const assignmentHandler = (payload: { assignmentId: string; lat: number; lng: number; ts: number }) => {
      console.log("Actualización de assignment recibida:", payload);
      if (payload.assignmentId === selectedIdRef.current) {
        if (typeof payload.lat === "number" && typeof payload.lng === "number" && 
            !isNaN(payload.lat) && !isNaN(payload.lng)) {
          setLocation({ lat: payload.lat, lng: payload.lng });
          setMapCenter([payload.lat, payload.lng]);
        }
      }
    };

    socketRef.current.on("assignment:update", assignmentHandler);

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-assignment", { assignmentId: selectedId });
        socketRef.current.off("assignment:update", assignmentHandler);
      }
    };
  }, [selectedId, trackingType]);

  return (
    <Container fluid>
      <Card className="mb-3">
        <Card.Header>
          <Card.Title as="h4">Configuración</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <Form.Label className="mb-2 d-block">Tipo de Seguimiento</Form.Label>
            <ButtonGroup className="w-100">
              <Button
                variant={trackingType === "driver" ? "primary" : "outline-primary"}
                onClick={() => setTrackingType("driver")}
                className="flex-fill"
              >
                Driver
              </Button>
              <Button
                variant={trackingType === "assignment" ? "primary" : "outline-primary"}
                onClick={() => setTrackingType("assignment")}
                className="flex-fill"
              >
                Asignación (Ruta)
              </Button>
            </ButtonGroup>
          </div>
          
          <div className="mb-3">
            <Form.Label>
              {trackingType === "driver" ? "Drivers" : "Asignaciones"}
            </Form.Label>
            {loading ? (
              <div className="text-center p-2">
                <Spinner animation="border" size="sm" />
                <span className="ms-2">
                  Cargando {trackingType === "driver" ? "drivers" : "asignaciones"}...
                </span>
              </div>
            ) : (
              <Form.Select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={
                  (trackingType === "driver" && drivers.length === 0) ||
                  (trackingType === "assignment" && assignments.length === 0)
                }
              >
                <option value="">
                  {trackingType === "driver"
                    ? drivers.length === 0
                      ? "No hay drivers activos"
                      : "Seleccione un driver"
                    : assignments.length === 0
                    ? "No hay asignaciones activas"
                    : "Seleccione una asignación"}
                </option>
                {trackingType === "driver"
                  ? drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.member.first_name} {driver.member.last_name}
                        {driver.license_number ? ` (${driver.license_number})` : ""}
                      </option>
                    ))
                  : assignments.map((assignment) => (
                      <option key={assignment.id} value={assignment.id}>
                        Carga #{assignment.load.folio} - {assignment.load.origen}
                        {assignment.load.destino
                          ? ` → ${assignment.load.destino}`
                          : ""}
                        {assignment.driver
                          ? ` (${assignment.driver.member.first_name} ${assignment.driver.member.last_name})`
                          : ""}
                      </option>
                    ))}
              </Form.Select>
            )}
          </div>
        </Card.Body>
      </Card>

      <div className="map-container" style={{ height: "600px", width: "100%" }}>
        <MapContainer
          center={mapCenter}
          zoom={location ? 15 : 13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapUpdater center={mapCenter} />
          
          {/* Marcador de ubicación (solo muestra lo que viene del socket) */}
          {location && (
            <Marker position={[location.lat, location.lng]} icon={driverIcon}>
              <Popup>
                <div>
                  <h5>
                    {trackingType === "driver" ? "🚚 Ubicación del Driver" : "📍 Ubicación de la Asignación"}
                  </h5>
                  <p>
                    <strong>ID:</strong> {selectedId}
                  </p>
                  <p>
                    <strong>Coordenadas:</strong> {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                  <p>
                    <small style={{ color: '#4CAF50' }}>● Actualización en tiempo real</small>
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Marcador por defecto si no hay ubicación */}
          {!location && (
            <Marker position={defaultPosition as [number, number]} icon={defaultIcon}>
              <Popup>
                <h2>Mapa de Seguimiento</h2>
                <p>
                  Seleccione un {trackingType === "driver" ? "driver" : "asignación"} para ver la ubicación en tiempo real.
                </p>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </Container>
  );
};

export default Maps;
