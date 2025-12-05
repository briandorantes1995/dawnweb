import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner, Card, Badge, Row, Col } from "react-bootstrap";
import { useAssignmentService } from "../../api/assignments";
import { type Load } from "../../api/loads";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { canCreateLoads, canAcceptLoads } from "../../utils/companyPermissions";
import AsignarChoferModal from "./AsignarChoferModal";
import toast from "react-hot-toast";
import "./ResumenCargaModal.css";

interface Props {
  show: boolean;
  onHide: () => void;
  load: Load | null;
  onSuccess?: () => void;
}

// Funciones helper
const getStatusInfo = (status: string): { text: string; color: string } => {
  switch (status) {
    case "pendiente":
      return { text: "Pendiente", color: "#FFA500" };
    case "aceptada":
      return { text: "Aceptada", color: "#1877f2" };
    case "cancelada":
      return { text: "Cancelada", color: "#E74C3C" };
    default:
      return { text: status, color: "#B0B3B8" };
  }
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Sin fecha";
  
  if (dateString.includes("/")) {
    return dateString;
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatDateTime = (
  dateString: string | null | undefined,
  timeString: string | null | undefined
): string => {
  if (!dateString && !timeString) return "Sin fecha/hora";
  
  const datePart = dateString ? formatDate(dateString) : "";
  const timePart = timeString ? timeString.trim() : "";
  
  if (datePart && timePart) {
    return `${datePart} ${timePart}`;
  } else if (datePart) {
    return `${datePart}${timePart ? ` ${timePart}` : " (Sin hora)"}`;
  } else if (timePart) {
    return timePart;
  }
  
  return "Sin fecha/hora";
};

const getLinkDisplayValue = (linkData: any): string => {
  if (!linkData) return "";
  
  if (typeof linkData === "string") {
    return linkData;
  }
  
  if (typeof linkData === "object") {
    if (typeof linkData.link === "string" && linkData.link.trim().length > 0) {
      return linkData.link;
    }
    
    const lat = linkData.lat ?? null;
    const lng = linkData.lng ?? null;
    
    if (lat != null && lng != null) {
      return `https://www.google.com/maps?q=${lat},${lng}`;
    }
  }
  
  return "";
};

const getLoadDestination = (load: Load) => {
  if (load.tipo_carga === "cliente" && load.nombre_cliente) {
    return load.nombre_cliente;
  }
  return load.destino || "Sin destino";
};

const ResumenCargaModal: React.FC<Props> = ({ show, onHide, load, onSuccess }) => {
  const { fetchAssignmentByLoadId } = useAssignmentService();
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const currentUserRole = useSelector((s: RootState) => s.auth.user?.roles?.[0]?.name);
  
  const userCanCreateLoads = canCreateLoads(currentUser);
  const userCanAcceptLoads = canAcceptLoads(currentUser);
  const hasRolePermission = currentUserRole === "Admin" || currentUserRole === "Maestro";

  const [assignment, setAssignment] = useState<any | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  const [showAsignarChoferModal, setShowAsignarChoferModal] = useState(false);

  useEffect(() => {
    if (show && load) {
      loadAssignment();
    } else {
      setAssignment(null);
    }
  }, [show, load]);

  const loadAssignment = async () => {
    if (!load?.load_id || !userCanAcceptLoads || load.status !== "aceptada") {
      return;
    }

    const loadId = load.load_id || load.id;
    if (!loadId) return;

    try {
      setLoadingAssignment(true);
      const assignmentData = await fetchAssignmentByLoadId(loadId);
      if (assignmentData) {
        setAssignment(assignmentData);
      }
    } catch (error) {
      console.error("Error loading assignment:", error);
    } finally {
      setLoadingAssignment(false);
    }
  };

  const handleAssignDriver = () => {
    if (!load) return;
    setShowAsignarChoferModal(true);
  };

  const handleEdit = () => {
    // TODO: Implementar modal de edición
    toast.info("Funcionalidad de edición próximamente");
  };

  if (!load) {
    return null;
  }

  const statusInfo = getStatusInfo(load.status);
  const clienteLink = getLinkDisplayValue(load.link_ubicacion_cliente || null);

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        size="lg"
        centered
        dialogClassName="resumen-carga-modal-dialog"
        onEntered={() => {
          const modalDialog = document.querySelector(".resumen-carga-modal-dialog") as HTMLElement;
          if (modalDialog) {
            modalDialog.style.setProperty("transform", "none", "important");
            modalDialog.style.setProperty("-webkit-transform", "none", "important");
            modalDialog.style.setProperty("-o-transform", "none", "important");
            modalDialog.style.setProperty("margin-top", "15px", "important");
          }
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Resumen de Carga</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {/* Header Card */}
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <i className="fas fa-truck fa-2x text-primary me-3"></i>
                  <div>
                    <div className="text-muted small">Folio</div>
                    <h5 className="mb-0">#{load.folio}</h5>
                  </div>
                </div>
                <Badge
                  bg=""
                  style={{
                    backgroundColor: statusInfo.color,
                    color: "white",
                    padding: "8px 16px",
                    fontSize: "14px",
                  }}
                >
                  {statusInfo.text}
                </Badge>
              </div>
            </Card.Body>
          </Card>

          {/* Información Básica */}
          <Card className="mb-3">
            <Card.Header>
              <strong>Información Básica</strong>
            </Card.Header>
            <Card.Body>
              <Row className="mb-2">
                <Col xs={12} sm={4} className="text-muted">
                  <i className="fas fa-tag me-2"></i>Tipo de Carga
                </Col>
                <Col xs={12} sm={8}>
                  {load.tipo_carga === "cliente"
                    ? "Cliente"
                    : load.tipo_carga === "viaje_propio"
                    ? "Viaje Propio"
                    : load.tipo_carga || "Sin especificar"}
                </Col>
              </Row>

              {load.tipo_transporte && (
                <Row className="mb-2">
                  <Col xs={12} sm={4} className="text-muted">
                    <i className="fas fa-truck me-2"></i>Tipo de Transporte
                  </Col>
                  <Col xs={12} sm={8}>
                    {load.tipo_transporte === "unidades_propias"
                      ? "Unidades Propias"
                      : load.tipo_transporte === "empresa_transport"
                      ? "Empresa Transport"
                      : load.tipo_transporte}
                  </Col>
                </Row>
              )}

              {load.descripcion && (
                <Row>
                  <Col xs={12} sm={4} className="text-muted">
                    <i className="fas fa-file-alt me-2"></i>Descripción
                  </Col>
                  <Col xs={12} sm={8}>{load.descripcion}</Col>
                </Row>
              )}
            </Card.Body>
          </Card>

          {/* Ubicaciones */}
          <Card className="mb-3">
            <Card.Header>
              <strong>Ubicaciones</strong>
            </Card.Header>
            <Card.Body>
              <Row className="mb-2">
                <Col xs={12} sm={4} className="text-muted">
                  <i className="fas fa-map-marker-alt me-2"></i>Origen
                </Col>
                <Col xs={12} sm={8}>{load.origen || "Sin origen"}</Col>
              </Row>

              <Row className="mb-2">
                <Col xs={12} sm={4} className="text-muted">
                  <i className="fas fa-map-marker-alt me-2"></i>Destino
                </Col>
                <Col xs={12} sm={8}>{getLoadDestination(load)}</Col>
              </Row>

              {clienteLink !== "" && (
                <Row>
                  <Col xs={12} sm={4} className="text-muted">
                    <i className="fas fa-link me-2"></i>Ubicación Cliente
                  </Col>
                  <Col xs={12} sm={8}>
                    <a href={clienteLink} target="_blank" rel="noopener noreferrer" className="text-primary">
                      {clienteLink.length > 50 ? `${clienteLink.substring(0, 50)}...` : clienteLink}
                    </a>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>

          {/* Fechas y Horas */}
          <Card className="mb-3">
            <Card.Header>
              <strong>Fechas y Horas</strong>
            </Card.Header>
            <Card.Body>
              <Row className="mb-2">
                <Col xs={12} sm={4} className="text-muted">
                  <i className="fas fa-calendar me-2"></i>Fecha y Hora de Carga
                </Col>
                <Col xs={12} sm={8}>
                  {formatDateTime(load.fecha_carga, load.hora_carga)}
                </Col>
              </Row>

              <Row>
                <Col xs={12} sm={4} className="text-muted">
                  <i className="fas fa-calendar-check me-2"></i>Fecha y Hora de Entrega
                </Col>
                <Col xs={12} sm={8}>
                  {formatDateTime(load.fecha_entrega, load.hora_entrega)}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Detalles Adicionales */}
          {(load.peso || load.volumen) && (
            <Card className="mb-3">
              <Card.Header>
                <strong>Detalles Adicionales</strong>
              </Card.Header>
              <Card.Body>
                {load.peso && (
                  <Row className="mb-2">
                    <Col xs={12} sm={4} className="text-muted">
                      <i className="fas fa-weight me-2"></i>Peso
                    </Col>
                    <Col xs={12} sm={8}>{load.peso}</Col>
                  </Row>
                )}

                {load.volumen && (
                  <Row>
                    <Col xs={12} sm={4} className="text-muted">
                      <i className="fas fa-cube me-2"></i>Volumen
                    </Col>
                    <Col xs={12} sm={8}>{load.volumen}</Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Contactos */}
          {(load.contacto_origen || load.contacto_destino) && (
            <Card className="mb-3">
              <Card.Header>
                <strong>Contactos</strong>
              </Card.Header>
              <Card.Body>
                {load.contacto_origen && (
                  <Row className="mb-2">
                    <Col xs={12} sm={4} className="text-muted">
                      <i className="fas fa-phone me-2"></i>Contacto Origen
                    </Col>
                    <Col xs={12} sm={8}>{load.contacto_origen}</Col>
                  </Row>
                )}

                {load.contacto_destino && (
                  <Row>
                    <Col xs={12} sm={4} className="text-muted">
                      <i className="fas fa-phone me-2"></i>Contacto Destino
                    </Col>
                    <Col xs={12} sm={8}>{load.contacto_destino}</Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Observaciones */}
          {load.observaciones && (
            <Card className="mb-3">
              <Card.Header>
                <strong>Observaciones</strong>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">{load.observaciones}</p>
              </Card.Body>
            </Card>
          )}

          {/* Información del Sistema */}
          <Card className="mb-3">
            <Card.Header>
              <strong>Información del Sistema</strong>
            </Card.Header>
            <Card.Body>
              {load.created_by_name && (
                <Row className="mb-2">
                  <Col xs={12} sm={4} className="text-muted">
                    <i className="fas fa-user me-2"></i>Creado por
                  </Col>
                  <Col xs={12} sm={8}>{load.created_by_name}</Col>
                </Row>
              )}

              {load.created_at && (
                <Row>
                  <Col xs={12} sm={4} className="text-muted">
                    <i className="fas fa-clock me-2"></i>Fecha de Creación
                  </Col>
                  <Col xs={12} sm={8}>{formatDate(load.created_at)}</Col>
                </Row>
              )}
            </Card.Body>
          </Card>

          {/* Botones de Acción */}
          <div className="d-grid gap-2">
            {/* Botón de Asignar Chofer (solo para TRANSPORTER si no tiene driver asignado) */}
            {userCanAcceptLoads &&
              hasRolePermission &&
              load.status === "aceptada" &&
              assignment &&
              !assignment.driver_id && (
                <Button
                  variant="primary"
                  onClick={handleAssignDriver}
                  disabled={loadingAssignment}
                >
                  <i className="fas fa-user-plus me-2"></i>
                  {loadingAssignment ? "Cargando..." : "Asignar Chofer"}
                </Button>
              )}

            {/* Botón de Editar Chofer (solo para TRANSPORTER si ya tiene driver asignado) */}
            {userCanAcceptLoads &&
              hasRolePermission &&
              load.status === "aceptada" &&
              assignment &&
              assignment.driver_id && (
                <Button
                  variant="primary"
                  onClick={handleAssignDriver}
                  disabled={loadingAssignment}
                >
                  <i className="fas fa-edit me-2"></i>
                  {loadingAssignment ? "Cargando..." : "Editar Chofer"}
                </Button>
              )}

            {/* Botón de Editar Carga */}
            {userCanCreateLoads && hasRolePermission && (
              <Button variant="secondary" onClick={handleEdit}>
                <i className="fas fa-edit me-2"></i>Editar Carga
              </Button>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Asignar Chofer */}
      <AsignarChoferModal
        show={showAsignarChoferModal}
        onHide={() => {
          setShowAsignarChoferModal(false);
        }}
        load={load}
        onSuccess={() => {
          loadAssignment();
          if (onSuccess) onSuccess();
        }}
      />
    </>
  );
};

export default ResumenCargaModal;

