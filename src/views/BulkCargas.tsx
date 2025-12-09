import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Container,
  Card,
  Button,
  Table,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useLoadsService } from "../api/loads";
import { useBranchesService, type Branch } from "../api/branches";
import { useProvidersService, type Provider } from "../api/providers";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { buildLoadPayload } from "../utils/loadFormPayload";
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

const BulkCargas: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createLoad } = useLoadsService();
  
  // Determinar el prefijo de ruta (admin o maestro)
  const routePrefix = location.pathname.startsWith("/admin") ? "/admin" : "/maestro";
  const { fetchBranches } = useBranchesService();
  const { fetchProviders } = useProvidersService();
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const authLoading = useSelector((s: RootState) => s.auth.loading);

  // Inicializar con 10 filas vacías
  const initialRows: BulkLoadRow[] = Array.from({ length: MAX_ROWS }, () => ({
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
  }));

  const [rows, setRows] = useState<BulkLoadRow[]>(initialRows);
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
    if (!authLoading && currentUser?.company_id && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadBranches();
      loadTransportistas();
    }
  }, [authLoading, currentUser?.company_id]);

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

  const clearRow = (index: number) => {
    const newRows = [...rows];
    newRows[index] = {
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
    };
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
    // Filtrar solo las filas que tienen al menos un campo lleno
    const filledRows = rows.filter((row) => 
      row.folio.trim() || 
      row.empresaTransportistaId || 
      row.tipoCarga || 
      row.origenId || 
      row.descripcion.trim()
    );

    if (filledRows.length === 0) {
      toast.error("Debes completar al menos una carga");
      return;
    }

    // Validar solo las filas que tienen datos
    const rowsToValidate = rows.map((row, index) => {
      const hasData = row.folio.trim() || row.empresaTransportistaId || row.tipoCarga || row.origenId || row.descripcion.trim();
      return hasData ? row : null;
    }).filter(Boolean) as BulkLoadRow[];

    if (rowsToValidate.length === 0) {
      toast.error("Debes completar al menos una carga");
      return;
    }

    // Validar solo las filas con datos
    const allErrors: Record<number, string[]> = {};
    let isValid = true;
    
    rows.forEach((row, index) => {
      const hasData = row.folio.trim() || row.empresaTransportistaId || row.tipoCarga || row.origenId || row.descripcion.trim();
      if (hasData) {
        const rowErrors = validateRow(row, index);
        if (rowErrors.length > 0) {
          allErrors[index] = rowErrors;
          isValid = false;
        }
      }
    });
    
    if (!isValid) {
      setErrors(allErrors);
      toast.error("Por favor completa todos los campos obligatorios en las filas que has iniciado");
      return;
    }

    if (!currentUser?.company_id) {
      toast.error("No se pudo obtener el ID de la empresa");
      return;
    }

    setSaving(true);

    try {
      // Filtrar solo las filas que tienen datos completos
      const rowsToSave = rows.filter((row) => 
        row.folio.trim() && 
        row.empresaTransportistaId && 
        row.tipoCarga && 
        row.origenId && 
        row.descripcion.trim()
      );

      const results = await Promise.allSettled(
        rowsToSave.map(async (row) => {
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
        navigate(`${routePrefix}/cargas`);
      }
      if (failed > 0) {
        toast.error(`${failed} carga(s) fallaron al crear`);
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
    <Container fluid style={{ padding: "20px" }}>
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <Card.Title as="h4" className="mb-0 text-white">
              <i className="fas fa-layer-group me-2"></i>
              Crear Cargas Masivas (Máximo {MAX_ROWS})
            </Card.Title>
            <Button variant="light" onClick={() => navigate(`${routePrefix}/cargas`)}>
              <i className="fas fa-arrow-left me-2"></i>Volver a Cargas
            </Button>
          </div>
        </Card.Header>

        <Card.Body style={{ padding: "30px" }}>
          <div className="mb-4">
            <Alert variant="info" className="mb-3">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Instrucciones:</strong> Completa las filas que necesites (máximo {MAX_ROWS}). Las filas vacías serán ignoradas al guardar.
            </Alert>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted">
                <i className="fas fa-table me-2"></i>
                <strong>{rows.filter(r => r.folio.trim() || r.empresaTransportistaId || r.tipoCarga || r.origenId || r.descripcion.trim()).length}</strong> de {MAX_ROWS} filas con datos
              </span>
              <Button variant="outline-secondary" size="sm" onClick={() => {
                setRows(initialRows);
                setErrors({});
                toast.success("Todas las filas han sido limpiadas");
              }}>
                <i className="fas fa-redo me-2"></i> Limpiar Todo
              </Button>
            </div>
          </div>

          <div style={{ overflowX: "auto", overflowY: "visible", maxHeight: "75vh" }}>
            <Table striped bordered hover responsive className="mb-0" style={{ minWidth: "1600px", fontSize: "14px" }}>
              <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ width: "60px", textAlign: "center", padding: "12px 8px" }}>#</th>
                  <th style={{ minWidth: "130px", padding: "12px 8px" }}>Folio *</th>
                  <th style={{ minWidth: "200px", padding: "12px 8px" }}>Transportista *</th>
                  <th style={{ minWidth: "150px", padding: "12px 8px" }}>Tipo Carga *</th>
                  <th style={{ minWidth: "200px", padding: "12px 8px" }}>Origen *</th>
                  <th style={{ minWidth: "200px", padding: "12px 8px" }}>Destino/Cliente</th>
                  <th style={{ minWidth: "220px", padding: "12px 8px" }}>Descripción *</th>
                  <th style={{ minWidth: "240px", padding: "12px 8px" }}>Tipo Vehículo *</th>
                  <th style={{ minWidth: "180px", padding: "12px 8px" }}>Tipo (Seco/Cong/Comb) *</th>
                  <th style={{ minWidth: "150px", padding: "12px 8px" }}>Fecha Carga *</th>
                  <th style={{ minWidth: "130px", padding: "12px 8px" }}>Hora Carga *</th>
                  <th style={{ minWidth: "150px", padding: "12px 8px" }}>Fecha Entrega *</th>
                  <th style={{ minWidth: "130px", padding: "12px 8px" }}>Hora Entrega *</th>
                  <th style={{ width: "90px", textAlign: "center", padding: "12px 8px" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className={errors[index] ? "table-danger" : ""} style={{ minHeight: "65px" }}>
                    <td style={{ textAlign: "center", verticalAlign: "middle", fontWeight: "bold", padding: "12px 8px" }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <Form.Control
                        type="text"
                        value={row.folio}
                        onChange={(e) => updateRow(index, "folio", e.target.value)}
                        className={errors[index]?.includes("folio") ? "border-danger" : ""}
                        placeholder="Folio"
                        style={{ minWidth: "110px", padding: "8px" }}
                      />
                    </td>
                    <td style={{ padding: "8px" }}>
                      <Form.Select
                        value={row.empresaTransportistaId}
                        onChange={(e) =>
                          handleSelectChange(index, "empresaTransportista", e.target.value)
                        }
                        className={errors[index]?.includes("empresaTransportista") ? "border-danger" : ""}
                        style={{ minWidth: "180px", padding: "8px" }}
                      >
                        <option value="">Seleccionar...</option>
                        {transportistas.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td style={{ padding: "8px" }}>
                      <Form.Select
                        value={row.tipoCarga}
                        onChange={(e) =>
                          handleSelectChange(index, "tipoCarga", e.target.value)
                        }
                        className={errors[index]?.includes("tipoCarga") ? "border-danger" : ""}
                        style={{ minWidth: "130px", padding: "8px" }}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="cliente">Cliente</option>
                        <option value="viaje_propio">Viaje Propio</option>
                      </Form.Select>
                    </td>
                    <td style={{ padding: "8px" }}>
                      <Form.Select
                        value={row.origenId}
                        onChange={(e) =>
                          handleSelectChange(index, "origen", e.target.value)
                        }
                        className={errors[index]?.includes("origen") ? "border-danger" : ""}
                        disabled={loadingBranches}
                        style={{ minWidth: "180px", padding: "8px" }}
                      >
                        <option value="">Seleccionar...</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td style={{ padding: "8px" }}>
                      {row.tipoCarga === "cliente" ? (
                        <Form.Control
                          type="text"
                          value={row.nombreCliente}
                          onChange={(e) => updateRow(index, "nombreCliente", e.target.value)}
                          className={errors[index]?.includes("nombreCliente") ? "border-danger" : ""}
                          placeholder="Nombre cliente"
                          style={{ minWidth: "180px", padding: "8px" }}
                        />
                      ) : (
                        <Form.Control
                          type="text"
                          value={row.destino}
                          onChange={(e) => updateRow(index, "destino", e.target.value)}
                          className={errors[index]?.includes("destino") ? "border-danger" : ""}
                          placeholder="Destino"
                          style={{ minWidth: "180px", padding: "8px" }}
                        />
                      )}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <Form.Control
                        type="text"
                        value={row.descripcion}
                        onChange={(e) => updateRow(index, "descripcion", e.target.value)}
                        className={errors[index]?.includes("descripcion") ? "border-danger" : ""}
                        placeholder="Descripción"
                        style={{ minWidth: "200px", padding: "8px" }}
                      />
                    </td>
                    <td style={{ padding: "8px" }}>
                      <Form.Select
                        value={row.tipoVehiculo}
                        onChange={(e) => updateRow(index, "tipoVehiculo", e.target.value)}
                        className={errors[index]?.includes("tipoVehiculo") ? "border-danger" : ""}
                        style={{ minWidth: "220px", padding: "8px" }}
                      >
                        <option value="">Seleccionar...</option>
                        {VEHICLE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td style={{ padding: "8px" }}>
                      <Form.Select
                        value={row.tipoCargaTransporte}
                        onChange={(e) => updateRow(index, "tipoCargaTransporte", e.target.value)}
                        className={errors[index]?.includes("tipoCargaTransporte") ? "border-danger" : ""}
                        style={{ minWidth: "160px", padding: "8px" }}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="seco">Seco</option>
                        <option value="congelado">Congelado</option>
                        <option value="combinado">Combinado</option>
                      </Form.Select>
                    </td>
                    <td style={{ padding: "8px" }}>
                      <Form.Control
                        type="date"
                        value={row.fechaCarga}
                        onChange={(e) => updateRow(index, "fechaCarga", e.target.value)}
                        className={errors[index]?.includes("fechaCarga") ? "border-danger" : ""}
                        min={new Date().toISOString().split("T")[0]}
                        style={{ minWidth: "130px", padding: "8px" }}
                      />
                    </td>
                    <td style={{ padding: "8px" }}>
                      <Form.Control
                        type="time"
                        value={row.horaCarga}
                        onChange={(e) => updateRow(index, "horaCarga", e.target.value)}
                        className={errors[index]?.includes("horaCarga") ? "border-danger" : ""}
                        style={{ minWidth: "110px", padding: "8px" }}
                      />
                    </td>
                    <td style={{ padding: "8px" }}>
                      <Form.Control
                        type="date"
                        value={row.fechaEntrega}
                        onChange={(e) => updateRow(index, "fechaEntrega", e.target.value)}
                        className={errors[index]?.includes("fechaEntrega") ? "border-danger" : ""}
                        min={new Date().toISOString().split("T")[0]}
                        style={{ minWidth: "130px", padding: "8px" }}
                      />
                    </td>
                    <td style={{ padding: "8px" }}>
                      <Form.Control
                        type="time"
                        value={row.horaEntrega}
                        onChange={(e) => updateRow(index, "horaEntrega", e.target.value)}
                        className={errors[index]?.includes("horaEntrega") ? "border-danger" : ""}
                        style={{ minWidth: "110px", padding: "8px" }}
                      />
                    </td>
                    <td style={{ textAlign: "center", verticalAlign: "middle", padding: "8px" }}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => clearRow(index)}
                        title="Limpiar fila"
                        style={{ padding: "6px 12px" }}
                      >
                        <i className="fas fa-eraser"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="mt-4 d-flex justify-content-between align-items-center">
            <div>
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Solo se guardarán las filas que tengan todos los campos obligatorios completos
              </small>
            </div>
            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={() => navigate(`${routePrefix}/cargas`)} disabled={saving}>
                <i className="fas fa-times me-2"></i>Cancelar
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Guardar Cargas
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BulkCargas;

