import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner, Card, Badge } from "react-bootstrap";
import { useLoadsService } from "../../api/loads";
import { useAssignmentService } from "../../api/assignments";
import { type Load } from "../../api/loads";
import toast from "react-hot-toast";
import "./AsignarChoferModal.css";

interface Props {
  show: boolean;
  onHide: () => void;
  load: Load | null;
  onSuccess: () => void;
}

type Driver = {
  id: string;
  license_number?: string;
  license_type?: string;
  distance?: number;
  member?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
  default_unit?: {
    plates?: string;
    unit_identifier?: string;
    type?: string;
  };
  default_trailer?: {
    plates?: string;
    box_number?: string;
    type?: string;
  };
};

// Funciones helper para formatear datos del conductor
const getDriverName = (driver: Driver): string => {
  if (driver.member?.first_name || driver.member?.last_name) {
    return `${driver.member.first_name || ""} ${driver.member.last_name || ""}`.trim();
  }
  return driver.member?.email || "Conductor sin nombre";
};

const getDriverVehicle = (driver: Driver): string => {
  if (driver.default_unit) {
    return (
      driver.default_unit.plates ||
      driver.default_unit.unit_identifier ||
      driver.default_unit.type ||
      "Sin vehículo"
    );
  }
  return "Sin vehículo asignado";
};

const getDriverTrailer = (driver: Driver): string | null => {
  if (driver.default_trailer) {
    return (
      driver.default_trailer.plates ||
      driver.default_trailer.box_number ||
      driver.default_trailer.type ||
      "Sin caja"
    );
  }
  return null;
};

const formatDistance = (distance?: number): string | null => {
  if (distance === undefined || distance === null) return null;
  
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  
  return `${distance.toFixed(1)} km`;
};

const getLoadDestination = (load: Load) => {
  if (load.tipo_carga === "cliente" && load.nombre_cliente) {
    return load.nombre_cliente;
  }
  return load.destino || "Sin destino";
};

