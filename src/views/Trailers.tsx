
import React, { useEffect, useState } from "react";
import { Tabs, Tab, Card, Table, Spinner, Container } from "react-bootstrap";
import { useTrailersService } from "../api/trailers";
import VehicleActions from "../components/Vehicles/VehicleActions";
import EditVehicleModal from "../components/Vehicles/EditVehicleModal";
import AssignDriverModal from "../components/Vehicles/AssignDriverModal";
import toast from "react-hot-toast";

const emptyTrailer = {
  type: "",
  plates: "",
  volume: "",
  box_number: "",
  color: "",
};

const TrailersTabs: React.FC = () => {

  const { fetchTrailers,editTrailer,createTrailer,changeStatus,assigndriver,unassigndriver,} = useTrailersService();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeList, setActiveList] = useState([]);
  const [inactiveList, setInactiveList] = useState([]);
  const [assignedList, setAssignedList] = useState([]);

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

  const renderTable = (
    list: any[],
    tab: "active" | "inactive" | "assigned"
  ) => (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Placas</th>
          <th>Volumen</th>
          <th>Número caja</th>
          <th>Color</th>
          <th>Status</th>
          <th style={{ width: 250 }}>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {list.map((t: any) => (
          <tr key={t.id}>
            <td>{t.type}</td>
            <td>{t.plates}</td>
            <td>{t.volume}</td>
            <td>{t.box_number}</td>
            <td>{t.color}</td>

            <td>
              {tab === "assigned"
                ? "Asignado"
                : t.status === "active"
                ? "Activo"
                : "Inactivo"}
            </td>

            <td>
              <VehicleActions
                item={t}
                tab={tab}
                onEdit={() => {
                  setEditingItem(t);
                  setShowEdit(true);
                }}
                onActivate={async () => {
                  await changeStatus(t.id, "active");
                  toast.success("Trailer activado");
                  loadTrailers();
                }}
                onDeactivate={async () => {
                  await changeStatus(t.id, "inactive");
                  toast.success("Trailer desactivado");
                  loadTrailers();
                }}
                onAssignDriver={() => {
                  setAssigningId(t.id);
                  setShowAssign(true);
                }}
                onUnassignDriver={async () => {
                  await unassigndriver({ trailer_id: t.id });
                  toast.success("Driver removido");
                  loadTrailers();
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
          <Card.Title as="h4">Trailers</Card.Title>
           <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Añadir Trailer/Caja</button>
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
                {renderTable(activeList, "active")}
              </Tab>

              <Tab
                eventKey="assigned"
                title={`Asignados (${assignedList.length})`}
              >
                {renderTable(assignedList, "assigned")}
              </Tab>

              <Tab
                eventKey="inactive"
                title={`Inactivos (${inactiveList.length})`}
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
          await createTrailer(form); // Debe existir en useTrailersService
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
