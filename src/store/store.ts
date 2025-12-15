import { configureStore } from "@reduxjs/toolkit";
import authReducer, { restoreSession } from "./slices/authSlice";
import notificationsReducer from "./slices/notificationsSlice";
import uiReducer from "./slices/uiSlice";
import dashboardReducer from "./slices/dashboardSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {FLUSH,REHYDRATE,PAUSE,PERSIST,PURGE,REGISTER,} from "redux-persist";

const authConfig = {
  key: "auth",
  storage,
  whitelist: ["accessToken", "refreshToken", "user"]
};

const notificationsConfig = {
    key: "notifications",
    storage,
};

const uiConfig = {
    key: "ui",
    storage,
    whitelist: ["sidebarColor", "sidebarImage", "sidebarHasImage", "muteNotifications"]
};

const dashboardConfig = {
    key: "dashboard",
    storage,
    whitelist: ["sellerData", "transporterData", "lastFetch"]
};

const persistedUIReducer = persistReducer(uiConfig, uiReducer);
const persistedAuthReducer = persistReducer(authConfig, authReducer);
const persistedNotificationsReducer = persistReducer(notificationsConfig, notificationsReducer);
const persistedDashboardReducer = persistReducer(dashboardConfig, dashboardReducer);


export const store = configureStore({
  reducer: {
      auth: persistedAuthReducer,
      notifications: persistedNotificationsReducer,
      ui: persistedUIReducer,
      dashboard: persistedDashboardReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
});

export const persistor = persistStore(store, null, () => {
  const state = store.getState().auth;

  store.dispatch(
    restoreSession({
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken
    })
  );
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


