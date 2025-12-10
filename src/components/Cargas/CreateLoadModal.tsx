import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Spinner,
  Card,
} from "react-bootstrap";
import { Formik } from "formik";
import { useLoadsService } from "../../api/loads";
import { useBranchesService, type Branch } from "../../api/branches";
import { useProvidersService, type Provider } from "../../api/providers";
import { useUnitsService } from "../../api/unit";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { LoadSchema } from "../../validation/schema";
import { buildLoadPayload } from "../../utils/loadFormPayload";
import { normalizeGoogleMapsLink } from "../../utils/googleMapsUtils";
import toast from "react-hot-toast";
import "./CreateLoadModal.css";

type FormData = {
  folio: string;
  empresaTransportista: string;
  tipoTransporte: string;
  unidadPropia: string;
  tipoCarga: string;
  tipoVehiculo: string;
  tipoCargaTransporte: string;
  origen: string;
  destino: string;
  nombreCliente: string;
  linkUbicacionCliente: string;
  descripcion: string;
  peso: string;
  volumen: string;
  fechaCarga: string;
  horaCarga: string;
  fechaEntrega: string;
  horaEntrega: string;
  contactoOrigen: string;
  contactoDestino: string;
  observaciones: string;
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
] as const;

interface Props {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const CreateLoadModal: React.FC<Props> = ({ show, onHide, onSuccess }) => {
  const { createLoad } = useLoadsService();
  const { fetchBranches } = useBranchesService();
  const { fetchProviders, acceptAgreement } = useProvidersService();
  const { fetchUnits } = useUnitsService();
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const authLoading = useSelector((s: RootState) => s.auth.loading);

