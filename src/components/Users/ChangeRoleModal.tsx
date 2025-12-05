import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "./ChangeRoleModal.css";

interface Props {
  show: boolean;
  onHide: () => void;
  currentRole: string;
  onSubmit: (role: string) => void;
}

const ChangeRoleModal: React.FC<Props> = ({ show, onHide, currentRole, onSubmit }) => {
  const [selectedRole, setSelectedRole] = useState<string>(currentRole || "");

  const roles = ["Admin", "Maestro", "User"];


  const handleSubmit = () => {
    if (selectedRole && selectedRole !== currentRole) {
      onSubmit(selectedRole);
    }
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      dialogClassName="change-role-modal-dialog"
      onEntered={() => {
        const modalDialog = document.querySelector('.change-role-modal-dialog') as HTMLElement;
        if (modalDialog) {
          modalDialog.style.setProperty('transform', 'none', 'important');
          modalDialog.style.setProperty('-webkit-transform', 'none', 'important');
          modalDialog.style.setProperty('-o-transform', 'none', 'important');
          modalDialog.style.setProperty('margin-top', '15px', 'important');
        }
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>Cambiar Rol</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Selecciona el nuevo rol</Form.Label>
          <Form.Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">Selecciona un rol...</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!selectedRole || selectedRole === currentRole}
        >
          Cambiar Rol
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChangeRoleModal;
