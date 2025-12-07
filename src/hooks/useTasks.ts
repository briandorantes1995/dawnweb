import { useEffect, useState } from "react";
import { fetchTasks, createTask, updateTask, deleteTask } from "../api/tasks";

export function useTasks() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        const data = await fetchTasks();
        setTasks(data);
        setLoading(false);
    }

    async function add(text: string) {
        const newTask = await createTask(text);
        setTasks((t) => [newTask, ...t]);
    }

    async function toggle(task: any) {
        const updated = await updateTask(task.id, {
            status: task.status === "pending" ? "done" : "pending",
        });
        setTasks((t) => t.map((x) => (x.id === task.id ? updated : x)));
    }

    async function remove(task: any) {
        await deleteTask(task.id);
        setTasks((t) => t.filter((x) => x.id !== task.id));
    }

    useEffect(() => {
        load();
    }, []);

    return { tasks, add, toggle, remove, loading };
}

