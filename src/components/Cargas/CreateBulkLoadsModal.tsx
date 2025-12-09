import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Modal,
  Button,
  Table,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useLoadsService } from "../../api/loads";
import { useBranchesService, type Branch } from "../../api/branches";
import { useProvidersService, type Provider } from "../../api/providers";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { buildLoadPayload } from "../../utils/loadFormPayload";
import toast from "react-hot-toast";

const MAX_ROWS = 10;

interface BulkLoadRow {
  folio: string;
  empresaTransportista: string;
  empresaTransportistaId: string;
  tipoCarga: string;
  origen: string;
  origenId: string;
  destino: string;
  nombreCliente: string;
  linkUbicacionCliente: string;
  descripcion: string;
  tipoVehiculo: string;
  tipoCargaTransporte: string;
  peso: string;
  volumen: string;
  fechaCarga: string;
  horaCarga: string;
  fechaEntrega: string;
  horaEntrega: string;
  contactoOrigen: string;
  contactoDestino: string;
  observaciones: string;
}

interface Props {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const CreateBulkLoadsModal: React.FC<Props> = ({ show, onHide, onSuccess }) => {
  const { createLoad } = useLoadsService();
  const { fetchBranches } = useBranchesService();
  const { fetchProviders } = useProvidersService();
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const authLoading = useSelector((s: RootState) => s.auth.loading);

  const [rows, setRows] = useState<BulkLoadRow[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [transportistas, setTransportistas] = useState<Provider[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingTransportistas, setLoadingTransportistas] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<number, string[]>>({});

  const loadingBranchesRef = useRef(false);
  const loadingTransportistasRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (show && !authLoading && currentUser?.company_id && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadBranches();
      loadTransportistas();
    } else if (!show) {
      hasLoadedRef.current = false;
      setRows([]);
      setErrors({});
    }
  }, [show, authLoading, currentUser?.company_id]);

  const loadBranches = useCallback(async () => {
    if (!currentUser?.company_id || loadingBranchesRef.current) return;
    loadingBranchesRef.current = true;
    setLoadingBranches(true);
    try {
      const response = await fetchBranches();
      const allBranches = [
        ...(response?.activeBranches || []),
        ...(response?.inactiveBranches || []),
      ];
      setBranches(allBranches);
    } catch (err: any) {
      console.error("Error cargando sucursales:", err);
      toast.error("Error al cargar sucursales");
      setBranches([]);
    } finally {
      setLoadingBranches(false);
      loadingBranchesRef.current = false;
    }
  }, [fetchBranches, currentUser?.company_id]);

  const loadTransportistas = useCallback(async () => {
    if (!currentUser?.company_id || loadingTransportistasRef.current) return;
    loadingTransportistasRef.current = true;
    setLoadingTransportistas(true);
    try {
      const response = await fetchProviders();
      if (response) {
        const activeProviders = response?.active || [];
        const pendingProviders = response?.pending || [];
        const allAgreements = [...activeProviders, ...pendingProviders];
        
        const providers: Provider[] = allAgreements
          .filter((p: any) => {
            const isProvider = p.related_company_role === "PROVIDER";
            const hasId = !!p.related_company_id;
            const hasName = !!p.related_company_name;
            return isProvider && hasId && hasName;
          })
          .map((p: any) => ({
            id: p.related_company_id,
            name: p.related_company_name,
            legal_name: p.related_company_name,
            agreement_id: p.agreement_id,
            agreement_status: p.status || "active",
          }));
        
        setTransportistas(providers);
      }
    } catch (err: any) {
      console.error("Error al cargar transportistas:", err);
      toast.error("Error al cargar transportistas");
      setTransportistas([]);
    } finally {
      setLoadingTransportistas(false);
      loadingTransportistasRef.current = false;
    }
  }, [fetchProviders, currentUser?.company_id]);

  const addRow = () => {
    if (rows.length >= MAX_ROWS) {
      toast.error(`Solo puedes agregar hasta ${MAX_ROWS} cargas a la vez`);
      return;
    }
    setRows([
      ...rows,
      {
        folio: "",
        empresaTransportista: "",
        empresaTransportistaId: "",
        tipoCarga: "",
        origen: "",
        origenId: "",
        destino: "",
        nombreCliente: "",
        linkUbicacionCliente: "",
        descripcion: "",
        tipoVehiculo: "",
        tipoCargaTransporte: "",
        peso: "",
        volumen: "",
        fechaCarga: "",
        horaCarga: "",
        fechaEntrega: "",
        horaEntrega: "",
        contactoOrigen: "",
        contactoDestino: "",
        observaciones: "",
      },
    ]);
  };

  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const updateRow = (index: number, field: keyof BulkLoadRow, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
    
    // Limpiar error de este campo
    if (errors[index]) {
      const newErrors = { ...errors };
      newErrors[index] = newErrors[index].filter((e) => !e.includes(field));
      if (newErrors[index].length === 0) {
        delete newErrors[index];
      }
      setErrors(newErrors);
    }
  };

