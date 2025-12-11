// src/api/trailers.ts
import { useApi } from "../hooks/useApi";
import { stripUnitFields } from "../utils/sanitize";
import {TransportUnit,CreateUnitPayload,UpdateUnitPayload,FetchResponse,CreateResponse,UpdateResponse,UpdateStatusResponse,
UnitStatus,} from "../types/Vehicle";


export function useUnitsService() {
  const { get, patch, del, post, put } = useApi();

  // GET — Fetch all units (active/inactive/assigned)
  const fetchUnits = async () => {
    return await get<FetchResponse<TransportUnit>>("/units/");
  };

  // POST — Create unit
  const createUnit = async (payload: CreateUnitPayload) => {
    return await post<CreateResponse<TransportUnit>>("/units/create", stripUnitFields(payload));
  };

  // PUT — Update unit details
  const editUnit = async (trailerId: string, payload: UpdateUnitPayload) => {
    return await put<UpdateResponse<TransportUnit>>(`/units/update/${trailerId}`, stripUnitFields(payload));
  };

  // PATCH — Change unit status (active/inactive)
  const changeStatus = async (trailerId: string, status: UnitStatus) => {
    return await patch<UpdateStatusResponse<TransportUnit>>(`/units/status/${trailerId}`,{ status }
    );
  };

  // PATCH — Assign driver to unit
  const assigndriver = async (payload: { trailer_id: string; driver_id: string }) => {
    return await patch<UpdateResponse<TransportUnit>>(`/units/assign-driver`,payload
    );
  };

  // PATCH — Unassign driver
  const unassigndriver = async (payload: { trailer_id: string }) => {
    return await patch<UpdateResponse<TransportUnit>>(`/units/unassign-driver`,payload
    );
  };

  return {
    fetchUnits,
    createUnit,
    editUnit,
    changeStatus,
    assigndriver,
    unassigndriver,
  };
}
