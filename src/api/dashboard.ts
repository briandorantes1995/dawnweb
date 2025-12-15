// src/api/dashboard.ts
import { useApi } from "../hooks/useApi";

// ============================================================
// DASHBOARD SELLER TYPES
// ============================================================
export interface SellerDashboardResponse {
  loadsStatus: {
    pendiente: number;
    aceptada: number;
    cancelada: number;
  };
  loadsMonthly: Array<{
    month: string;
    pendiente: number;
    aceptada: number;
    cancelada: number;
  }>;
  topRoutes: Array<{
    _count: {
      id: number;
    };
    origen: string | null;
    destino: string | null;
  }>;
  acceptedByProvider: Array<{
    _count: {
      id: number;
    };
    empresa_transportista_id: string;
  }>;
  assignmentStatus: {
    pendiente: number;
    completada: number;
    problema_reportado: number;
    cancelada: number;
  };
  assignmentsSubstatus: any[];
  problemsByType: any[];
  substatusAvgTimes: any[];
}

// ============================================================
// DASHBOARD TRANSPORTER TYPES
// ============================================================
export interface TransporterDashboardResponse {
  assignmentStatus: {
    pendiente: number;
    completada: number;
    problema_reportado: number;
    cancelada: number;
  };
  substatusCounts: Record<string, number>;
  problemsCount: Record<string, number>;
  units: {
    assigned: number;
    free: number;
    total: number;
  };
  monthlyAssignments: Array<{
    month: string;
    count: number;
  }>;
}

// ============================================================
// DASHBOARD SERVICE
// ============================================================
export function useDashboardService() {
  const { get } = useApi();

  // -------------------------------------------------------------
  // Obtener datos del dashboard para SELLER
  // GET /dashboard/seller
  // -------------------------------------------------------------
  const fetchSellerDashboard = async (): Promise<SellerDashboardResponse> => {
    return await get<SellerDashboardResponse>("/dashboard/seller");
  };

  // -------------------------------------------------------------
  // Obtener datos del dashboard para TRANSPORTER
  // GET /dashboard/transporter
  // -------------------------------------------------------------
  const fetchTransporterDashboard = async (): Promise<TransporterDashboardResponse> => {
    return await get<TransporterDashboardResponse>("/dashboard/transporter");
  };

  return {
    fetchSellerDashboard,
    fetchTransporterDashboard,
  };
}

