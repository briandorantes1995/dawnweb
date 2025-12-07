import React, { useState } from "react";
import { Card, Table, Button, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTasks } from "../../hooks/useTasks";

const TasksPanel: React.FC = () => {
    const { tasks, add, toggle, remove, loading } = useTasks();
    const [newTask, setNewTask] = useState("");

    const handleAdd = async () => {
        if (!newTask.trim()) return;
        await add(newTask.trim());
        setNewTask("");
    };

    return (
        <Card className="card-tasks">
            <Card.Header>
                <Card.Title as="h4">Tareas/Pendientes</Card.Title>
                <p className="card-category">Lista Personal de Tareas</p>
            </Card.Header>

            <Card.Body>
                {/* === INPUT PARA AGREGAR === */}
                <div className="d-flex mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Agregar nueva tarea..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                    />
                    <Button
                        variant="success"
                        className="ml-2"
                        onClick={handleAdd}
                    >
                        +
                    </Button>
                </div>

                {/* === LOADING === */}
                {loading && <p>Loading...</p>}

                {/* === LISTA DE TAREAS === */}
                <div className="table-full-width">
                    <Table>
                        <tbody>
                        {tasks.map((task) => (
                            <tr key={task.id}>
                                <td>
                                    <Form.Check className="mb-1 pl-0">
                                        <Form.Check.Label>
                                            <Form.Check.Input
                                                type="checkbox"
                                                checked={task.status === "done"}
                                                onChange={() => toggle(task)}
                                            />
                                            <span className="form-check-sign" />
                                        </Form.Check.Label>
                                    </Form.Check>
                                </td>

                                <td style={{ textDecoration: task.status === "done" ? "line-through" : "none" }}>
                                    {task.text}
                                </td>

                                <td className="td-actions text-right">
                                    <OverlayTrigger
                                        overlay={<Tooltip>Editar Tarea</Tooltip>}
                                    >
                                        <Button
                                            className="btn-simple btn-link p-1"
                                            type="button"
                                            variant="info"
                                            disabled
                                        >
                                            <i className="fas fa-edit"></i>
                                        </Button>
                                    </OverlayTrigger>

                                    <OverlayTrigger
                                        overlay={<Tooltip>Borrar</Tooltip>}
                                    >
                                        <Button
                                            className="btn-simple btn-link p-1"
                                            type="button"
                                            variant="danger"
                                            onClick={() => remove(task)}
                                        >
                                            <i className="fas fa-times"></i>
                                        </Button>
                                    </OverlayTrigger>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>

            <Card.Footer>
                <hr />
                <div className="stats">
                    <i className="now-ui-icons loader_refresh spin"></i>
                    Actualizado justo ahora.
                </div>
            </Card.Footer>
        </Card>
    );
};

export default TasksPanel;
