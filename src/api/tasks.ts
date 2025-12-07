// src/api/tasks.api.ts
import { useApiFetch } from "../hooks/useFetch";

export function useTasksApi() {
    const api = useApiFetch();

    return {
        getTasks: () => api.get<any[]>("/tasks"),
        createTask: (text: string) => api.post<any>("/tasks", { text }),
        updateTask: (id: string, data: any) => api.patch<any>(`/tasks/${id}`, data),
        deleteTask: (id: string) => api.del<any>(`/tasks/${id}`),
    };
}