  const initialValues: FormData = {
    folio: "",
    empresaTransportista: "",
    tipoTransporte: "",
    unidadPropia: "",
    tipoCarga: "",
    tipoVehiculo: "",
    tipoCargaTransporte: "",
    origen: "",
    destino: "",
    nombreCliente: "",
    linkUbicacionCliente: "",
    descripcion: "",
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

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [transportistas, setTransportistas] = useState<Provider[]>([]);
  const [loadingTransportistas, setLoadingTransportistas] = useState(false);
  const [unidadesPropias, setUnidadesPropias] = useState<any[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [tieneUnidadesPropias, setTieneUnidadesPropias] = useState(false);

  const [selectedOrigin, setSelectedOrigin] = useState<Branch | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Branch | null>(null);
  const [selectedTransportista, setSelectedTransportista] = useState<Provider | null>(null);
  const [selectedUnidad, setSelectedUnidad] = useState<any | null>(null);

  const [showOriginModal, setShowOriginModal] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [showTransportistaModal, setShowTransportistaModal] = useState(false);
  const [showUnidadModal, setShowUnidadModal] = useState(false);
  const [showTipoVehiculoModal, setShowTipoVehiculoModal] = useState(false);

  const [saving, setSaving] = useState(false);
  const loadingRef = useRef(false);
  const loadingBranchesRef = useRef(false);
  const loadingTransportistasRef = useRef(false);
  const loadingUnidadesRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const setFieldValueRef = useRef<((field: string, value: any) => void) | null>(null);

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
      if (allBranches.length === 0) {
        console.warn("No hay sucursales disponibles para esta empresa");
      }
    } catch (err: any) {
      // Si el error es 404 o "No branches found", es normal si no hay sucursales
      const errorMessage = err?.message || err?.response?.data?.message || "";
      if (err?.status === 404 || errorMessage.includes("No branches found")) {
        console.warn("No hay sucursales registradas para esta empresa");
        setBranches([]);
      } else {
        console.error("Error cargando sucursales:", err);
        toast.error("Error al cargar sucursales");
        setBranches([]);
      }
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
      
      console.log("Response completo de providers:", response);
      
      if (!response) {
        console.warn("Response es null o undefined");
        setTransportistas([]);
      } else {
        // Combinar acuerdos activos y pendientes
        const activeProviders = response?.active || [];
        const pendingProviders = response?.pending || [];
        
        console.log("Active providers:", activeProviders);
        console.log("Pending providers:", pendingProviders);
        
        // Combinar todos los acuerdos (activos y pendientes)
        const allAgreements = [...activeProviders, ...pendingProviders];
        
        console.log("Total acuerdos:", allAgreements.length);
        console.log("Detalles de acuerdos:", allAgreements);
        
        if (allAgreements.length === 0) {
          console.warn("No hay acuerdos disponibles");
          setTransportistas([]);
        } else {
          // Filtrar proveedores: necesitamos acuerdos donde la compañía relacionada es PROVIDER
          // Esto significa que mi compañía es SELLER y la otra es TRANSPORTER (PROVIDER)
          const providers: Provider[] = allAgreements
            .filter((p: any) => {
              if (!p) {
                console.log("Agreement es null/undefined");
                return false;
              }
              
              const isProvider = p.related_company_role === "PROVIDER";
              const hasId = !!p.related_company_id;
              const hasName = !!p.related_company_name;
              
              console.log("Evaluando agreement:", {
                agreement_id: p.agreement_id,
                my_role: p.my_role,
                related_company_role: p.related_company_role,
                related_company_id: p.related_company_id,
                related_company_name: p.related_company_name,
                status: p.status,
                isProvider,
                hasId,
                hasName,
                passes: isProvider && hasId && hasName,
              });
              
              return isProvider && hasId && hasName;
            })
            .map((p: any) => {
              console.log("Mapeando provider:", p.related_company_name);
              return {
                id: p.related_company_id,
                name: p.related_company_name,
                legal_name: p.related_company_name,
                agreement_id: p.agreement_id,
                agreement_status: p.status || "active",
              };
            });

          console.log("Transportistas finales cargados:", providers.length);
          console.log("Transportistas:", providers);
          
          if (providers.length === 0 && allAgreements.length > 0) {
            console.warn("Hay acuerdos pero ninguno es PROVIDER. Detalles:", 
              allAgreements.map((a: any) => ({
                my_role: a.my_role,
                related_company_role: a.related_company_role,
                name: a.related_company_name,
                status: a.status,
              }))
            );
          }
          
          setTransportistas(providers);
        }
      }
    } catch (err: any) {
      console.error("Error al cargar transportistas:", err);
      console.error("Error completo:", JSON.stringify(err, null, 2));
      toast.error("Error al cargar transportistas");
      setTransportistas([]);
    } finally {
      setLoadingTransportistas(false);
      loadingTransportistasRef.current = false;
    }
  }, [fetchProviders, currentUser?.company_id]);

  const loadUnidadesPropias = useCallback(async () => {
    if (!currentUser?.company_id || loadingUnidadesRef.current) return;
    loadingUnidadesRef.current = true;
    setLoadingUnidades(true);
    try {
      const response = await fetchUnits();
      const activeUnits = response?.active || [];
      setUnidadesPropias(activeUnits);
      setTieneUnidadesPropias(activeUnits.length > 0);
    } catch (err: any) {
      console.error("Error al cargar unidades propias:", err);
      setUnidadesPropias([]);
      setTieneUnidadesPropias(false);
    } finally {
      setLoadingUnidades(false);
      loadingUnidadesRef.current = false;
    }
  }, [fetchUnits, currentUser?.company_id]);

