export type UnitStatus = "active" | "inactive";

export interface BaseTransportItem {
  id: string;
  company_id: string;
  type: string;
  plates?: string | null;
  tonnage?: number | null;
  status: UnitStatus;
  default_driver?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BaseCreatePayload {
  type: string;
  plates?: string | null;
  tonnage?: number | null;
}

export interface BaseUpdatePayload {
  type?: string;
  plates?: string | null;
  tonnage?: number | null;
  status?: UnitStatus;
}


//Trailers Responses

export interface Trailer extends BaseTransportItem {
  volume?: number | null;
  box_number?: string | null;
  color?: string | null;
}

export interface CreateTrailerPayload extends BaseCreatePayload {
  volume?: number | null;
  box_number?: string | null;
  color?: string | null;
}

export interface UpdateTrailerPayload extends BaseUpdatePayload {
  volume?: number | null;
  box_number?: string | null;
  color?: string | null;
}


//Units Responses
export interface TransportUnit extends BaseTransportItem {
  unit_identifier?: string | null;
}


export interface CreateUnitPayload extends BaseCreatePayload {
  unit_identifier?: string | null;
}

export interface UpdateUnitPayload extends BaseUpdatePayload {
  unit_identifier?: string | null;
}


//Generic Response
export interface FetchResponse<T> {
  active: T[];
  inactive: T[];
  assigned: T[];
}

export interface CreateResponse<T> {
  message?: string;
  item: T;
}

export interface UpdateResponse<T> {
  message: string;
  item: T;
}

export interface UpdateStatusResponse<T> {
  message: string;
  unit: T;
}







