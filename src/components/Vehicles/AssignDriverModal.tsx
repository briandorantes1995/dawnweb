import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDriversService} from "../../api/drivers";


interface Props {
  show: boolean;
  onHide: () => void;
  onSubmit: (driverId: string) => void;
}

const AssignDriverModal: React.FC<Props> = ({ show, onHide, onSubmit }) => {
  const { fetchDrivers } = useDriversService();
  const [drivers, setDrivers] = useState([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (show) loadDrivers();
  }, [show]);

  const loadDrivers = async () => {
    const res = await fetchDrivers();
    setDrivers(res.active);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Asignar Driver</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Selecciona un driver...</option>
          {drivers.map((d: any) => (
            <option key={d.id} value={d.id}>
              {d.first_name} {d.last_name}
            </option>
          ))}
        </Form.Select>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button
          variant="primary"
          disabled={!selected}
          onClick={() => onSubmit(selected)}
        >
          Asignar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignDriverModal;
