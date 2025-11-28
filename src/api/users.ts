// services/userService.ts
import { useApi } from "../hooks/useApi";


export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  active: boolean;
  pending_approval: boolean;
  role_name: string;
  role_level: number;
}

export interface UsersResponse {
  activeUsers: User[];
  inactiveUsers: User[];
  pendingUsers: User[];
}

export function useUserService() {
  const { get } = useApi();

  const fetchUsers = async () => {
    const res = await get<{
      activeUsers: any[];
      inactiveUsers: any[];
      pendingUsers: any[];
    }>("/users");

    return {
      activeUsers: res.activeUsers,
      inactiveUsers: res.inactiveUsers,
      pendingUsers: res.pendingUsers
    };
  };

  return {
    fetchUsers,
  };
}
