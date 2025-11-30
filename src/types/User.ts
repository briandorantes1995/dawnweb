// src/types/User.ts
export interface UpdateMeResponse {
    message: string;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        phone: string | null;
    };
}

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