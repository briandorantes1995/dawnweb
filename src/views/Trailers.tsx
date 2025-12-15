import React, { useEffect, useState, useMemo } from "react";
import { Tabs, Tab, Card, Spinner, Container, Button } from "react-bootstrap";
import { useTrailersService } from "../api/trailers";
import VehicleActions from "../components/Vehicles/VehicleActions";
import EditVehicleModal from "../components/Vehicles/EditVehicleModal";
import AssignDriverModal from "../components/Vehicles/AssignDriverModal";
import toast from "react-hot-toast";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Box, Chip } from '@mui/material';

const emptyTrailer = {
  type: "",
  plates: "",
  volume: "",
  box_number: "",
  color: "",
};

const TrailersTabs: React.FC = () => {
  const { fetchTrailers, editTrailer, createTrailer, changeStatus, assigndriver, unassigndriver } = useTrailersService();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeList, setActiveList] = useState<any[]>([]);
  const [inactiveList, setInactiveList] = useState<any[]>([]);
  const [assignedList, setAssignedList] = useState<any[]>([]);

  // Modales
  const [showEdit, setShowEdit] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [showAssign, setShowAssign] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const loadTrailers = async () => {
    try {
      setLoading(true);
      const result = await fetchTrailers();

      setActiveList(result.active);
      setInactiveList(result.inactive);
      setAssignedList(result.assigned);
    } catch (err) {
      console.error(err);
      setError("No se pudieron obtener los trailers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrailers();
  }, []);

  // Preparar datos para DataGrid
  const activeRows = useMemo(() => 
    activeList.map((t) => ({ id: t.id, ...t })), 
    [activeList]
  );

  const inactiveRows = useMemo(() => 
    inactiveList.map((t) => ({ id: t.id, ...t })), 
    [inactiveList]
  );

  const assignedRows = useMemo(() => 
    assignedList.map((t) => ({ id: t.id, ...t })), 
    [assignedList]
  );

  // Columnas para DataGrid
  const createColumns = (tab: "active" | "inactive" | "assigned"): GridColDef[] => [
    { 
      field: 'type', 
      headerName: 'Tipo', 
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'plates', 
      headerName: 'Placas', 
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'volume', 
      headerName: 'Volumen', 
      width: 130,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'box_number', 
      headerName: 'Número caja', 
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'color', 
      headerName: 'Color', 
      width: 130,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (_, row) => {
        if (tab === "assigned") return "Asignado";
        return row.status === "active" ? "Activo" : "Inactivo";
      },
      renderCell: (params) => {
        const status = params.value;
        const color = status === "Activo" ? "success" : status === "Asignado" ? "info" : "default";
        return <Chip label={status} color={color} size="small" />;
      }
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 300,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const trailer = params.row;
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <VehicleActions
              item={trailer}
              tab={tab}
              onEdit={() => {
                setEditingItem(trailer);
                setShowEdit(true);
              }}
              onActivate={async () => {
                await changeStatus(trailer.id, "active");
                toast.success("Trailer activado");
                loadTrailers();
              }}
              onDeactivate={async () => {
                await changeStatus(trailer.id, "inactive");
                toast.success("Trailer desactivado");
                loadTrailers();
              }}
              onAssignDriver={() => {
                setAssigningId(trailer.id);
                setShowAssign(true);
              }}
              onUnassignDriver={async () => {
                await unassigndriver({ trailer_id: trailer.id });
                toast.success("Driver removido");
                loadTrailers();
              }}
            />
          </Box>
        );
      },
    },
  ];

  return (
    <Container fluid>
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <Card.Title as="h4">Trailers</Card.Title>
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              Añadir Trailer/Caja
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          {loading && (
            <div className="text-center p-3">
              <Spinner animation="border" />
              <p className="mt-2">Cargando trailers...</p>
            </div>
          )}

          {error && <p className="text-danger text-center">{error}</p>}

          {!loading && !error && (
            <Tabs defaultActiveKey="active" id="trailers-tabs" className="mb-3">
              <Tab
                eventKey="active"
                title={`Activos (${activeList.length})`}
              >
                {activeList.length === 0 ? (
                  <div className="text-center p-5">
                    <p className="text-muted">No hay trailers activos</p>
                  </div>
                ) : (
                  <Paper sx={{ height: 600, minHeight: 600, width: '100%', mt: 2, display: 'flex', flexDirection: 'column' }}>
                    <DataGrid
                      rows={activeRows}
                      columns={createColumns("active")}
                      initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                      pageSizeOptions={[5, 10, 25, 50]}
                      sx={{ border: 0, flex: 1 }}
                      disableRowSelectionOnClick
                    />
                  </Paper>
                )}
              </Tab>

              <Tab
                eventKey="assigned"
                title={`Asignados (${assignedList.length})`}
              >
                {assignedList.length === 0 ? (
                  <div className="text-center p-5">
                    <p className="text-muted">No hay trailers asignados</p>
                  </div>
                ) : (
                  <Paper sx={{ height: 600, minHeight: 600, width: '100%', mt: 2, display: 'flex', flexDirection: 'column' }}>
                    <DataGrid
                      rows={assignedRows}
                      columns={createColumns("assigned")}
                      initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                      pageSizeOptions={[5, 10, 25, 50]}
                      sx={{ border: 0, flex: 1 }}
                      disableRowSelectionOnClick
                    />
                  </Paper>
                )}
              </Tab>

              <Tab
                eventKey="inactive"
                title={`Inactivos (${inactiveList.length})`}
              >
                {inactiveList.length === 0 ? (
                  <div className="text-center p-5">
                    <p className="text-muted">No hay trailers inactivos</p>
                  </div>
                ) : (
                  <Paper sx={{ height: 600, minHeight: 600, width: '100%', mt: 2, display: 'flex', flexDirection: 'column' }}>
                    <DataGrid
                      rows={inactiveRows}
                      columns={createColumns("inactive")}
                      initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                      pageSizeOptions={[5, 10, 25, 50]}
                      sx={{ border: 0, flex: 1 }}
                      disableRowSelectionOnClick
                    />
                  </Paper>
                )}
              </Tab>
            </Tabs>
          )}
        </Card.Body>
      </Card>

      {/* Modal Editar */}
      {editingItem && (
        <EditVehicleModal
          show={showEdit}
          onHide={() => setShowEdit(false)}
          action="Editar"
          type="trailer"
          initial={editingItem}
          onSubmit={async (form) => {
            await editTrailer(editingItem.id, form);
            toast.success("Trailer actualizado");
            setShowEdit(false);
            loadTrailers();
          }}
        />
      )}

      {/* Modal Crear */}
      <EditVehicleModal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        action="Crear"
        type="trailer"
        initial={emptyTrailer}
        onSubmit={async (form) => {
          await createTrailer(form);
          toast.success("Trailer creado");
          setShowCreate(false);
          loadTrailers();
        }}
      />

      {/* Modal Asignar Driver */}
      <AssignDriverModal
        show={showAssign}
        onHide={() => setShowAssign(false)}
        onSubmit={async (driverId) => {
          await assigndriver({
            trailer_id: assigningId!,
            driver_id: driverId,
          });
          toast.success("Driver asignado");
          setShowAssign(false);
          loadTrailers();
        }}
      />
    </Container>
  );
};

export default TrailersTabs;
