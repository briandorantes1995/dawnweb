import React, { useState,useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface Props {
  show: boolean;
  onHide: () => void;
  onSubmit: (payload: any) => void;
  initial: any;
}

const EditVehicleModal: React.FC<Props> = ({ show, onHide, onSubmit, initial }) => {
  const [form, setForm] = useState(initial);

   useEffect(() => {
    setForm(initial);
  }, [initial]);

  const updateField = (field: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    onSubmit(form);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Editar vehículo</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Tipo</Form.Label>
            <Form.Control
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mt-2">
            <Form.Label>Placas</Form.Label>
            <Form.Control
              value={form.plates || ""}
              onChange={(e) => updateField("plates", e.target.value)}
            />
          </Form.Group>

          {"tonnage" in initial && (
            <Form.Group className="mt-2">
              <Form.Label>Tonelaje</Form.Label>
              <Form.Control
                type="number"
                value={form.tonnage || ""}
                onChange={(e) => updateField("tonnage", Number(e.target.value))}
              />
            </Form.Group>
          )}

          {/* Campos especiales para trailers */}
          {"volume" in initial && (
            <>
              <Form.Group className="mt-2">
                <Form.Label>Volumen</Form.Label>
                <Form.Control
                  type="number"
                  value={form.volume || ""}
                  onChange={(e) => updateField("volume", Number(e.target.value))}
                />
              </Form.Group>

              <Form.Group className="mt-2">
                <Form.Label>Número de caja</Form.Label>
                <Form.Control
                  value={form.box_number || ""}
                  onChange={(e) => updateField("box_number", e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mt-2">
                <Form.Label>Color</Form.Label>
                <Form.Control
                  value={form.color || ""}
                  onChange={(e) => updateField("color", e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave}>Guardar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditVehicleModal;
