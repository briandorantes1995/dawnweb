import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Box } from '@mui/material';

interface Props {
    user: any;
    tab: "active" | "inactive" | "pending";
    canDelete: boolean;
    canDeactivate?: boolean;
    onApprove?: () => void;
    onActivate?: () => void;
    onDeactivate?: () => void;
    onChangeRole?: () => void;
    onDelete?: () => void;
    onAssignDriver?: () => void;
}

const UserActions: React.FC<Props> = ({user, tab, canDelete, canDeactivate = true, onApprove, onActivate, onDeactivate, onChangeRole, onDelete, onAssignDriver}) => {

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

    const deactivateButton = canDeactivate ? (
        <Button variant="warning" size="sm" onClick={onDeactivate}>
            Desactivar
        </Button>
    ) : (
        <OverlayTrigger overlay={<Tooltip>No tienes permitido desactivar usuarios</Tooltip>}>
            <span className="d-inline-block">
                <Button variant="warning" size="sm" disabled style={{ pointerEvents: "none", opacity: 0.5 }}>
                    Desactivar
                </Button>
            </span>
        </OverlayTrigger>
    );

    return (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            {tab === "pending" && (
                <Button variant="success" size="sm" onClick={onApprove}>
                    Aprobar
                </Button>
            )}

            {tab === "active" && (
                <>
                    {deactivateButton}
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
        </Box>
    );
};

export default UserActions;
