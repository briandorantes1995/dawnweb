// src/hooks/useTasks.ts
import { useEffect, useState } from "react";
import { useTasksApi } from "../api/tasks";

export function useTasks() {
    const { getTasks, createTask, updateTask, deleteTask } = useTasksApi();

    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        const list = await getTasks();
        setTasks(list);
        setLoading(false);
    }

    async function add(text: string) {
        const t = await createTask(text);
        setTasks((prev) => [t, ...prev]);
    }

    async function toggle(task: any) {
        const updated = await updateTask(task.id, {
            status: task.status === "pending" ? "done" : "pending",
        });
        setTasks((prev) => prev.map((x) => (x.id === task.id ? updated : x)));
    }

    async function remove(task: any) {
        await deleteTask(task.id);
        setTasks((prev) => prev.filter((x) => x.id !== task.id));
    }

    useEffect(() => {
        load();
    }, []);

    return { tasks, add, toggle, remove, loading };
}


