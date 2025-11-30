import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UIState {
    sidebarColor: string;
    sidebarImage: string;
    sidebarHasImage: boolean;
    muteNotifications: boolean;
}

const initialState: UIState = {
    sidebarColor: "black",
    sidebarImage: "",
    sidebarHasImage: true,
    muteNotifications: false,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setSidebarColor(state, action: PayloadAction<string>) {
            state.sidebarColor = action.payload;
        },
        setSidebarImage(state, action: PayloadAction<string>) {
            state.sidebarImage = action.payload;
        },
        setSidebarHasImage(state, action: PayloadAction<boolean>) {
            state.sidebarHasImage = action.payload;
        },


        toggleMuteNotifications(state) {
            state.muteNotifications = !state.muteNotifications;
        },
    },
});

export const {
    setSidebarColor,
    setSidebarImage,
    setSidebarHasImage,
    toggleMuteNotifications
} = uiSlice.actions;

export default uiSlice.reducer;
