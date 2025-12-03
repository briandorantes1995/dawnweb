import React from "react";
import { Button, ButtonGroup } from "react-bootstrap";

interface Props {
  item: any;
  tab: "active" | "inactive" | "assigned";
  onEdit: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onAssignDriver: () => void;
  onUnassignDriver: () => void;
}

const VehicleActions: React.FC<Props> = ({ 
  item, 
  tab, 
  onEdit, 
  onActivate, 
  onDeactivate, 
  onAssignDriver,
  onUnassignDriver 
}) => {
  return (
    <ButtonGroup>
      {tab === "active" && (
        <>
          <Button size="sm" variant="warning" onClick={onDeactivate}>
            Desactivar
          </Button>
          <Button size="sm" variant="info" onClick={onEdit}>
            Editar
          </Button>
          <Button size="sm" variant="primary" onClick={onAssignDriver}>
            Asignar driver
          </Button>
        </>
      )}

      {tab === "inactive" && (
        <>
          <Button size="sm" variant="success" onClick={onActivate}>
            Activar
          </Button>
          <Button size="sm" variant="info" onClick={onEdit}>
            Editar
          </Button>
        </>
      )}

      {tab === "assigned" && (
        <>
          <Button size="sm" variant="danger" onClick={onUnassignDriver}>
            Quitar driver
          </Button>
          <Button size="sm" variant="info" onClick={onEdit}>
            Editar
          </Button>
        </>
      )}
    </ButtonGroup>
  );
};

export default VehicleActions;
