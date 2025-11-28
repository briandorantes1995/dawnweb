import { configureStore } from "@reduxjs/toolkit";
import authReducer, { restoreSession } from "./slices/authSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {FLUSH,REHYDRATE,PAUSE,PERSIST,PURGE,REGISTER,} from "redux-persist";

const authConfig = {
  key: "auth",
  storage,
  whitelist: ["accessToken", "refreshToken", "user"]
};

const persistedAuthReducer = persistReducer(authConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer
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


