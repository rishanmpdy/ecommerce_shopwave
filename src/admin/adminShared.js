import axios from "axios";
import store from "../Store/store";
import { logout } from "./store/adminSlice";
import { useQuery } from "@tanstack/react-query";

//  Admin panel-inu vendulla special Axios instance.
// A4 (Admin API Instance: Admin panel logic-inu vendi token injection and unauthorized error handling setup cheythirikkunnu)

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5006/api",
  headers: { "Content-Type": "application/json" },
});

//  Request interceptor - token add cheyyan.
adminApi.interceptors.request.use((config) => {
  const token = store.getState().admin.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

//  Response interceptor - 401 Unauthorized errors handle cheyyan.
adminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    }
    return Promise.reject(error);
  }
);

export default adminApi;

// --- Shared Admin Hooks ---

// Ella admin pages-lum categories list avshyamullathu
//  kondu shared hook aayi matti.
export const useCategories = () => {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data } = await adminApi.get("/admin/categories");
      return data;
    },
  });
};

// Shared hook for subcategories.
export const useSubcategories = () => {
  return useQuery({
    queryKey: ["admin", "subcategories"],
    queryFn: async () => {
      const { data } = await adminApi.get("/admin/subcategories");
      return data;
    },
  });
};
