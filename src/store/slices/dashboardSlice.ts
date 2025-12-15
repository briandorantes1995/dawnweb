import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SellerDashboardResponse, TransporterDashboardResponse } from "../../api/dashboard";

interface DashboardState {
  sellerData: SellerDashboardResponse | null;
  transporterData: TransporterDashboardResponse | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null; // timestamp de la última carga
}

const initialState: DashboardState = {
  sellerData: null,
  transporterData: null,
  isLoading: false,
  error: null,
  lastFetch: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setSellerData(state, action: PayloadAction<SellerDashboardResponse>) {
      state.sellerData = action.payload;
      state.lastFetch = Date.now();
      state.error = null;
    },
    setTransporterData(state, action: PayloadAction<TransporterDashboardResponse>) {
      state.transporterData = action.payload;
      state.lastFetch = Date.now();
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearDashboard(state) {
      state.sellerData = null;
      state.transporterData = null;
      state.lastFetch = null;
      state.error = null;
    },
  },
});

export const {
  setSellerData,
  setTransporterData,
  setLoading,
  setError,
  clearDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;

