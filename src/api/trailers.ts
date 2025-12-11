// src/api/trailers.ts
import { useApi } from "../hooks/useApi";
import { stripTrailerFields } from "../utils/sanitize";
import {Trailer,CreateTrailerPayload,UpdateTrailerPayload,FetchResponse,CreateResponse,UpdateResponse,UpdateStatusResponse,
UnitStatus,} from "../types/Vehicle";

export function useTrailersService() {
  const { get, patch, del, post, put } = useApi();

  // GET — Fetch all trailers (active/inactive)
  const fetchTrailers = async () => {
    return await get<FetchResponse<Trailer>>("/trailers/");
  };

  // POST — Create trailer
  const createTrailer = async (payload: CreateTrailerPayload) => {
    return await post<CreateResponse<Trailer>>("/trailers/create", stripTrailerFields(payload));
  };

  // PUT — Update trailer details
  const editTrailer = async (trailerId: string, payload: UpdateTrailerPayload) => {
    return await put<UpdateResponse<Trailer>>(`/trailers/update/${trailerId}`, stripTrailerFields(payload));
  };

  // PATCH — Change trailer status (active/inactive)
  const changeStatus = async (trailerId: string, status: UnitStatus) => {
    return await patch<UpdateStatusResponse<Trailer>>(
      `/trailers/status/${trailerId}`,
      { status }
    );
  };

  // PATCH — Assign driver to trailer
  const assigndriver = async (payload: { trailer_id: string; driver_id: string }) => {
    return await patch<UpdateResponse<Trailer>>(
      `/trailers/assign-driver`,
      payload
    );
  };

  // PATCH — Unassign driver
  const unassigndriver = async (payload: { trailer_id: string }) => {
    return await patch<UpdateResponse<Trailer>>(
      `/trailers/unassign-driver`,
      payload
    );
  };

  return {
    fetchTrailers,
    createTrailer,
    editTrailer,
    changeStatus,
    assigndriver,
    unassigndriver,
  };
}
