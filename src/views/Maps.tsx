import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import { Icon } from "leaflet";
import {Card, Form, Spinner, Container, Button, ButtonGroup} from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import io, { Socket } from "socket.io-client";
import { useAssignmentService, Assignment } from "../api/assignments";
import { useDriversService } from "../api/drivers";
import { useUnitsService } from "../api/unit";
import { Driver } from "../types/Driver";
import { getCompanyType, isSellerCompany } from "../utils/companyPermissions";
import toast from "react-hot-toast";
import "leaflet/dist/leaflet.css";

/* -------------------------------------------------
   ICONO DEFAULT
-------------------------------------------------- */
const defaultIcon = new Icon({
  iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconAnchor: [12, 41]
});

/* -------------------------------------------------
   COMPONENTE PARA ACTUALIZAR EL MAPA SIN ERROR TS
-------------------------------------------------- */
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

type TrackingType = "driver" | "assignment";

/* -------------------------------------------------
   MAPS COMPONENT
-------------------------------------------------- */
const Maps: React.FC = () => {
  const fallbackCenter: [number, number] = [40.748817, -73.985428];

  const { fetchAssignments } = useAssignmentService();
  const { fetchDrivers } = useDriversService();
  const { fetchUnits } = useUnitsService();
  const { accessToken, user, loading: authLoading } = useSelector((state: RootState) => state.auth);

  const [trackingType, setTrackingType] = useState<TrackingType>("driver");
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
      null
  );
  const [mapCenter, setMapCenter] =
      useState<[number, number]>(fallbackCenter);
  const [hasDriversOrUnits, setHasDriversOrUnits] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const selectedIdRef = useRef<string>("");
  const hasCheckedRef = useRef(false);

  // Verificar si la empresa tiene drivers o unidades (solo una vez)
  useEffect(() => {
    if (hasCheckedRef.current || !user?.company_id || authLoading) return;

    const checkDriversAndUnits = async () => {
      hasCheckedRef.current = true;
      
      try {
        const [driversRes, unitsRes] = await Promise.all([
          fetchDrivers().catch(() => ({ active: [], inactive: [] })),
          fetchUnits().catch(() => ({ active: [], inactive: [] }))
        ]);

        const hasDrivers = (driversRes?.active?.length || 0) > 0;
        const hasUnits = (unitsRes?.active?.length || 0) > 0;
        const hasAny = hasDrivers || hasUnits;
        setHasDriversOrUnits(hasAny);
        
        // Si no tiene drivers/unidades y está en modo driver, cambiar a assignment
        if (!hasAny && trackingType === "driver") {
          setTrackingType("assignment");
        }
      } catch (error) {
        console.error("Error verificando drivers/unidades:", error);
        setHasDriversOrUnits(false);
        // Si hay error y está en modo driver, cambiar a assignment
        if (trackingType === "driver") {
          setTrackingType("assignment");
        }
      }
    };

    checkDriversAndUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.company_id, authLoading]);

  /* -------------------------------------------------
     EXTRAER LAST LOCATION
-------------------------------------------------- */
  const extractLocation = (obj: any): { lat: number; lng: number } | null => {
    if (!obj?.last_location) return null;
    const lat = Number(obj.last_location.lat);
    const lng = Number(obj.last_location.lng);
    return !isNaN(lat) && !isNaN(lng) ? { lat, lng } : null;
  };

  const getEffectiveLocation = (obj: any) => {
    if (!obj) return null;

    // Si está seleccionado → usar la ubicación realtime o BD
    if (selectedIdRef.current === obj.id) {
      return location ?? extractLocation(obj);
    }

    // Si NO está seleccionado → solo BD
    return extractLocation(obj);
  };

  /* -------------------------------------------------
     CARGAR DRIVERS O ASSIGNMENTS
-------------------------------------------------- */
  useEffect(() => {
    // Validar usuario antes de cargar
    if (authLoading || !user?.company_id) {
      return;
    }

    // Si no tiene drivers/unidades y está en modo driver, no cargar
    if (trackingType === "driver" && !hasDriversOrUnits) {
      setDrivers([]);
      setAssignments([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setSelectedId(""); // mostrar todos

      try {
        if (trackingType === "driver" && hasDriversOrUnits) {
          const res = await fetchDrivers();
          setDrivers(res.active ?? []);
          setAssignments([]);
        } else {
          const res = await fetchAssignments();
          
          // Si es SELLER, solo mostrar asignaciones abiertas (pendiente y problema_reportado)
          // Si es TRANSPORTER/PROVIDER, mostrar todas las asignaciones activas
          const companyType = getCompanyType(user);
          let actives: Assignment[] = [];
          
          if (companyType === "SELLER") {
            // Solo asignaciones abiertas para SELLER
            actives = [
              ...(res.pendiente ?? []),
              ...(res.problema_reportado ?? [])
            ];
          } else {
            // Para TRANSPORTER/PROVIDER, mostrar todas las activas
            actives = [
              ...(res.pendiente ?? []),
              ...(res.problema_reportado ?? [])
            ];
          }
          
          setAssignments(actives);
          setDrivers([]);
        }
      } catch {
        toast.error(
            `Error cargando ${trackingType === "driver" ? "drivers" : "asignaciones"}`
        );
      }

      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingType, user?.company_id, authLoading, hasDriversOrUnits]);

  /* -------------------------------------------------
     CARGAR UBICACIÓN INICIAL DESDE BD AL SELECCIONAR
-------------------------------------------------- */
  useEffect(() => {
    selectedIdRef.current = selectedId;

    if (!selectedId) {
      setLocation(null);
      return;
    }

    const obj =
        trackingType === "driver"
            ? drivers.find((d) => d.id === selectedId)
            : assignments.find((a) => a.id === selectedId);

    const last = extractLocation(obj);

    if (last) {
      setLocation(last);
      setMapCenter([last.lat, last.lng]);
    }
  }, [selectedId, trackingType, drivers, assignments]);

  /* -------------------------------------------------
     SOCKET: CONEXIÓN (TS SAFE CLEANUP)
-------------------------------------------------- */
  useEffect(() => {
    if (!accessToken || !user?.company_id || authLoading) return;

    const socket = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket"],
      auth: { token: accessToken }
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      if (trackingType === "driver" && hasDriversOrUnits) {
        socket.emit("join", {
          panel: "drivers",
          companyId: user.company_id
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, user?.company_id, authLoading, trackingType, hasDriversOrUnits]);

  /* -------------------------------------------------
     SOCKET: DRIVERS UPDATE
-------------------------------------------------- */
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || trackingType !== "driver") return;

    const handler = (data: { driverId: string; lat: number; lng: number }) => {
      if (data.driverId === selectedIdRef.current) {
        setLocation({ lat: data.lat, lng: data.lng });
        setMapCenter([data.lat, data.lng]);
      }
    };

    socket.on("driver:update", handler);

    return () => {
      socket.off("driver:update", handler);
    };
  }, [trackingType]);

  /* -------------------------------------------------
     SOCKET: ASSIGNMENTS UPDATE
-------------------------------------------------- */
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || trackingType !== "assignment") return;

    if (selectedId)
      socket.emit("join-assignment", { assignmentId: selectedId });

    const handler = (d: {
      assignmentId: string;
      lat: number;
      lng: number;
    }) => {
      if (d.assignmentId === selectedIdRef.current) {
        setLocation({ lat: d.lat, lng: d.lng });
        setMapCenter([d.lat, d.lng]);
      }
    };

    socket.on("assignment:update", handler);

    return () => {
      if (selectedId)
        socket.emit("leave-assignment", { assignmentId: selectedId });
      socket.off("assignment:update", handler);
    };
  }, [trackingType, selectedId]);

  /* -------------------------------------------------
     RENDER
-------------------------------------------------- */
  // Validar usuario antes de renderizar
  if (authLoading) {
    return (
      <Container fluid>
        <Card className="mb-3">
          <Card.Body className="text-center">
            <Spinner animation="border" />
            <p className="mt-2">Cargando información del usuario...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (!user?.company_id) {
    return (
      <Container fluid>
        <Card className="mb-3">
          <Card.Body className="text-center">
            <p>No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
      <Container fluid>
        <Card className="mb-3">
          <Card.Header>
            <Card.Title as="h4">Configuración</Card.Title>
          </Card.Header>

          <Card.Body>
            {/* MODO DE SEGUIMIENTO */}
            <div className="mb-3">
              <Form.Label>Tipo de Seguimiento</Form.Label>
              <ButtonGroup className="w-100">
                {hasDriversOrUnits && (
                  <Button
                      variant={trackingType === "driver" ? "primary" : "outline-primary"}
                      onClick={() => setTrackingType("driver")}
                  >
                    Drivers
                  </Button>
                )}
                <Button
                    variant={trackingType === "assignment" ? "primary" : "outline-primary"}
                    onClick={() => setTrackingType("assignment")}
                >
                  Asignaciones
                </Button>
              </ButtonGroup>
            </div>

            {/* SELECTOR */}
            <div className="mb-3">
              <Form.Label>
                {trackingType === "driver" ? "Drivers" : "Asignaciones"}
              </Form.Label>

              {loading ? (
                  <Spinner animation="border" size="sm" />
              ) : (
                  <Form.Select
                      value={selectedId}
                      onChange={(e) => setSelectedId(e.target.value)}
                  >
                    <option value="">Mostrar todos</option>

                    {trackingType === "driver"
                        ? drivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.member.first_name} {d.member.last_name}
                            </option>
                        ))
                        : assignments.map((a) => (
                            <option key={a.id} value={a.id}>
                              Carga #{a.load.folio} - {a.load.origen}
                            </option>
                        ))}
                  </Form.Select>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* MAPA */}
        <div style={{ height: "600px" }}>
          <MapContainer
              center={mapCenter}
              zoom={selectedId ? 15 : 10}
              style={{ height: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapUpdater center={mapCenter} />

            {/* -------------------------------------------------
                1) MOSTRAR TODOS (CON CLUSTER) SI NO HAY SELECCIÓN
          -------------------------------------------------- */}
            {!selectedId && (
                <MarkerClusterGroup chunkedLoading>
                  {trackingType === "driver" &&
                      drivers
                          .map((d) => ({ obj: d, loc: getEffectiveLocation(d) }))
                          .filter((x) => x.loc)
                          .map(({ obj, loc }) => (
                              <Marker
                                  key={obj.id}
                                  position={[loc!.lat, loc!.lng]}
                                  icon={defaultIcon}
                              >
                                <Popup>
                                  <strong>
                                    {obj.member.first_name} {obj.member.last_name}
                                  </strong>
                                  <br />
                                  {loc!.lat.toFixed(6)}, {loc!.lng.toFixed(6)}
                                </Popup>
                              </Marker>
                          ))}

                  {trackingType === "assignment" &&
                      assignments
                          .map((a) => ({ obj: a, loc: getEffectiveLocation(a) }))
                          .filter((x) => x.loc)
                          .map(({ obj, loc }) => (
                              <Marker
                                  key={obj.id}
                                  position={[loc!.lat, loc!.lng]}
                                  icon={defaultIcon}
                              >
                                <Popup>
                                  <strong>Carga #{obj.load.folio}</strong>
                                  <br />
                                  {loc!.lat.toFixed(6)}, {loc!.lng.toFixed(6)}
                                </Popup>
                              </Marker>
                          ))}
                </MarkerClusterGroup>
            )}

            {/* -------------------------------------------------
                2) MOSTRAR SOLO EL SELECCIONADO
          -------------------------------------------------- */}
            {selectedId && location && (
                <Marker position={[location.lat, location.lng]} icon={defaultIcon}>
                  <Popup>
                    <strong>
                      {trackingType === "driver" ? "Driver" : "Asignación"}
                    </strong>
                    <br />
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </Popup>
                </Marker>
            )}
          </MapContainer>
        </div>
      </Container>
  );
};

export default Maps;