  const handleSelectChange = (
    index: number,
    field: "empresaTransportista" | "origen" | "tipoCarga",
    value: string
  ) => {
    const newRows = [...rows];
    
    if (field === "empresaTransportista") {
      const transportista = transportistas.find((t) => t.id === value);
      newRows[index] = {
        ...newRows[index],
        empresaTransportista: transportista?.name || "",
        empresaTransportistaId: value,
      };
    } else if (field === "origen") {
      const branch = branches.find((b) => b.id === value);
      newRows[index] = {
        ...newRows[index],
        origen: branch?.name || "",
        origenId: value,
      };
    } else if (field === "tipoCarga") {
      newRows[index] = {
        ...newRows[index],
        tipoCarga: value,
        // Limpiar campos relacionados
        destino: value === "cliente" ? "" : newRows[index].destino,
        nombreCliente: value === "viaje_propio" ? "" : newRows[index].nombreCliente,
        linkUbicacionCliente: value === "viaje_propio" ? "" : newRows[index].linkUbicacionCliente,
      };
    }
    
    setRows(newRows);
  };

  const validateRow = (row: BulkLoadRow, index: number): string[] => {
    const rowErrors: string[] = [];
    
    if (!row.folio.trim()) rowErrors.push("folio");
    if (!row.empresaTransportistaId) rowErrors.push("empresaTransportista");
    if (!row.tipoCarga) rowErrors.push("tipoCarga");
    if (!row.origenId) rowErrors.push("origen");
    if (!row.descripcion.trim()) rowErrors.push("descripcion");
    if (!row.tipoVehiculo) rowErrors.push("tipoVehiculo");
    if (!row.tipoCargaTransporte) rowErrors.push("tipoCargaTransporte");
    if (!row.fechaCarga) rowErrors.push("fechaCarga");
    if (!row.horaCarga) rowErrors.push("horaCarga");
    if (!row.fechaEntrega) rowErrors.push("fechaEntrega");
    if (!row.horaEntrega) rowErrors.push("horaEntrega");
    
    if (row.tipoCarga === "cliente" && !row.nombreCliente.trim()) {
      rowErrors.push("nombreCliente");
    }
    if (row.tipoCarga === "viaje_propio" && !row.destino.trim()) {
      rowErrors.push("destino");
    }
    
    return rowErrors;
  };

