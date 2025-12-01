// src/api/drivers.ts
import { useApi } from "../hooks/useApi";

export interface Driver {
  id: string;
  member_id: string;
  company_id: string;
  license_number?: string;
  license_type?: string;
  active: boolean;
  tracking_active?: boolean;
  member: {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

export interface DriversResponse {
  active: Driver[];
  inactive: Driver[];
}

export function useDriverService() {
  const { get } = useApi();

  // -------------------------------------------------------------
  // Obtener drivers de la compañía
  // GET /drivers
  // -------------------------------------------------------------
  const fetchDrivers = async (): Promise<DriversResponse> => {
    return await get<DriversResponse>("/drivers");
  };

  return {
    fetchDrivers,
  };
}

