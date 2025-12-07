import { apiFetch } from "./apiFetch";


export async function fetchTasks() {
    return apiFetch("/tasks");
}


export async function createTask(text: string) {
    return apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({ text }),
    });
}

export async function updateTask(id: string, data: { text?: string; status?: string }) {
    return apiFetch(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function deleteTask(id: string) {
    return apiFetch(`/tasks/${id}`, {
        method: "DELETE",
    });
}