  useEffect(() => {
    // Solo ejecutar si el modal está abierto, auth no está cargando, hay usuario con company_id, y no está cargando
    if (show && !authLoading && currentUser?.company_id && !loadingRef.current && !hasLoadedRef.current) {
      loadingRef.current = true;
      hasLoadedRef.current = true;
      
      // Llamar directamente a las funciones en lugar de usar loadAll para evitar dependencias
      Promise.all([
        loadBranches(),
        loadTransportistas(),
        loadUnidadesPropias()
      ]).finally(() => {
        loadingRef.current = false;
      });
    } else if (!show) {
      // Reset cuando el modal se cierra
      loadingRef.current = false;
      hasLoadedRef.current = false;
      setSelectedOrigin(null);
      setSelectedDestination(null);
      setSelectedTransportista(null);
      setSelectedUnidad(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, authLoading, currentUser?.company_id]);

  const handleTipoTransporteChange = (tipo: string, setFieldValue: (field: string, value: any) => void) => {
    setFieldValue("tipoTransporte", tipo);
    setFieldValue("empresaTransportista", "");
    setFieldValue("unidadPropia", "");
    setSelectedTransportista(null);
    setSelectedUnidad(null);
  };

  const handleTipoCargaChange = (tipo: string, setFieldValue: (field: string, value: any) => void) => {
    setFieldValue("tipoCarga", tipo);
    setFieldValue("destino", "");
    setFieldValue("nombreCliente", "");
    setFieldValue("linkUbicacionCliente", "");
    setSelectedDestination(null);
  };

  const handleOriginSelect = (branch: Branch, setFieldValue: (field: string, value: any) => void) => {
    setSelectedOrigin(branch);
    setFieldValue("origen", branch.name);
    setShowOriginModal(false);
  };

  const handleDestinationSelect = (branch: Branch, setFieldValue: (field: string, value: any) => void) => {
    setSelectedDestination(branch);
    setFieldValue("destino", branch.name);
    setShowDestinationModal(false);
  };

  const handleTransportistaSelect = async (
    transportista: Provider,
    setFieldValue: (field: string, value: any) => void
  ) => {
    // Si el acuerdo está pendiente, aceptarlo automáticamente
    if (transportista.agreement_status === "pending" && transportista.agreement_id) {
      try {
        await acceptAgreement(transportista.agreement_id);
        toast.success(`Acuerdo con ${transportista.name} aceptado exitosamente`);
        // Recargar la lista de transportistas para actualizar el estado
        await loadTransportistas();
      } catch (err: any) {
        console.error("Error al aceptar acuerdo:", err);
        toast.error(err?.message || "Error al aceptar el acuerdo");
        return; // No continuar si falla la aceptación
      }
    }
    
    setSelectedTransportista(transportista);
    setFieldValue("empresaTransportista", transportista.name);
    setShowTransportistaModal(false);
  };

  const handleUnidadSelect = (unidad: any, setFieldValue: (field: string, value: any) => void) => {
    setSelectedUnidad(unidad);
    const unidadName =
      unidad.plates || unidad.unit_identifier || unidad.box_number || "Unidad";
    setFieldValue("unidadPropia", unidadName);
    setShowUnidadModal(false);
  };

  const handleTipoVehiculoSelect = (tipo: string, setFieldValue: (field: string, value: any) => void) => {
    setFieldValue("tipoVehiculo", tipo);
    setShowTipoVehiculoModal(false);
  };

  const getAvailableDestinations = (): Branch[] => {
    if (!selectedOrigin) return branches;
    return branches.filter((branch) => branch.id !== selectedOrigin.id);
  };

  const handleLinkBlur = async (link: string, setFieldValue: (field: string, value: any) => void) => {
    if (!link) return;
    try {
      const normalizedLink = await normalizeGoogleMapsLink(link);
      if (normalizedLink && normalizedLink !== link) {
        setFieldValue("linkUbicacionCliente", normalizedLink);
      }
    } catch (error) {
      console.error("Error normalizando link:", error);
    }
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };


  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        size="lg"
        centered
        dialogClassName="create-load-modal-dialog"
        onEntered={() => {
          const modalDialog = document.querySelector(
            ".create-load-modal-dialog"
          ) as HTMLElement;
          if (modalDialog) {
            modalDialog.style.setProperty("transform", "none", "important");
            modalDialog.style.setProperty("-webkit-transform", "none", "important");
            modalDialog.style.setProperty("-o-transform", "none", "important");
            modalDialog.style.setProperty("margin-top", "15px", "important");
          }
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Nueva Carga</Modal.Title>
        </Modal.Header>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={LoadSchema(tieneUnidadesPropias)}
          onSubmit={async (values, { setSubmitting }) => {
            if (!currentUser?.company_id) {
              toast.error("No se pudo obtener el ID de la empresa");
              setSubmitting(false);
              return;
            }

            setSaving(true);

            try {
              const loadData = await buildLoadPayload(
                values,
                selectedTransportista?.id,
                tieneUnidadesPropias
              );

              await createLoad(loadData);
              toast.success("Carga registrada exitosamente");
              onSuccess();
              onHide();
            } catch (err: any) {
              toast.error(err?.message || "Error al guardar la carga");
            } finally {
              setSaving(false);
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleSubmit, setFieldValue, isSubmitting }) => {
            // Guardar setFieldValue en ref para usarlo en los modales
            setFieldValueRef.current = setFieldValue;
            return (
              <>
                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  <Form>
            <Card className="mb-3">
              <Card.Header>
                <strong>Información Básica</strong>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Folio de carga *</Form.Label>
                  <Form.Control
                    type="text"
                    name="folio"
                    value={values.folio}
                    onChange={handleChange}
                    isInvalid={touched.folio && !!errors.folio}
                    placeholder="Folio de carga"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.folio as string}
                  </Form.Control.Feedback>
                </Form.Group>

                {tieneUnidadesPropias && (
                  <>
                    <Form.Label>Tipo de Transporte *</Form.Label>
                    <div className="mb-3">
                      <Form.Check
                        type="radio"
                        label="Unidades Propias"
                        name="tipoTransporte"
                        value="unidades_propias"
                        checked={values.tipoTransporte === "unidades_propias"}
                        onChange={(e) =>
                          handleTipoTransporteChange(e.target.value, setFieldValue)
                        }
                      />
                      <Form.Check
                        type="radio"
                        label="Empresa Transport"
                        name="tipoTransporte"
                        value="empresa_transport"
                        checked={values.tipoTransporte === "empresa_transport"}
                        onChange={(e) =>
                          handleTipoTransporteChange(e.target.value, setFieldValue)
                        }
                      />
                    </div>
                    {touched.tipoTransporte && errors.tipoTransporte && (
                      <div className="text-danger small mb-3">{errors.tipoTransporte as string}</div>
                    )}
                  </>
                )}

                {(!tieneUnidadesPropias ||
                  values.tipoTransporte === "empresa_transport") && (
                  <Form.Group className="mb-3">
                    <Form.Label>Empresa Transportista *</Form.Label>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => setShowTransportistaModal(true)}
                      className={`w-100 text-start ${touched.empresaTransportista && errors.empresaTransportista ? 'border-danger' : ''}`}
                      disabled={loadingTransportistas}
                    >
                      {values.empresaTransportista || "Seleccionar transportista"}
                      <i className="fas fa-chevron-down float-end mt-1"></i>
                    </Button>
                    {touched.empresaTransportista && errors.empresaTransportista && (
                      <div className="text-danger small mt-1">{errors.empresaTransportista as string}</div>
                    )}
                  </Form.Group>
                )}

                {values.tipoTransporte === "unidades_propias" && (
                  <Form.Group className="mb-3">
                    <Form.Label>Unidad Propia *</Form.Label>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => setShowUnidadModal(true)}
                      className={`w-100 text-start ${touched.unidadPropia && errors.unidadPropia ? 'border-danger' : ''}`}
                      disabled={loadingUnidades}
                    >
                      {values.unidadPropia || "Seleccionar unidad"}
                      <i className="fas fa-chevron-down float-end mt-1"></i>
                    </Button>
                    {touched.unidadPropia && errors.unidadPropia && (
                      <div className="text-danger small mt-1">{errors.unidadPropia as string}</div>
                    )}
                  </Form.Group>
                )}

                <Form.Label>Tipo de Carga *</Form.Label>
                <div className="mb-3">
                  <Form.Check
                    type="radio"
                    label="Cliente"
                    name="tipoCarga"
                    value="cliente"
                    checked={values.tipoCarga === "cliente"}
                    onChange={(e) => handleTipoCargaChange(e.target.value, setFieldValue)}
                  />
                  <Form.Check
                    type="radio"
                    label="Viaje Propio"
                    name="tipoCarga"
                    value="viaje_propio"
                    checked={values.tipoCarga === "viaje_propio"}
                    onChange={(e) => handleTipoCargaChange(e.target.value, setFieldValue)}
                  />
                </div>
                {touched.tipoCarga && errors.tipoCarga && (
                  <div className="text-danger small mb-3">{errors.tipoCarga as string}</div>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Vehículo *</Form.Label>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => setShowTipoVehiculoModal(true)}
                    className={`w-100 text-start ${touched.tipoVehiculo && errors.tipoVehiculo ? 'border-danger' : ''}`}
                  >
                    {values.tipoVehiculo || "Seleccionar tipo de vehículo"}
                    <i className="fas fa-chevron-down float-end mt-1"></i>
                  </Button>
                  {touched.tipoVehiculo && errors.tipoVehiculo && (
                    <div className="text-danger small mt-1">{errors.tipoVehiculo as string}</div>
                  )}
                </Form.Group>

                <Form.Label>Tipo de Carga (Seco/Congelado/Combinado) *</Form.Label>
                <div className="mb-3">
                  <Form.Check
                    type="radio"
                    label="Seco"
                    name="tipoCargaTransporte"
                    value="seco"
                    checked={values.tipoCargaTransporte === "seco"}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="radio"
                    label="Congelado"
                    name="tipoCargaTransporte"
                    value="congelado"
                    checked={values.tipoCargaTransporte === "congelado"}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="radio"
                    label="Combinado"
                    name="tipoCargaTransporte"
                    value="combinado"
                    checked={values.tipoCargaTransporte === "combinado"}
                    onChange={handleChange}
                  />
                </div>
                {touched.tipoCargaTransporte && errors.tipoCargaTransporte && (
                  <div className="text-danger small mb-3">{errors.tipoCargaTransporte as string}</div>
                )}

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Form.Label>Origen *</Form.Label>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={loadBranches}
                    disabled={loadingBranches}
                  >
                    {loadingBranches ? (
                      <Spinner size="sm" />
                    ) : (
                      <i className="fas fa-sync-alt"></i>
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => setShowOriginModal(true)}
                  className={`w-100 text-start mb-3 ${touched.origen && errors.origen ? 'border-danger' : ''}`}
                  disabled={loadingBranches}
                >
                  {values.origen || "Seleccionar origen"}
                  <i className="fas fa-chevron-down float-end mt-1"></i>
                </Button>
                {touched.origen && errors.origen && (
                  <div className="text-danger small mb-3">{errors.origen as string}</div>
                )}

                {values.tipoCarga === "cliente" && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Destino - Cliente</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombreCliente"
                        value={values.nombreCliente}
                        onChange={handleChange}
                        isInvalid={touched.nombreCliente && !!errors.nombreCliente}
                        placeholder="Nombre del cliente *"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.nombreCliente as string}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="text"
                        name="linkUbicacionCliente"
                        value={values.linkUbicacionCliente}
                        onChange={handleChange}
                        onBlur={(e) => handleLinkBlur(e.target.value, setFieldValue)}
                        placeholder="Link de ubicación del cliente"
                      />
                    </Form.Group>
                  </>
                )}

                {values.tipoCarga === "viaje_propio" && (
                  <Form.Group className="mb-3">
                    <Form.Label>Destino *</Form.Label>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => setShowDestinationModal(true)}
                      className={`w-100 text-start ${touched.destino && errors.destino ? 'border-danger' : ''}`}
                      disabled={loadingBranches || !selectedOrigin}
                    >
                      {values.destino || "Seleccionar destino"}
                      <i className="fas fa-chevron-down float-end mt-1"></i>
                    </Button>
                    {touched.destino && errors.destino && (
                      <div className="text-danger small mt-1">{errors.destino as string}</div>
                    )}
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Descripción de la carga *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descripcion"
                    value={values.descripcion}
                    onChange={handleChange}
                    isInvalid={touched.descripcion && !!errors.descripcion}
                    placeholder="Descripción de la carga"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.descripcion as string}
                  </Form.Control.Feedback>
                  {values.tipoCargaTransporte && (
                    <Form.Text className="text-muted">
                      Se agregará automáticamente: (Carga:{" "}
                      {values.tipoCargaTransporte === "seco"
                        ? "Seco"
                        : values.tipoCargaTransporte === "congelado"
                        ? "Congelado"
                        : "Combinado"}
                      {values.tipoCargaTransporte === "combinado" && ", se necesita mampara"}
                      )
                    </Form.Text>
                  )}
                </Form.Group>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Peso (opcional)</Form.Label>
                      <Form.Control
                        type="text"
                        name="peso"
                        value={values.peso}
                        onChange={handleChange}
                        placeholder="Peso"
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Volumen (opcional)</Form.Label>
                      <Form.Control
                        type="text"
                        name="volumen"
                        value={values.volumen}
                        onChange={handleChange}
                        placeholder="Volumen"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header>
                <strong>Fechas y Horas</strong>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de carga *</Form.Label>
                      <Form.Control
                        type="date"
                        name="fechaCarga"
                        value={values.fechaCarga}
                        onChange={handleChange}
                        isInvalid={touched.fechaCarga && !!errors.fechaCarga}
                        min={formatDateForInput(new Date())}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.fechaCarga as string}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Hora de carga *</Form.Label>
                      <Form.Control
                        type="time"
                        name="horaCarga"
                        value={values.horaCarga}
                        onChange={handleChange}
                        isInvalid={touched.horaCarga && !!errors.horaCarga}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.horaCarga as string}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de entrega *</Form.Label>
                      <Form.Control
                        type="date"
                        name="fechaEntrega"
                        value={values.fechaEntrega}
                        onChange={handleChange}
                        isInvalid={touched.fechaEntrega && !!errors.fechaEntrega}
                        min={formatDateForInput(new Date())}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.fechaEntrega as string}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Hora de entrega *</Form.Label>
                      <Form.Control
                        type="time"
                        name="horaEntrega"
                        value={values.horaEntrega}
                        onChange={handleChange}
                        isInvalid={touched.horaEntrega && !!errors.horaEntrega}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.horaEntrega as string}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header>
                <strong>Contactos (Opcional)</strong>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Contacto origen</Form.Label>
                  <Form.Control
                    type="text"
                    name="contactoOrigen"
                    value={values.contactoOrigen}
                    onChange={handleChange}
                    placeholder="Contacto origen"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Contacto destino</Form.Label>
                  <Form.Control
                    type="text"
                    name="contactoDestino"
                    value={values.contactoDestino}
                    onChange={handleChange}
                    placeholder="Contacto destino"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Observaciones (opcional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="observaciones"
                    value={values.observaciones}
                    onChange={handleChange}
                    placeholder="Observaciones"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={saving || isSubmitting}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={() => handleSubmit()} disabled={saving || isSubmitting}>
                  {saving || isSubmitting ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Carga"
                  )}
                </Button>
                </Modal.Footer>
              </>
            );
          }}
        </Formik>
      </Modal>

      {/* Modales de selección */}
      <Modal
        show={showOriginModal}
        onHide={() => setShowOriginModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Seleccionar Origen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingBranches ? (
            <div className="text-center p-3">
              <Spinner animation="border" />
              <p className="mt-2">Cargando sucursales...</p>
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center p-3">
              <i className="fas fa-store fa-3x text-muted mb-3"></i>
              <p className="text-muted">
                No hay sucursales disponibles
              </p>
              <p className="text-muted small">
                Ve a "Mi Empresa" → "Sucursales" para crear una nueva sucursal
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {branches.map((branch) => (
                <Button
                  key={branch.id}
                  variant="outline-primary"
                  className="w-100 mb-2 text-start"
                  onClick={() => {
                    if (setFieldValueRef.current) {
                      handleOriginSelect(branch, setFieldValueRef.current);
                    }
                  }}
                >
                  <div>
                    <strong>{branch.name}</strong>
                    {branch.address && (
                      <div className="text-muted small">{branch.address}</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showDestinationModal}
        onHide={() => setShowDestinationModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Seleccionar Destino</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {getAvailableDestinations().length === 0 ? (
            <p className="text-muted text-center">No hay destinos disponibles</p>
          ) : (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {getAvailableDestinations().map((branch) => (
                <Button
                  key={branch.id}
                  variant="outline-primary"
                  className="w-100 mb-2 text-start"
                  onClick={() => {
                    if (setFieldValueRef.current) {
                      handleDestinationSelect(branch, setFieldValueRef.current);
                    }
                  }}
                >
                  <div>
                    <strong>{branch.name}</strong>
                    {branch.address && (
                      <div className="text-muted small">{branch.address}</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showTransportistaModal}
        onHide={() => setShowTransportistaModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Seleccionar Transportista</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingTransportistas ? (
            <div className="text-center p-3">
              <Spinner animation="border" />
              <p className="mt-2">Cargando transportistas...</p>
            </div>
          ) : transportistas.length === 0 ? (
            <div className="text-center p-3">
              <i className="fas fa-truck fa-3x text-muted mb-3"></i>
              <p className="text-muted">
                No hay transportistas registrados
              </p>
              <p className="text-muted small">
                Ve a "Mi Empresa" → "Proveedores" para agregar transportistas
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {transportistas.map((transportista) => (
                <Button
                  key={transportista.id}
                  variant="outline-primary"
                  className="w-100 mb-2 text-start"
                  onClick={() => {
                    if (setFieldValueRef.current) {
                      handleTransportistaSelect(transportista, setFieldValueRef.current);
                    }
                  }}
                >
                  <div>
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>{transportista.name}</strong>
                      {transportista.agreement_status === "pending" && (
                        <span className="badge bg-warning text-dark ms-2">
                          Pendiente
                        </span>
                      )}
                    </div>
                    {transportista.legal_name && (
                      <div className="text-muted small">
                        {transportista.legal_name}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showUnidadModal}
        onHide={() => setShowUnidadModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Seleccionar Unidad Propia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {unidadesPropias.length === 0 ? (
            <p className="text-muted text-center">
              No hay unidades propias registradas
            </p>
          ) : (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {unidadesPropias.map((unidad) => (
                <Button
                  key={unidad.id}
                  variant="outline-primary"
                  className="w-100 mb-2 text-start"
                  onClick={() => {
                    if (setFieldValueRef.current) {
                      handleUnidadSelect(unidad, setFieldValueRef.current);
                    }
                  }}
                >
                  <div>
                    <strong>
                      {unidad.plates ||
                        unidad.unit_identifier ||
                        unidad.box_number ||
                        "Unidad"}
                    </strong>
                    {unidad.type && (
                      <div className="text-muted small">{unidad.type}</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showTipoVehiculoModal}
        onHide={() => setShowTipoVehiculoModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Seleccionar Tipo de Vehículo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {VEHICLE_TYPES.map((tipo) => (
              <Button
                key={tipo}
                variant="outline-primary"
                className="w-100 mb-2 text-start"
                onClick={() => {
                  if (setFieldValueRef.current) {
                    handleTipoVehiculoSelect(tipo, setFieldValueRef.current);
                  }
                }}
              >
                {tipo}
              </Button>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CreateLoadModal;

