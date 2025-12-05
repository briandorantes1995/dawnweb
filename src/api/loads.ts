// src/api/loads.ts
import { useApi } from "../hooks/useApi";

export type Load = {
  id?: string; // Campo del backend
  load_id?: string; // Alias para compatibilidad
  folio: string;
  tipo_carga?: string | null;
  tipo_transporte?: string | null;
  origen: string;
  destino?: string | null;
  nombre_cliente?: string | null;
  link_ubicacion_cliente?: any;
  descripcion?: string | null;
  peso?: string | null;
  volumen?: string | null;
  fecha_carga?: string | null;
  hora_carga?: string | null;
  fecha_entrega?: string | null;
  hora_entrega?: string | null;
  contacto_origen?: string | null;
  contacto_destino?: string | null;
  observaciones?: string | null;
  status: string;
  created_at?: string;
  created_by?: string | null;
  created_by_name?: string | null;
  empresa_transportista_id?: string | null;
};

export type LoadsResponse = {
  total: number;
  pendiente: Load[];
  activo: Load[];
  cancelada: Load[];
};

export type CreateLoadPayload = {
  folio: string;
  empresa_transportista_id?: string | null;
  tipo_transporte?: string | null;
  tipo_carga: string;
  origen: string;
  destino?: string | null;
  nombre_cliente?: string | null;
  link_ubicacion_cliente?: string | null;
  descripcion: string;
  peso?: string | null;
  volumen?: string | null;
  fecha_carga: string;
  hora_carga: string;
  fecha_entrega: string;
  hora_entrega: string;
  contacto_origen?: string | null;
  contacto_destino?: string | null;
  observaciones?: string | null;
};

export function useLoadsService() {
  const { get, post, put } = useApi();

  // -------------------------------------------------------------
  // Obtener cargas de la compañía
  // GET /loads/
  // -------------------------------------------------------------
  const fetchLoads = async (): Promise<LoadsResponse> => {
    return await get<LoadsResponse>("/loads/");
  };

  // -------------------------------------------------------------
  // Crear una nueva carga
  // POST /loads/create
  // -------------------------------------------------------------
  const createLoad = async (payload: CreateLoadPayload) => {
    return await post("/loads/create", payload);
  };

  // -------------------------------------------------------------
  // Editar una carga
  // PUT /loads/edit/:loadId
  // -------------------------------------------------------------
  const editLoad = async (loadId: string, payload: Partial<CreateLoadPayload>) => {
    return await put(`/loads/edit/${loadId}`, payload);
  };

  // -------------------------------------------------------------
  // Aceptar una carga
  // POST /loads/accept/:loadId
  // -------------------------------------------------------------
  const acceptLoad = async (loadId: string) => {
    return await post(`/loads/accept/${loadId}`, {});
  };

  // -------------------------------------------------------------
  // Rechazar una carga
  // POST /loads/reject/:loadId
  // -------------------------------------------------------------
  const rejectLoad = async (loadId: string) => {
    return await post(`/loads/reject/${loadId}`, {});
  };

  // -------------------------------------------------------------
  // Obtener conductores disponibles para una carga
  // GET /loads/available/:loadId
  // -------------------------------------------------------------
  const fetchAvailableDrivers = async (loadId: string) => {
    return await get<{ available: any[] }>(`/loads/available/${loadId}`);
  };

  return {
    fetchLoads,
    createLoad,
    editLoad,
    acceptLoad,
    rejectLoad,
    fetchAvailableDrivers,
  };
}

