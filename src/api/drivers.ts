// src/api/drivers.ts
import { useApi } from "../hooks/useApi";
import {Driver,FetchDriversResponse,CreateDriverPayload,CreateDriverResponse,UpdateDriverPayload,
UpdateDriverResponse} from "../types/Driver";

export function useDriversService() {
  const { get, post, put, patch } = useApi();

  // GET — Fetch all drivers (active/inactive)
  const fetchDrivers = async (): Promise<FetchDriversResponse> => {
    return await get<FetchDriversResponse>("/drivers/");
  };

  // POST — Create driver
  const createDriver = async (
    userId: string,
    payload: CreateDriverPayload
  ): Promise<CreateDriverResponse> => {
    return await post<CreateDriverResponse>(`/drivers/create/${userId}`, payload);
  };

  // PUT — Update driver details
  const editDriver = async (
    driverId: string,
    payload: UpdateDriverPayload
  ): Promise<UpdateDriverResponse> => {
    return await put<UpdateDriverResponse>(`/drivers/update/${driverId}`, payload);
  };

  // PATCH — Activate driver
  const activateDriver = async (driverId: string) => {
    return await patch<UpdateDriverResponse>(`/drivers/status/${driverId}`, { active: true });
  };

  // PATCH — Deactivate driver
  const deactivateDriver = async (driverId: string) => {
    return await patch<UpdateDriverResponse>(`/drivers/status/${driverId}`, { active: false });
  };

  return {
    fetchDrivers,
    createDriver,
    editDriver,
    activateDriver,
    deactivateDriver,
  };
}

