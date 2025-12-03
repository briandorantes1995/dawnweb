import { User } from "./User";
import { TransportUnit, Trailer } from "./Vehicle";

/* ---------------------------------------------
   Driver Model
----------------------------------------------*/
export interface Driver {
  id: string;
  member_id: string;
  company_id: string;

  // Relaciones correctas reutilizando las interfaces de Vehicle
  member: User;
  default_unit?: TransportUnit | null;
  default_trailer?: Trailer | null;

  // Información principal
  license_number: string | null;
  license_type: string | null;
  active: boolean;

  created_at: string | null;
  last_location?: any;
  location_updated_at?: string | null;
  tracking_active: boolean;
}

/* ---------------------------------------------
   Responses
----------------------------------------------*/

// GET /drivers
export interface FetchDriversResponse {
  active: Driver[];
  inactive: Driver[];
}

// Crear Driver
export interface CreateDriverPayload {
  license_number?: string | null;
  license_type?: string | null;
}

export interface CreateDriverResponse {
  message: string;
  driver: Driver;
}

// Update Driver
export interface UpdateDriverPayload {
  license_number?: string | null;
  license_type?: string | null;
  active?: boolean;
}

export interface UpdateDriverResponse {
  message: string;
  driver: Driver;
}
