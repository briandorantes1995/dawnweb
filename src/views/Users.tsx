import React, { useEffect, useState, useMemo } from "react";
import { Tabs, Tab, Card, Spinner, Container, Button } from "react-bootstrap";
import { useUserService } from "../api/users";
import { useDriversService } from "../api/drivers";
import { useApi } from "../hooks/useApi";
import UserActions from "../components/Users/UserActions";
import ChangeRoleModal from "../components/Users/ChangeRoleModal";
import AssignDriverModal from "../components/Users/AssignDriverModal";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import toast from "react-hot-toast";
import { Driver } from "../types/Driver";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Box, Chip } from '@mui/material';

const UsersTabs: React.FC = () => {
  const { fetchUsers, approveUser, changeRole, setActiveStatus, deleteUser } = useUserService();
  const { createDriver, fetchDrivers, editDriver, activateDriver, deactivateDriver } = useDriversService();
  const { patch: patchApi, request } = useApi();
  const currentUserRole = useSelector((s: RootState) => s.auth.user?.roles?.[0]?.name);
  const canDelete = currentUserRole === "Maestro";
  const canAssignDriver = currentUserRole === "Admin" || currentUserRole === "Maestro";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveList] = useState<any[]>([]);
  const [inactiveUsers, setInactiveList] = useState<any[]>([]);
  const [pendingUsers, setPendingList] = useState<any[]>([]);

  // Drivers states
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [errorDrivers, setErrorDrivers] = useState<string | null>(null);
  const [activeDrivers, setActiveDrivers] = useState<Driver[]>([]);
  const [inactiveDrivers, setInactiveDrivers] = useState<Driver[]>([]);

  // Modal states
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<any>(null);
  const [showAssignDriverModal, setShowAssignDriverModal] = useState(false);
  const [selectedUserForDriver, setSelectedUserForDriver] = useState<any>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await fetchUsers();

      setActiveList(result.activeUsers);
      setInactiveList(result.inactiveUsers);
      setPendingList(result.pendingUsers);
    } catch (err) {
      console.error(err);
      setError("No se pudieron obtener los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoadingDrivers(true);
      setErrorDrivers(null);
      const result = await fetchDrivers();
      console.log("Drivers data:", result);
      console.log("Active drivers:", result.active);
      console.log("Inactive drivers:", result.inactive);
      
      // Asegurarse de que siempre sean arrays
      const active = Array.isArray(result.active) ? result.active : [];
      const inactive = Array.isArray(result.inactive) ? result.inactive : [];
      
      setActiveDrivers(active);
      setInactiveDrivers(inactive);
      
      console.log("State updated - Active:", active.length, "Inactive:", inactive.length);
    } catch (err) {
      console.error("Error loading drivers:", err);
      setErrorDrivers("No se pudieron obtener los conductores");
      setActiveDrivers([]);
      setInactiveDrivers([]);
    } finally {
      setLoadingDrivers(false);
    }
  };

  // Preparar datos para DataGrid de usuarios
  const activeUsersRows = useMemo(() => 
    activeUsers.map((u) => ({ id: u.id, ...u })), 
    [activeUsers]
  );

  const inactiveUsersRows = useMemo(() => 
    inactiveUsers.map((u) => ({ id: u.id, ...u })), 
    [inactiveUsers]
  );

  const pendingUsersRows = useMemo(() => 
    pendingUsers.map((u) => ({ id: u.id, ...u })), 
    [pendingUsers]
  );

  // Preparar datos para DataGrid de conductores
  const activeDriversRows = useMemo(() => 
    activeDrivers.map((d) => ({ id: d.id, ...d })), 
    [activeDrivers]
  );

  const inactiveDriversRows = useMemo(() => 
    inactiveDrivers.map((d) => ({ id: d.id, ...d })), 
    [inactiveDrivers]
  );

  // Columnas para usuarios
  const createUserColumns = (tab: "active" | "inactive" | "pending"): GridColDef[] => [
    { 
      field: 'first_name', 
      headerName: 'Nombre', 
      width: 200,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (_, row) => `${row.first_name || ''} ${row.last_name || ''}`.trim()
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      width: 220,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'phone', 
      headerName: 'Teléfono', 
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'role_name', 
      headerName: 'Rol', 
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'status', 
      headerName: 'Estado', 
      width: 130,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (_, row) => {
        if (row.pending_approval) return "Pendiente";
        return row.active ? "Activo" : "Inactivo";
      },
      renderCell: (params) => {
        const status = params.value;
        const color = status === "Activo" ? "success" : status === "Pendiente" ? "warning" : "default";
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
        const user = params.row;
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <UserActions
              user={user}
              tab={tab}
              canDelete={canDelete}
              onApprove={async () => {
                await approveUser(user.id);
                toast.success("Usuario aprobado");
                loadUsers();
              }}
              onActivate={async () => {
                await setActiveStatus(user.id, true);
                toast.success("Usuario activado");
                loadUsers();
              }}
              onDeactivate={async () => {
                await setActiveStatus(user.id, false);
                toast.success("Usuario desactivado");
                loadUsers();
              }}
              onChangeRole={() => {
                setSelectedUserForRole(user);
                setShowChangeRoleModal(true);
              }}
              onDelete={async () => {
                await deleteUser(user.id);
                toast.success("Usuario eliminado");
                loadUsers();
              }}
            />
          </Box>
        );
      },
    },
  ];

  // Columnas para conductores
  const createDriverColumns = (tab: "active" | "inactive"): GridColDef[] => [
    { 
      field: 'member_name', 
      headerName: 'Nombre', 
      width: 200,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (_, row) => `${row.member?.first_name || ''} ${row.member?.last_name || ''}`.trim()
    },
    { 
      field: 'member_email', 
      headerName: 'Email', 
      width: 220,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (_, row) => row.member?.email || "-"
    },
    { 
      field: 'member_phone', 
      headerName: 'Teléfono', 
      width: 150,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (_, row) => row.member?.phone || "-"
    },
    { 
      field: 'license_number', 
      headerName: 'Número de Licencia', 
      width: 170,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (value) => value || "-"
    },
    { 
      field: 'license_type', 
      headerName: 'Tipo de Licencia', 
      width: 160,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (value) => value || "-"
    },
    { 
      field: 'vehicle', 
      headerName: 'Vehículo', 
      width: 150,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (_, row) => row.default_unit?.plates || row.default_unit?.unit_identifier || "-"
    },
    { 
      field: 'trailer', 
      headerName: 'Caja/Tráiler', 
      width: 150,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (_, row) => row.default_trailer?.plates || row.default_trailer?.box_number || "-"
    },
    { 
      field: 'status', 
      headerName: 'Estado', 
      width: 130,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (_, row) => row.active ? "Activo" : "Inactivo",
      renderCell: (params) => {
        const color = params.value === "Activo" ? "success" : "default";
        return <Chip label={params.value} color={color} size="small" />;
      }
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 200,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const driver = params.row as Driver;
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            {canAssignDriver && (
              <Button
                variant="info"
                size="sm"
                onClick={() => {
                  setSelectedUserForDriver(driver.member);
                  setShowAssignDriverModal(true);
                }}
              >
                Editar
              </Button>
            )}
            {tab === "active" && (
              <Button
                variant="warning"
                size="sm"
                onClick={async () => {
                  await deactivateDriver(driver.id);
                  toast.success("Conductor desactivado");
                  loadDrivers();
                }}
              >
                Desactivar
              </Button>
            )}
            {tab === "inactive" && (
              <Button
                variant="success"
                size="sm"
                onClick={async () => {
                  await activateDriver(driver.id);
                  toast.success("Conductor activado");
                  loadDrivers();
                }}
              >
                Activar
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  return (
      <Container fluid>
        <Card>
          <Card.Header>
            <Card.Title as="h4">Usuarios y Conductores</Card.Title>
          </Card.Header>

          <Card.Body>
            <Tabs defaultActiveKey="users" id="main-tabs" className="mb-3">
              <Tab eventKey="users" title="Usuarios">
                {loading && (
                  <div className="text-center p-3">
                    <Spinner animation="border" />
                    <p className="mt-2">Cargando usuarios...</p>
                  </div>
                )}

                {error && <p className="text-danger text-center">{error}</p>}

                {!loading && !error && (
                  <Tabs defaultActiveKey="active" id="users-tabs" className="mb-3">
                    <Tab eventKey="active" title={`Activos (${activeUsers.length})`}>
                      {activeUsers.length === 0 ? (
                        <div className="text-center p-5">
                          <p className="text-muted">No hay usuarios activos</p>
                        </div>
                      ) : (
                        <Paper sx={{ height: 600, width: '100%', mt: 2 }}>
                          <DataGrid
                            rows={activeUsersRows}
                            columns={createUserColumns("active")}
                            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                            pageSizeOptions={[5, 10, 25, 50]}
                            sx={{ border: 0 }}
                            disableRowSelectionOnClick
                          />
                        </Paper>
                      )}
                    </Tab>

                    <Tab eventKey="pending" title={`Pendientes (${pendingUsers.length})`}>
                      {pendingUsers.length === 0 ? (
                        <div className="text-center p-5">
                          <p className="text-muted">No hay usuarios pendientes</p>
                        </div>
                      ) : (
                        <Paper sx={{ height: 600, width: '100%', mt: 2 }}>
                          <DataGrid
                            rows={pendingUsersRows}
                            columns={createUserColumns("pending")}
                            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                            pageSizeOptions={[5, 10, 25, 50]}
                            sx={{ border: 0 }}
                            disableRowSelectionOnClick
                          />
                        </Paper>
                      )}
                    </Tab>

                    <Tab eventKey="inactive" title={`Inactivos (${inactiveUsers.length})`}>
                      {inactiveUsers.length === 0 ? (
                        <div className="text-center p-5">
                          <p className="text-muted">No hay usuarios inactivos</p>
                        </div>
                      ) : (
                        <Paper sx={{ height: 600, width: '100%', mt: 2 }}>
                          <DataGrid
                            rows={inactiveUsersRows}
                            columns={createUserColumns("inactive")}
                            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                            pageSizeOptions={[5, 10, 25, 50]}
                            sx={{ border: 0 }}
                            disableRowSelectionOnClick
                          />
                        </Paper>
                      )}
                    </Tab>
                  </Tabs>
                )}
              </Tab>

              <Tab eventKey="drivers" title="Drivers">
                {loadingDrivers && (
                  <div className="text-center p-3">
                    <Spinner animation="border" />
                    <p className="mt-2">Cargando conductores...</p>
                  </div>
                )}

                {errorDrivers && (
                  <div className="text-center p-3">
                    <p className="text-danger">{errorDrivers}</p>
                    <Button variant="primary" size="sm" onClick={loadDrivers}>
                      Reintentar
                    </Button>
                  </div>
                )}

                {!loadingDrivers && !errorDrivers && (
                  <Tabs defaultActiveKey="active" id="drivers-tabs" className="mb-3">
                    <Tab eventKey="active" title={`Activos (${activeDrivers.length})`}>
                      {activeDrivers.length === 0 ? (
                        <div className="text-center p-5">
                          <p className="text-muted">No hay conductores activos</p>
                        </div>
                      ) : (
                        <Paper sx={{ height: 600, width: '100%', mt: 2 }}>
                          <DataGrid
                            rows={activeDriversRows}
                            columns={createDriverColumns("active")}
                            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                            pageSizeOptions={[5, 10, 25, 50]}
                            sx={{ border: 0 }}
                            disableRowSelectionOnClick
                          />
                        </Paper>
                      )}
                    </Tab>

                    <Tab eventKey="inactive" title={`Inactivos (${inactiveDrivers.length})`}>
                      {inactiveDrivers.length === 0 ? (
                        <div className="text-center p-5">
                          <p className="text-muted">No hay conductores inactivos</p>
                        </div>
                      ) : (
                        <Paper sx={{ height: 600, width: '100%', mt: 2 }}>
                          <DataGrid
                            rows={inactiveDriversRows}
                            columns={createDriverColumns("inactive")}
                            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                            pageSizeOptions={[5, 10, 25, 50]}
                            sx={{ border: 0 }}
                            disableRowSelectionOnClick
                          />
                        </Paper>
                      )}
                    </Tab>
                  </Tabs>
                )}
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>

        {/* Modal para cambiar rol */}
        <ChangeRoleModal
          show={showChangeRoleModal}
          onHide={() => {
            setShowChangeRoleModal(false);
            setSelectedUserForRole(null);
          }}
          currentRole={selectedUserForRole?.role_name || ""}
          onSubmit={async (role: string) => {
            if (!selectedUserForRole) return;
            try {
              await changeRole(selectedUserForRole.id, role);
              toast.success("Rol actualizado exitosamente");
              loadUsers();
            } catch (err: any) {
              toast.error(err?.message || "Error al cambiar el rol");
            }
          }}
        />

        {/* Modal para asignar conductor */}
        <AssignDriverModal
          show={showAssignDriverModal}
          onHide={() => {
            setShowAssignDriverModal(false);
            setSelectedUserForDriver(null);
          }}
          userId={selectedUserForDriver?.id || ""}
          onSubmit={async (data) => {
            if (!selectedUserForDriver) return;
            try {
              let currentDriverId = data.driverId || null;

              // Paso 1: Crear o actualizar el conductor
              if (data.isEdit && data.driverId) {
                // Modo edición: actualizar conductor existente
                await editDriver(data.driverId, {
                  license_number: data.licenseNumber,
                  license_type: data.licenseType,
                });
                currentDriverId = data.driverId;
              } else {
                // Modo creación: crear nuevo conductor
                const response = await createDriver(selectedUserForDriver.id, {
                  license_number: data.licenseNumber,
                  license_type: data.licenseType,
                });
                currentDriverId = response?.driver?.id;
              }

              if (!currentDriverId) {
                throw new Error("No se pudo obtener el ID del conductor");
              }

              // Paso 2: Obtener el driver actual para ver qué tiene asignado
              const driversResponse = await fetchDrivers();
              const allDrivers = [...(driversResponse.active || []), ...(driversResponse.inactive || [])];
              const currentDriver = allDrivers.find((d: any) => d.id === currentDriverId);

              if (!currentDriver) {
                throw new Error("No se encontró el conductor");
              }

              // Paso 3: Manejar cambios en el vehículo
              const currentVehicleId = currentDriver.default_unit?.id || null;
              const vehicleChanged = currentVehicleId !== data.vehicleId;
              
              if (vehicleChanged) {
                // Desasignar vehículo anterior si existe
                if (currentVehicleId) {
                  try {
                    await request("/units/unassign-driver", {
                      method: "PATCH",
                      body: JSON.stringify({ unit_id: currentVehicleId }),
                      headers: { "Content-Type": "application/json" },
                    });
                  } catch (err) {
                    // Error al desasignar vehículo anterior (continuar)
                  }
                }

                // Asignar nuevo vehículo si se seleccionó uno
                if (data.vehicleId) {
                  try {
                    await request("/units/assign-driver", {
                      method: "PATCH",
                      body: JSON.stringify({ unit_id: data.vehicleId, driver_id: currentDriverId }),
                      headers: { "Content-Type": "application/json" },
                    });
                  } catch (err: any) {
                    const errorMsg = err?.message || "Error al asignar vehículo";
                    toast.error(`Advertencia: ${errorMsg}`);
                  }
                }
              }

              // Paso 4: Manejar cambios en la caja/tráiler
              const currentTrailerId = currentDriver.default_trailer?.id || null;
              const trailerChanged = currentTrailerId !== data.trailerId;
              
              if (trailerChanged) {
                // Si el vehículo cambió y no es tráiler, desasignar caja si existe
                if (vehicleChanged && !data.trailerId && currentTrailerId) {
                  try {
                    await request("/trailers/unassign-driver", {
                      method: "PATCH",
                      body: JSON.stringify({ trailer_id: currentTrailerId }),
                      headers: { "Content-Type": "application/json" },
                    });
                  } catch (err) {
                    // Error al desasignar trailer después de cambiar vehículo (continuar)
                  }
                } else {
                  // Desasignar trailer anterior si existe y es diferente
                  if (currentTrailerId && currentTrailerId !== data.trailerId) {
                    try {
                      await request("/trailers/unassign-driver", {
                        method: "PATCH",
                        body: JSON.stringify({ trailer_id: currentTrailerId }),
                        headers: { "Content-Type": "application/json" },
                      });
                    } catch (err) {
                      // Error al desasignar trailer anterior (continuar)
                    }
                  }

                  // Asignar nuevo trailer si se seleccionó uno y el vehículo es tráiler
                  if (data.trailerId) {
                    try {
                      await request("/trailers/assign-driver", {
                        method: "PATCH",
                        body: JSON.stringify({ trailer_id: data.trailerId, driver_id: currentDriverId }),
                        headers: { "Content-Type": "application/json" },
                      });
                    } catch (err: any) {
                      const errorMsg = err?.message || "Error al asignar caja/tráiler";
                      toast.error(`Advertencia: ${errorMsg}`);
                    }
                  }
                }
              }

              toast.success(data.isEdit 
                ? "Conductor actualizado exitosamente" 
                : "Usuario asignado como conductor exitosamente");
              loadUsers();
              loadDrivers();
            } catch (err: any) {
              const errorMessage = err?.message || err?.error || "Error al asignar como conductor";
              if (errorMessage.toLowerCase().includes("already exists") || errorMessage.toLowerCase().includes("ya existe")) {
                toast.error("Este usuario ya es conductor");
              } else {
                toast.error(errorMessage);
              }
            }
          }}
        />
      </Container>
  );
};

export default UsersTabs;
