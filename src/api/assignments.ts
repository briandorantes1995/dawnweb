// src/api/assignments.ts
import { useApi } from "../hooks/useApi";

export interface Assignment {
  id: string;
  status: string;
  substatus?: string;
  driver_id?: string;
  load_id: string;
  provider_company_id?: string;
  transport_unit_id?: string;
  trailer_id?: string;
  last_location?: {
    lat: number;
    lng: number;
  } | null;
  driver?: {
    id: string;
    license_number?: string;
    license_type?: string;
    last_location?: {
      lat: number;
      lng: number;
    } | null;
    location_updated_at?: string | null;
    member: {
      first_name?: string;
      last_name?: string;
      email: string;
    };
  };
  load: {
    id: string;
    folio: string;
    origen: string;
    destino?: string;
    nombre_cliente?: string;
    descripcion?: string;
    tipo_carga?: string;
    tipo_transporte?: string;
    peso?: string;
    volumen?: string;
    fecha_carga?: string;
    hora_carga?: string;
    fecha_entrega?: string;
    hora_entrega?: string;
    contacto_origen?: string;
    contacto_destino?: string;
    observaciones?: string;
    link_ubicacion_cliente?: string | {
      lat?: number | null;
      lng?: number | null;
      link?: string | null;
    } | null;
  };
  trailer?: {
    id: string;
    plate_number?: string;
    plates?: string;
  };
  transport_unit?: {
    id: string;
    type?: string;
    plates?: string;
    plate_number?: string;
  };
}

export interface AssignmentsResponse {
  pendiente: Assignment[];
  sinAsignar: Assignment[];
  completada: Assignment[];
  problema_reportado: Assignment[];
  cancelada: Assignment[];
}

export function useAssignmentService() {
  const { get } = useApi();

  // -------------------------------------------------------------
  // Obtener asignaciones de la compañía
  // GET /assignments
  // -------------------------------------------------------------
  const fetchAssignments = async (): Promise<AssignmentsResponse> => {
    return await get<AssignmentsResponse>("/assignments");
  };

  // -------------------------------------------------------------
  // Obtener una asignación específica por ID
  // GET /assignments/:id
  // -------------------------------------------------------------
  const fetchAssignmentById = async (assignmentId: string): Promise<Assignment> => {
    return await get<Assignment>(`/assignments/${assignmentId}`);
  };

  return {
    fetchAssignments,
    fetchAssignmentById,
  };
}

