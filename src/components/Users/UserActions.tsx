import React from "react";
import { Button, OverlayTrigger, Tooltip, ButtonGroup } from "react-bootstrap";

interface Props {
    user: any;
    tab: "active" | "inactive" | "pending";
    canDelete: boolean;
    onApprove?: () => void;
    onActivate?: () => void;
    onDeactivate?: () => void;
    onChangeRole?: () => void;
    onDelete?: () => void;
    onAssignDriver?: () => void;
}

const UserActions: React.FC<Props> = ({user,tab, canDelete, onApprove, onActivate, onDeactivate, onChangeRole, onDelete, onAssignDriver,}) => {

    const deleteButton = canDelete ? (
        <Button variant="danger" size="sm" onClick={onDelete}>
            Eliminar
        </Button>
    ) : (
        <OverlayTrigger overlay={<Tooltip>No tienes permitido borrar usuarios</Tooltip>}>
      <span className="d-inline-block">
        <Button variant="danger" size="sm" disabled style={{ pointerEvents: "none", opacity: 0.5 }}>
          Eliminar
        </Button>
      </span>
        </OverlayTrigger>
    );

    return (
        <ButtonGroup>
            {tab === "pending" && (
                <Button variant="success" size="sm" onClick={onApprove}>
                    Aprobar
                </Button>
            )}

            {tab === "active" && (
                <>
                    <Button variant="warning" size="sm" onClick={onDeactivate}>
                        Desactivar
                    </Button>
                    <Button variant="info" size="sm" onClick={onChangeRole}>
                        Cambiar rol
                    </Button>
                    {deleteButton}
                </>
            )}

            {tab === "inactive" && (
                <>
                    <Button variant="success" size="sm" onClick={onActivate}>
                        Activar
                    </Button>
                    <Button variant="info" size="sm" onClick={onChangeRole}>
                        Cambiar rol
                    </Button>
                    {deleteButton}
                </>
            )}
        </ButtonGroup>
    );
};

export default UserActions;