const AsignarChoferModal: React.FC<Props> = ({ show, onHide, load, onSuccess }) => {
  const { fetchAvailableDrivers } = useLoadsService();
  const { fetchAssignmentByLoadId, assignDriver } = useAssignmentService();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    if (show && load) {
      loadDrivers();
      loadAssignment();
    } else {
      // Reset al cerrar
      setDrivers([]);
      setAssignmentId(null);
      setAssigning(null);
    }
  }, [show, load]);

  const loadDrivers = async () => {
    if (!load) return;

    const loadId = load.load_id || load.id;
    if (!loadId) {
      toast.error("No se pudo obtener el ID de la carga");
      return;
    }

    try {
      setLoading(true);
      const response = await fetchAvailableDrivers(loadId);
      setDrivers(response?.available || []);
    } catch (err: any) {
      console.error("Error loading drivers:", err);
      toast.error(err?.message || "No se pudieron cargar los conductores disponibles");
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignment = async () => {
    if (!load) return;

    const loadId = load.load_id || load.id;
    if (!loadId) return;

    try {
      const assignment = await fetchAssignmentByLoadId(loadId);
      if (assignment) {
        setAssignmentId(assignment.id);
      }
    } catch (err) {
      console.error("Error loading assignment:", err);
      // No mostrar error, puede que aún no exista la asignación
    }
  };

  const handleAssignDriver = async (driverId: string) => {
    if (!load) return;

    const loadId = load.load_id || load.id;
    if (!loadId) {
      toast.error("No se pudo obtener el ID de la carga");
      return;
    }

    // Obtener assignmentId si no lo tenemos
    let currentAssignmentId = assignmentId;
    if (!currentAssignmentId) {
      try {
        const assignment = await fetchAssignmentByLoadId(loadId);
        if (!assignment) {
          toast.error(
            "No se encontró la asignación para esta carga. Asegúrate de que la carga haya sido aceptada primero."
          );
          return;
        }
        currentAssignmentId = assignment.id;
        setAssignmentId(currentAssignmentId);
      } catch (err: any) {
        toast.error("No se pudo obtener la asignación. Intenta nuevamente.");
        return;
      }
    }

    if (!currentAssignmentId) {
      toast.error("No se pudo obtener el ID de la asignación.");
      return;
    }

    if (!window.confirm("¿Estás seguro de que deseas asignar este conductor a la carga?")) {
      return;
    }

    try {
      setAssigning(driverId);
      await assignDriver(currentAssignmentId, driverId);
      toast.success("Conductor asignado correctamente");
      onSuccess();
      onHide();
    } catch (err: any) {
      toast.error(err?.message || "No se pudo asignar el conductor. Intenta nuevamente.");
    } finally {
      setAssigning(null);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      dialogClassName="assign-chofer-modal-dialog"
      onEntered={() => {
        const modalDialog = document.querySelector(".assign-chofer-modal-dialog") as HTMLElement;
        if (modalDialog) {
          modalDialog.style.setProperty("transform", "none", "important");
          modalDialog.style.setProperty("-webkit-transform", "none", "important");
          modalDialog.style.setProperty("-o-transform", "none", "important");
          modalDialog.style.setProperty("margin-top", "15px", "important");
        }
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>Asignar Conductor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {load && (
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center">
                <i className="fas fa-truck me-3 text-primary" style={{ fontSize: "24px" }}></i>
                <div>
                  <strong>Carga #{load.folio}</strong>
                  <div className="text-muted small">
                    {load.origen} → {getLoadDestination(load)}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {loading ? (
          <div className="text-center p-3">
            <Spinner animation="border" />
            <p className="mt-2">Cargando conductores disponibles...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="text-center p-5">
            <i className="fas fa-user-slash fa-3x text-muted mb-3"></i>
            <p className="text-muted">No hay conductores disponibles</p>
            <p className="text-muted small">
              No hay conductores activos y disponibles para esta carga en este momento.
            </p>
          </div>
        ) : (
          <>
            <h6 className="mb-3">Conductores Disponibles ({drivers.length})</h6>
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {drivers.map((driver) => {
                const isAssigning = assigning === driver.id;
                const distance = formatDistance(driver.distance);
                const hasDistance = distance !== null;

                return (
                  <Card key={driver.id} className="mb-3">
                    <Card.Body>
                      <div className="d-flex align-items-start justify-content-between mb-2">
                        <div className="d-flex align-items-center flex-grow-1">
                          <div
                            className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-3"
                            style={{ width: "48px", height: "48px" }}
                          >
                            <i className="fas fa-user text-primary"></i>
                          </div>
                          <div className="flex-grow-1">
                            <strong>{getDriverName(driver)}</strong>
                            {driver.license_number && (
                              <div className="text-muted small">
                                Licencia: {driver.license_number}
                                {driver.license_type ? ` (${driver.license_type})` : ""}
                              </div>
                            )}
                          </div>
                        </div>
                        {hasDistance && (
                          <Badge bg="info" className="ms-2">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {distance}
                          </Badge>
                        )}
                      </div>

                      <div className="mb-2">
                        <div className="d-flex align-items-center mb-1">
                          <i className="fas fa-truck text-primary me-2" style={{ fontSize: "14px" }}></i>
                          <span className="small">{getDriverVehicle(driver)}</span>
                        </div>
                        {getDriverTrailer(driver) && (
                          <div className="d-flex align-items-center">
                            <i className="fas fa-box text-primary me-2" style={{ fontSize: "14px" }}></i>
                            <span className="small">{getDriverTrailer(driver)}</span>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAssignDriver(driver.id)}
                        disabled={isAssigning}
                        className="w-100"
                      >
                        {isAssigning ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Asignando...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check me-2"></i>
                            Asignar
                          </>
                        )}
                      </Button>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AsignarChoferModal;

