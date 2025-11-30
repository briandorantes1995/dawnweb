import React, { useEffect, useState } from "react";
import { Tabs, Tab, Card, Table, Spinner, Container } from "react-bootstrap";
import { useUserService } from "../api/users";
import UserActions from "../components/Users/UserActions";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import toast from "react-hot-toast";


const UsersTabs: React.FC = () => {
  const { fetchUsers, approveUser, changeRole, setActiveStatus, deleteUser } = useUserService();
  const currentUserRole = useSelector((s: RootState) => s.auth.user?.roles?.[0]?.name);
  const canDelete = currentUserRole === "Maestro";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveList] = useState([]);
  const [inactiveUsers, setInactiveList] = useState([]);
  const [pendingUsers, setPendingList] = useState([]);

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
  }, []);

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
                    onChangeRole={async () => {
                      const role = prompt("Nuevo rol (Admin, Maestro, User):");
                      if (!role) return;
                      await changeRole(u.id, role);
                      toast.success("Rol actualizado");
                      loadUsers();
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

  return (
      <Container fluid>
        <Card>
          <Card.Header>
            <Card.Title as="h4">Usuarios</Card.Title>
          </Card.Header>

          <Card.Body>
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
          </Card.Body>
        </Card>
      </Container>
  );
};

export default UsersTabs;


