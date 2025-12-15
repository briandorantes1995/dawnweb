import React, { useEffect, useState } from "react";
import { Tabs, Tab, Card, Table, Spinner, Container, Button, ButtonGroup } from "react-bootstrap";
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


const UsersTabs: React.FC = () => {
  const { fetchUsers, approveUser, changeRole, setActiveStatus, deleteUser } = useUserService();
  const { createDriver, fetchDrivers, editDriver, activateDriver, deactivateDriver } = useDriversService();
  const { patch: patchApi, request } = useApi();
  const currentUserRole = useSelector((s: RootState) => s.auth.user?.roles?.[0]?.name);
  const canDelete = currentUserRole === "Maestro";
  const canAssignDriver = currentUserRole === "Admin" || currentUserRole === "Maestro";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveList] = useState([]);
  const [inactiveUsers, setInactiveList] = useState([]);
  const [pendingUsers, setPendingList] = useState([]);

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

  const renderTable = (list: any[], tab: "active" | "inactive" | "pending") => (
      <Table striped bordered hover responsive>
        <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Teléfono</th>
          <th>Rol</th>
          <th>Estado</th>
          <th style={{ width: 250 }}>Acciones</th>
        </tr>
        </thead>
        <tbody>
        {list.map((u: any) => (
            <tr key={u.id}>
              <td>{u.first_name} {u.last_name}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>{u.role_name}</td>
              <td>
                {u.pending_approval ? "Pendiente" : u.active ? "Activo" : "Inactivo"}
              </td>
              <td>
                <UserActions
                    user={u}
                    tab={tab}
                    canDelete={canDelete}
                    onApprove={async () => {
                      await approveUser(u.id);
                      toast.success("Usuario aprobado");
                      loadUsers();
                    }}
                    onActivate={async () => {
                      await setActiveStatus(u.id, true);
                      toast.success("Usuario activado");
                      loadUsers();
                    }}
                    onDeactivate={async () => {
                      await setActiveStatus(u.id, false);
                      toast.success("Usuario desactivado");
                      loadUsers();
                    }}
                    onChangeRole={() => {
                      setSelectedUserForRole(u);
                      setShowChangeRoleModal(true);
                    }}
                    onDelete={async () => {
                      await deleteUser(u.id);
                      toast.success("Usuario eliminado");
                      loadUsers();
                    }}
                />
              </td>
            </tr>
        ))}
        </tbody>
      </Table>
  );

  const renderDriversTable = (list: Driver[], tab: "active" | "inactive") => {
    if (!list || list.length === 0) {
      return (
        <div className="text-center p-4">
          <p className="text-muted">No hay conductores {tab === "active" ? "activos" : "inactivos"}</p>
        </div>
      );
    }

    return (
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Número de Licencia</th>
            <th>Tipo de Licencia</th>
            <th>Vehículo</th>
            <th>Caja/Tráiler</th>
            <th>Estado</th>
            <th style={{ width: 200 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.map((driver: Driver) => (
            <tr key={driver.id}>
              <td>{driver.member?.first_name} {driver.member?.last_name}</td>
              <td>{driver.member?.email}</td>
              <td>{driver.member?.phone}</td>
              <td>{driver.license_number || "-"}</td>
              <td>{driver.license_type || "-"}</td>
              <td>{driver.default_unit?.plates || driver.default_unit?.unit_identifier || "-"}</td>
              <td>{driver.default_trailer?.plates || driver.default_trailer?.box_number || "-"}</td>
              <td>{driver.active ? "Activo" : "Inactivo"}</td>
              <td>
                <ButtonGroup>
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
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

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
                      {renderTable(activeUsers, "active")}
                    </Tab>

                    <Tab eventKey="pending" title={`Pendientes (${pendingUsers.length})`}>
                      {renderTable(pendingUsers, "pending")}
                    </Tab>

                    <Tab eventKey="inactive" title={`Inactivos (${inactiveUsers.length})`}>
                      {renderTable(inactiveUsers, "inactive")}
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
                      {renderDriversTable(activeDrivers, "active")}
                    </Tab>

                    <Tab eventKey="inactive" title={`Inactivos (${inactiveDrivers.length})`}>
                      {renderDriversTable(inactiveDrivers, "inactive")}
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


