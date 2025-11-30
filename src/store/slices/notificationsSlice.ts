// notificationsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NotificationItem {
    id: string;
    type: "info" | "success" | "warning" | "error";
    message: string;
    timestamp: number;
    read: boolean;
}

interface NotificationsState {
    items: NotificationItem[];
}

const MAX_ITEMS = 6;

const initialState: NotificationsState = {
    items: [],
};

const notificationsSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        addNotification(state, action: PayloadAction<{ type: string; message: string }>) {
            const newNotif: NotificationItem = {
                id: crypto.randomUUID(),
                type: action.payload.type as any,
                message: action.payload.message,
                timestamp: Date.now(),
                read: false,
            };

            state.items.unshift(newNotif);
            if (state.items.length > MAX_ITEMS) {
                state.items.pop();
            }
        },

        markAllRead(state) {
            state.items = state.items.map(n => ({ ...n, read: true }));
        }
    }
});

export const { addNotification, markAllRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;


