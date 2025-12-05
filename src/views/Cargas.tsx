import React, { useEffect, useState } from "react";
import { Tabs, Tab, Card, Table, Spinner, Container, Button, Badge, ButtonGroup } from "react-bootstrap";
import { useLoadsService, type Load } from "../api/loads";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { canCreateLoads, canAcceptLoads } from "../utils/companyPermissions";
import AsignarChoferModal from "../components/Cargas/AsignarChoferModal";
import ResumenCargaModal from "../components/Cargas/ResumenCargaModal";
import CreateLoadModal from "../components/Cargas/CreateLoadModal";
import toast from "react-hot-toast";

const Cargas: React.FC = () => {
  const { fetchLoads, acceptLoad, rejectLoad } = useLoadsService();
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const currentUserRole = useSelector((s: RootState) => s.auth.user?.roles?.[0]?.name);
  
  // Validaciones basadas en tipo de empresa
  const userCanCreateLoads = canCreateLoads(currentUser);
  const userCanAcceptLoads = canAcceptLoads(currentUser);
  
  // Validación adicional de rol (solo Admin y Maestro pueden ver esta vista)
  const hasRolePermission = currentUserRole === "Admin" || currentUserRole === "Maestro";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendienteLoads, setPendienteLoads] = useState<Load[]>([]);
  const [activoLoads, setActivoLoads] = useState<Load[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResumenModal, setShowResumenModal] = useState(false);
  const [showAsignarChoferModal, setShowAsignarChoferModal] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);

  const loadLoads = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchLoads();
      
      // Normalizar los datos: mapear id a load_id si es necesario
      const normalizeLoad = (load: any): Load => ({
        ...load,
        load_id: load.load_id || load.id,
      });
      
      setPendienteLoads((result.pendiente || []).map(normalizeLoad));
      setActivoLoads((result.activo || []).map(normalizeLoad));
    } catch (err: any) {
      console.error("Error loading loads:", err);
      setError(err?.message || "No se pudieron obtener las cargas");
      // Inicializar arrays vacíos en caso de error
      setPendienteLoads([]);
      setActivoLoads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoads();
  }, []);

  const handleAccept = async (load: Load) => {
    if (!window.confirm(`¿Estás seguro de que deseas aceptar la carga #${load.folio}?`)) {
      return;
    }

    try {
      setLoading(true);
      const loadId = load.load_id || load.id;
      if (!loadId) {
        toast.error("No se pudo obtener el ID de la carga");
        return;
      }
      const response = await acceptLoad(loadId);
      toast.success("Carga aceptada exitosamente");
      
      // Después de aceptar, abrir modal de asignar chofer
      setSelectedLoad(load);
      setShowAsignarChoferModal(true);
      
      loadLoads();
    } catch (err: any) {
      toast.error(err?.message || "Error al aceptar la carga");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (load: Load) => {
    if (!window.confirm(`¿Estás seguro de que deseas rechazar la carga #${load.folio}?`)) {
      return;
    }

    try {
      setLoading(true);
      const loadId = load.load_id || load.id;
      if (!loadId) {
        toast.error("No se pudo obtener el ID de la carga");
        return;
      }
      await rejectLoad(loadId);
      toast.success("Carga rechazada exitosamente");
      loadLoads();
    } catch (err: any) {
      toast.error(err?.message || "Error al rechazar la carga");
    } finally {
      setLoading(false);
    }
  };

  const handleViewResumen = (load: Load) => {
    setSelectedLoad(load);
    setShowResumenModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendiente":
        return <Badge bg="warning">Pendiente</Badge>;
      case "aceptada":
        return <Badge bg="success">Aceptada</Badge>;
      case "cancelada":
        return <Badge bg="danger">Cancelada</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-MX");
    } catch {
      return dateString;
    }
  };

  const getLoadDestination = (load: Load) => {
    if (load.tipo_carga === "cliente" && load.nombre_cliente) {
      return load.nombre_cliente;
    }
    return load.destino || "Sin destino";
  };

  const renderTable = (list: Load[], tab: "pendiente" | "activo") => (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Folio</th>
          <th>Tipo</th>
          <th>Origen</th>
          <th>Destino</th>
          <th>Fecha Carga</th>
          <th>Estado</th>
          <th style={{ width: 300 }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {list.map((load) => {
          const loadId = load.load_id || load.id || "";
          return (
          <tr key={loadId}>
            <td>
              <strong>#{load.folio}</strong>
            </td>
            <td>{load.tipo_carga || "N/A"}</td>
            <td>{load.origen}</td>
            <td>{getLoadDestination(load)}</td>
            <td>{formatDate(load.fecha_carga)}</td>
            <td>{getStatusBadge(load.status)}</td>
            <td>
              <ButtonGroup size="sm">
                <Button variant="info" onClick={() => handleViewResumen(load)}>
                  Ver Detalles
                </Button>
                {/* Solo empresas TRANSPORTER/PROVIDER pueden aceptar/rechazar cargas pendientes que les fueron asignadas */}
                {tab === "pendiente" && 
                 userCanAcceptLoads && 
                 hasRolePermission && 
                 load.empresa_transportista_id === currentUser?.company_id && (
                  <>
                    <Button variant="success" onClick={() => handleAccept(load)}>
                      Aceptar
                    </Button>
                    <Button variant="danger" onClick={() => handleReject(load)}>
                      Rechazar
                    </Button>
                  </>
                )}
                {/* Solo empresas TRANSPORTER/PROVIDER pueden asignar choferes a cargas aceptadas */}
                {tab === "activo" && 
                 userCanAcceptLoads && 
                 hasRolePermission && 
                 load.empresa_transportista_id === currentUser?.company_id && (
                  <Button variant="primary" onClick={() => {
                    setSelectedLoad(load);
                    setShowAsignarChoferModal(true);
                  }}>
                    Asignar Chofer
                  </Button>
                )}
              </ButtonGroup>
            </td>
          </tr>
          );
        })}
      </tbody>
    </Table>
  );

  return (
    <Container fluid>
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <Card.Title as="h4">Cargas</Card.Title>
            {userCanCreateLoads && hasRolePermission && (
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                <i className="fas fa-plus"></i> Crear Carga
              </Button>
            )}
          </div>
        </Card.Header>

        <Card.Body>
          {loading && (
            <div className="text-center p-3">
              <Spinner animation="border" />
              <p className="mt-2">Cargando cargas...</p>
            </div>
          )}

          {error && <p className="text-danger text-center">{error}</p>}

          {!loading && !error && (
            <>
              {/* Mensaje informativo según tipo de empresa */}
              {userCanCreateLoads && (
                <div className="alert alert-info mb-3">
                  <i className="fas fa-info-circle"></i>{" "}
                  <strong>Empresa Vendedora:</strong> Puedes crear nuevas cargas y ver el estado de las cargas que has creado.
                </div>
              )}
              {userCanAcceptLoads && (
                <div className="alert alert-info mb-3">
                  <i className="fas fa-info-circle"></i>{" "}
                  <strong>Empresa Transportista:</strong> Puedes aceptar o rechazar cargas pendientes y asignar conductores a cargas aceptadas.
                </div>
              )}
              {!userCanCreateLoads && !userCanAcceptLoads && (
                <div className="alert alert-warning mb-3">
                  <i className="fas fa-exclamation-triangle"></i>{" "}
                  <strong>Sin permisos:</strong> Tu tipo de empresa no tiene permisos para gestionar cargas.
                </div>
              )}

              <Tabs defaultActiveKey="pendiente" id="loads-tabs" className="mb-3">
                <Tab eventKey="pendiente" title={`Pendientes (${pendienteLoads.length})`}>
                  {pendienteLoads.length === 0 ? (
                    <div className="text-center p-5">
                      <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                      <p className="text-muted">
                        {userCanAcceptLoads 
                          ? "No hay cargas pendientes para aceptar" 
                          : userCanCreateLoads
                          ? "No hay cargas pendientes creadas"
                          : "No hay cargas pendientes"}
                      </p>
                    </div>
                  ) : (
                    renderTable(pendienteLoads, "pendiente")
                  )}
                </Tab>

                <Tab eventKey="activo" title={`Aceptadas (${activoLoads.length})`}>
                  {activoLoads.length === 0 ? (
                    <div className="text-center p-5">
                      <i className="fas fa-check-circle fa-3x text-muted mb-3"></i>
                      <p className="text-muted">
                        {userCanAcceptLoads
                          ? "No hay cargas aceptadas. Acepta cargas pendientes para asignar conductores."
                          : userCanCreateLoads
                          ? "No hay cargas aceptadas por transportistas"
                          : "No hay cargas aceptadas"}
                      </p>
                    </div>
                  ) : (
                    renderTable(activoLoads, "activo")
                  )}
                </Tab>
              </Tabs>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modales */}
      <CreateLoadModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={loadLoads}
      />
      <ResumenCargaModal
        show={showResumenModal}
        onHide={() => {
          setShowResumenModal(false);
          setSelectedLoad(null);
        }}
        load={selectedLoad}
        onSuccess={loadLoads}
      />
      <AsignarChoferModal
        show={showAsignarChoferModal}
        onHide={() => {
          setShowAsignarChoferModal(false);
          setSelectedLoad(null);
        }}
        load={selectedLoad}
        onSuccess={loadLoads}
      />
    </Container>
  );
};

export default Cargas;

