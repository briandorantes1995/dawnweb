// src/api/users.ts
import { useApi } from "../hooks/useApi";
import {UsersResponse,UpdateMeResponse,User } from "../types/User";


export function useUserService() {
  const { get, patch, del } = useApi();

  // -------------------------------------------------------------
  // Obtener usuarios de la compañía
  // GET /company/users
  // -------------------------------------------------------------
  const fetchUsers = async () => {
    return await get<UsersResponse>("/company/users");
  };

  const updateMe = async (payload: { first_name?: string; last_name?: string; phone?: string; }): Promise<UpdateMeResponse> => {
    return patch("/users/me", payload);
  };

  // -------------------------------------------------------------
  //Aprobar usuario
  // PATCH /users/approve/:userId
  // -------------------------------------------------------------
  const approveUser = async (userId: string) => {
    return await patch(`/users/approve/${userId}`);
  };

  // -------------------------------------------------------------
  //Cambiar rol
  // PATCH /users/rol/:userId
  // Body: { role: "Admin" | "Maestro" | "User" }
  // -------------------------------------------------------------
  const changeRole = async (userId: string, role: string) => {
    return await patch(`/users/rol/${userId}`, { role });
  };

  // -------------------------------------------------------------
  //Activar / desactivar usuario
  // PATCH /users/active/:userId
  // Body: { active: boolean }
  // -------------------------------------------------------------
  const setActiveStatus = async (userId: string, active: boolean) => {
    return await patch(`/users/active/${userId}`, { active });
  };

  // -------------------------------------------------------------
  //Borrar / Rechazar usuario
  // DELETE /users/delete/:userId
  // -------------------------------------------------------------
  const deleteUser = async (userId: string) => {
    return await del(`/users/delete/${userId}`);
  };

  return {
    fetchUsers,
    approveUser,
    changeRole,
    setActiveStatus,
    deleteUser,
    updateMe,
  };
}