  const validateAll = (): boolean => {
    const allErrors: Record<number, string[]> = {};
    let isValid = true;
    
    rows.forEach((row, index) => {
      const rowErrors = validateRow(row, index);
      if (rowErrors.length > 0) {
        allErrors[index] = rowErrors;
        isValid = false;
      }
    });
    
    setErrors(allErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (rows.length === 0) {
      toast.error("Debes agregar al menos una carga");
      return;
    }

    if (!validateAll()) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    if (!currentUser?.company_id) {
      toast.error("No se pudo obtener el ID de la empresa");
      return;
    }

    setSaving(true);

    try {
      const results = await Promise.allSettled(
        rows.map(async (row) => {
          const formData = {
            folio: row.folio,
            empresaTransportista: row.empresaTransportista,
            tipoTransporte: "",
            unidadPropia: "",
            tipoCarga: row.tipoCarga,
            tipoVehiculo: row.tipoVehiculo,
            tipoCargaTransporte: row.tipoCargaTransporte,
            origen: row.origen,
            destino: row.destino,
            nombreCliente: row.nombreCliente,
            linkUbicacionCliente: row.linkUbicacionCliente,
            descripcion: row.descripcion,
            peso: row.peso,
            volumen: row.volumen,
            fechaCarga: row.fechaCarga,
            horaCarga: row.horaCarga,
            fechaEntrega: row.fechaEntrega,
            horaEntrega: row.horaEntrega,
            contactoOrigen: row.contactoOrigen,
            contactoDestino: row.contactoDestino,
            observaciones: row.observaciones,
          };

          const loadData = await buildLoadPayload(
            formData,
            row.empresaTransportistaId,
            false
          );

          return await createLoad(loadData);
        })
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (successful > 0) {
        toast.success(`${successful} carga(s) creada(s) exitosamente`);
      }
      if (failed > 0) {
        toast.error(`${failed} carga(s) fallaron al crear`);
      }

      if (successful > 0) {
        onSuccess();
        onHide();
      }
    } catch (err: any) {
      toast.error(err?.message || "Error al guardar las cargas");
    } finally {
      setSaving(false);
    }
  };

  const VEHICLE_TYPES = [
    "Moto (Entregas rápidas)",
    "Moto con caja (Paquetería ligera)",
    "Auto (E-commerce ligero)",
    "Pickup 0.5t (Carga mediana)",
    "Pickup 1t (Carga mayor)",
    "Van chica (Paquetería)",
    "Van mediana (1.2–1.8t)",
    "Camioneta 1.5t (Distribución local)",
    "Camioneta 2.5t (Logística media)",
    "Camioneta 3.5t (Logística pesada)",
    "Camión torton (Carga regional)",
    "Tráiler (Transporte nacional)",
  ];

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Crear Cargas Masivas (Máximo {MAX_ROWS})</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <div className="mb-3">
          <Button variant="outline-primary" onClick={addRow} disabled={rows.length >= MAX_ROWS}>
            <i className="fas fa-plus"></i> Agregar Fila
          </Button>
          <span className="ms-2 text-muted">
            {rows.length} / {MAX_ROWS} cargas
          </span>
        </div>

        {rows.length === 0 ? (
          <Alert variant="info" className="text-center">
            <p>Haz clic en "Agregar Fila" para comenzar a crear cargas masivas</p>
          </Alert>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th>Folio *</th>
                  <th>Transportista *</th>
                  <th>Tipo Carga *</th>
                  <th>Origen *</th>
                  <th>Destino/Cliente</th>
                  <th>Descripción *</th>
                  <th>Tipo Vehículo *</th>
                  <th>Tipo (Seco/Cong/Comb) *</th>
                  <th>Fecha Carga *</th>
                  <th>Hora Carga *</th>
                  <th>Fecha Entrega *</th>
                  <th>Hora Entrega *</th>
                  <th style={{ width: "50px" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className={errors[index] ? "table-danger" : ""}>
                    <td>{index + 1}</td>
                    <td>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={row.folio}
                        onChange={(e) => updateRow(index, "folio", e.target.value)}
                        className={errors[index]?.includes("folio") ? "border-danger" : ""}
                        placeholder="Folio"
                      />
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={row.empresaTransportistaId}
                        onChange={(e) =>
                          handleSelectChange(index, "empresaTransportista", e.target.value)
                        }
                        className={errors[index]?.includes("empresaTransportista") ? "border-danger" : ""}
                      >
                        <option value="">Seleccionar...</option>
                        {transportistas.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={row.tipoCarga}
                        onChange={(e) =>
                          handleSelectChange(index, "tipoCarga", e.target.value)
                        }
                        className={errors[index]?.includes("tipoCarga") ? "border-danger" : ""}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="cliente">Cliente</option>
                        <option value="viaje_propio">Viaje Propio</option>
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={row.origenId}
                        onChange={(e) =>
                          handleSelectChange(index, "origen", e.target.value)
                        }
                        className={errors[index]?.includes("origen") ? "border-danger" : ""}
                        disabled={loadingBranches}
                      >
                        <option value="">Seleccionar...</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      {row.tipoCarga === "cliente" ? (
                        <Form.Control
                          type="text"
                          size="sm"
                          value={row.nombreCliente}
                          onChange={(e) => updateRow(index, "nombreCliente", e.target.value)}
                          className={errors[index]?.includes("nombreCliente") ? "border-danger" : ""}
                          placeholder="Nombre cliente"
                        />
                      ) : (
                        <Form.Control
                          type="text"
                          size="sm"
                          value={row.destino}
                          onChange={(e) => updateRow(index, "destino", e.target.value)}
                          className={errors[index]?.includes("destino") ? "border-danger" : ""}
                          placeholder="Destino"
                        />
                      )}
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={row.descripcion}
                        onChange={(e) => updateRow(index, "descripcion", e.target.value)}
                        className={errors[index]?.includes("descripcion") ? "border-danger" : ""}
                        placeholder="Descripción"
                      />
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={row.tipoVehiculo}
                        onChange={(e) => updateRow(index, "tipoVehiculo", e.target.value)}
                        className={errors[index]?.includes("tipoVehiculo") ? "border-danger" : ""}
                      >
                        <option value="">Seleccionar...</option>
                        {VEHICLE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={row.tipoCargaTransporte}
                        onChange={(e) => updateRow(index, "tipoCargaTransporte", e.target.value)}
                        className={errors[index]?.includes("tipoCargaTransporte") ? "border-danger" : ""}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="seco">Seco</option>
                        <option value="congelado">Congelado</option>
                        <option value="combinado">Combinado</option>
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={row.fechaCarga}
                        onChange={(e) => updateRow(index, "fechaCarga", e.target.value)}
                        className={errors[index]?.includes("fechaCarga") ? "border-danger" : ""}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="time"
                        size="sm"
                        value={row.horaCarga}
                        onChange={(e) => updateRow(index, "horaCarga", e.target.value)}
                        className={errors[index]?.includes("horaCarga") ? "border-danger" : ""}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={row.fechaEntrega}
                        onChange={(e) => updateRow(index, "fechaEntrega", e.target.value)}
                        className={errors[index]?.includes("fechaEntrega") ? "border-danger" : ""}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="time"
                        size="sm"
                        value={row.horaEntrega}
                        onChange={(e) => updateRow(index, "horaEntrega", e.target.value)}
                        className={errors[index]?.includes("horaEntrega") ? "border-danger" : ""}
                      />
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeRow(index)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving || rows.length === 0}>
          {saving ? (
            <>
              <Spinner size="sm" className="me-2" />
              Guardando...
            </>
          ) : (
            `Guardar ${rows.length} Carga(s)`
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateBulkLoadsModal;

