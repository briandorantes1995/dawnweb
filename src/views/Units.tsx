import React, { useEffect, useState } from "react";
import { Tabs, Tab, Card, Table, Spinner, Container } from "react-bootstrap";
import { useUnitsService } from "../api/unit";
import VehicleActions from "../components/Vehicles/VehicleActions";
import EditVehicleModal from "../components/Vehicles/EditVehicleModal";
import AssignDriverModal from "../components/Vehicles/AssignDriverModal";
import toast from "react-hot-toast";

const UnitsTabs: React.FC = () => {
  const { fetchUnits, editUnit, changeStatus, assigndriver, unassigndriver } =useUnitsService();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeList, setActiveList] = useState([]);
  const [inactiveList, setInactiveList] = useState([]);
  const [assignedList, setAssignedList] = useState([]);

  // Modales
  const [showEdit, setShowEdit] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

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

  const renderTable = (list: any[], tab: "active" | "inactive" | "assigned") => (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Placas</th>
          <th>T. Identificador</th>
          <th>Tonelaje</th>
          <th>Status</th>
          <th style={{ width: 250 }}>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {list.map((u: any) => (
          <tr key={u.id}>
            <td>{u.type}</td>
            <td>{u.plates}</td>
            <td>{u.unit_identifier}</td>
            <td>{u.tonnage}</td>

            <td>
              {tab === "assigned"
                ? "Asignada"
                : u.status === "active"
                ? "Activa"
                : "Inactiva"}
            </td>

            <td>
              <VehicleActions
                item={u}
                tab={tab}
                onEdit={() => {
                  setEditingItem(u);
                  setShowEdit(true);
                }}
                onActivate={async () => {
                  await changeStatus(u.id, "active");
                  toast.success("Unidad activada");
                  loadUnits();
                }}
                onDeactivate={async () => {
                  await changeStatus(u.id, "inactive");
                  toast.success("Unidad desactivada");
                  loadUnits();
                }}
                onAssignDriver={() => {
                  setAssigningId(u.id);
                  setShowAssign(true);
                }}
                onUnassignDriver={async () => {
                  await unassigndriver({  trailer_id: u.id });
                  toast.success("Driver removido");
                  loadUnits();
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
          <Card.Title as="h4">Unidades</Card.Title>
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
                {renderTable(activeList, "active")}
              </Tab>

              <Tab
                eventKey="assigned"
                title={`Asignadas (${assignedList.length})`}
              >
                {renderTable(assignedList, "assigned")}
              </Tab>

              <Tab
                eventKey="inactive"
                title={`Inactivas (${inactiveList.length})`}
              >
                {renderTable(inactiveList, "inactive")}
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
          onSubmit={async (form) => {
            await editUnit(editingItem.id, form);
            toast.success("Unidad actualizada");
            setShowEdit(false);
            loadUnits();
          }}
        />
      )}

      {/* Modal Asignar Driver */}
      <AssignDriverModal
        show={showAssign}
        onHide={() => setShowAssign(false)}
        onSubmit={async (driverId) => {
          await assigndriver({trailer_id: assigningId!,driver_id: driverId,});
          toast.success("Driver asignado");
          setShowAssign(false);
          loadUnits();
        }}
      />
    </Container>
  );
};

export default UnitsTabs;
