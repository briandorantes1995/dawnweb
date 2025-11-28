import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import {persistReducer,persistStore} from "redux-persist";
import storage from "redux-persist/lib/storage";

const authConfig = {key: "auth",storage,whitelist: ["accessToken", "refreshToken", "user"]};

export const store = configureStore({
  reducer: {
    auth: persistReducer(authConfig, authReducer)
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: false
    })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


