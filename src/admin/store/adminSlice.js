import { createSlice } from "@reduxjs/toolkit";

const loadAdminFromStorage = () => {
  try {
    const admin = localStorage.getItem("adminData");
    return admin ? JSON.parse(admin) : null;
  } catch (err) {
    return null;
  }
};

const initialState = {
  admin: loadAdminFromStorage(),
  isAuthenticated: !!localStorage.getItem("adminToken") && !!loadAdminFromStorage(),
  token: localStorage.getItem("adminToken") || null,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.admin = action.payload.admin;
      state.token = action.payload.token;
      localStorage.setItem("adminToken", action.payload.token);
      localStorage.setItem("adminData", JSON.stringify(action.payload.admin));
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.admin = null;
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      // Manglish: Shop user-um clear cheyyunnu to prevent partial logout issues.
      localStorage.removeItem("user");
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = adminSlice.actions;
export default adminSlice.reducer;
