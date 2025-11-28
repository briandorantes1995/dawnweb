import React, { useEffect, useState } from "react";
import { Tabs, Tab, Card, Table, Spinner, Container } from "react-bootstrap";
import { useUserService } from "../api/users";

const UsersTabs: React.FC = () => {
  const { fetchUsers } = useUserService();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeUsers, setActive] = useState([]);
  const [inactiveUsers, setInactive] = useState([]);
  const [pendingUsers, setPending] = useState([]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await fetchUsers();

      setActive(result.activeUsers);
      setInactive(result.inactiveUsers);
      setPending(result.pendingUsers);
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

  const renderTable = (list: any[]) => (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Teléfono</th>
          <th>Rol</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {list.map((u) => (
          <tr key={u.id}>
            <td>
              {u.first_name} {u.last_name}
            </td>
            <td>{u.email}</td>
            <td>{u.phone}</td>
            <td>{u.role_name}</td>
            <td>
              {u.pending_approval
                ? "Pendiente"
                : u.active
                ? "Activo"
                : "Inactivo"}
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
                {renderTable(activeUsers)}
              </Tab>

              <Tab
                eventKey="pending"
                title={`Pendientes (${pendingUsers.length})`}
              >
                {renderTable(pendingUsers)}
              </Tab>

              <Tab
                eventKey="inactive"
                title={`Inactivos (${inactiveUsers.length})`}
              >
                {renderTable(inactiveUsers)}
              </Tab>
            </Tabs>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UsersTabs;

