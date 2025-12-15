import React, { useEffect, useState, useMemo } from "react";
import { Tabs, Tab, Card, Spinner, Container, Button } from "react-bootstrap";
import { useUnitsService } from "../api/unit";
import VehicleActions from "../components/Vehicles/VehicleActions";
import EditVehicleModal from "../components/Vehicles/EditVehicleModal";
import AssignDriverModal from "../components/Vehicles/AssignDriverModal";
import toast from "react-hot-toast";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Box, Chip } from '@mui/material';

const emptyUnit = {
  type: "",
  plates: "",
  tonnage: "",
};

const UnitsTabs: React.FC = () => {
  const { fetchUnits, editUnit, changeStatus, assigndriver, unassigndriver, createUnit } = useUnitsService();
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

  const loadUnits = async () => {
    try {
      setLoading(true);
      const result = await fetchUnits();

      setActiveList(result.active);
      setInactiveList(result.inactive);
      setAssignedList(result.assigned);
    } catch (err) {
      console.error(err);
      setError("No se pudieron obtener las unidades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  // Preparar datos para DataGrid
  const activeRows = useMemo(() => 
    activeList.map((u) => ({ id: u.id, ...u })), 
    [activeList]
  );

  const inactiveRows = useMemo(() => 
    inactiveList.map((u) => ({ id: u.id, ...u })), 
    [inactiveList]
  );

  const assignedRows = useMemo(() => 
    assignedList.map((u) => ({ id: u.id, ...u })), 
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
      field: 'unit_identifier', 
      headerName: 'T. Identificador', 
      width: 180,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'tonnage', 
      headerName: 'Tonelaje', 
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
        if (tab === "assigned") return "Asignada";
        return row.status === "active" ? "Activa" : "Inactiva";
      },
      renderCell: (params) => {
        const status = params.value;
        const color = status === "Activa" ? "success" : status === "Asignada" ? "info" : "default";
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
        const unit = params.row;
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <VehicleActions
              item={unit}
              tab={tab}
              onEdit={() => {
                setEditingItem(unit);
                setShowEdit(true);
              }}
              onActivate={async () => {
                await changeStatus(unit.id, "active");
                toast.success("Unidad activada");
                loadUnits();
              }}
              onDeactivate={async () => {
                await changeStatus(unit.id, "inactive");
                toast.success("Unidad desactivada");
                loadUnits();
              }}
              onAssignDriver={() => {
                setAssigningId(unit.id);
                setShowAssign(true);
              }}
              onUnassignDriver={async () => {
                await unassigndriver({ trailer_id: unit.id });
                toast.success("Driver removido");
                loadUnits();
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
            <Card.Title as="h4">Unidades</Card.Title>
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              Crear unidad
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          {loading && (
            <div className="text-center p-3">
              <Spinner animation="border" />
              <p className="mt-2">Cargando unidades...</p>
            </div>
          )}

          {error && <p className="text-danger text-center">{error}</p>}

          {!loading && !error && (
            <Tabs defaultActiveKey="active" id="units-tabs" className="mb-3">
              <Tab
                eventKey="active"
                title={`Activas (${activeList.length})`}
              >
                {activeList.length === 0 ? (
                  <div className="text-center p-5">
                    <p className="text-muted">No hay unidades activas</p>
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
                title={`Asignadas (${assignedList.length})`}
              >
                {assignedList.length === 0 ? (
                  <div className="text-center p-5">
                    <p className="text-muted">No hay unidades asignadas</p>
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
                title={`Inactivas (${inactiveList.length})`}
              >
                {inactiveList.length === 0 ? (
                  <div className="text-center p-5">
                    <p className="text-muted">No hay unidades inactivas</p>
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
          initial={editingItem}
          action="Editar"
          type="unit"
          onSubmit={async (form) => {
            await editUnit(editingItem.id, form);
            toast.success("Unidad actualizada");
            setShowEdit(false);
            loadUnits();
          }}
        />
      )}

      {/* Modal Crear */}
      <EditVehicleModal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        initial={emptyUnit}
        action="Crear"
        type="unit"
        onSubmit={async (form) => {
          await createUnit(form);
          toast.success("Unidad creada");
          setShowCreate(false);
          loadUnits();
        }}
      />

      {/* Modal Asignar Driver */}
      <AssignDriverModal
        show={showAssign}
        onHide={() => setShowAssign(false)}
        onSubmit={async (driverId) => {
          await assigndriver({ trailer_id: assigningId!, driver_id: driverId });
          toast.success("Driver asignado");
          setShowAssign(false);
          loadUnits();
        }}
      />
    </Container>
  );
};

export default UnitsTabs;
