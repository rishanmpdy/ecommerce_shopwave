import axios from "axios";
import store from "../../Store/store";
import { logout } from "../store/adminSlice";

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5005/api",
  headers: { "Content-Type": "application/json" },
});

adminApi.interceptors.request.use((config) => {
  // Manglish: admin request pokumbo local Redux store-il ulla token header-il attach cheyyum.
  const token = store.getState().admin.token;
  console.log(`[DEBUG ADMIN REQUEST] ${config.method?.toUpperCase()} ${config.url} | Token in store: ${token ? 'Yes' : 'NO'}`);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Manglish: token expired / invalid aanel admin session logout aakki login page-il redirect cheyyum.
      const errorMsg = error.response.data?.message || "Unauthorized access";
      console.error(`[ADMIN AUTH ERROR] Redirecting to login: ${errorMsg}`);
      
      store.dispatch(logout());
      
      if (window.location.pathname !== "/login") {
        // give a small delay for any current toast to be seen
        setTimeout(() => {
           window.location.href = "/login";
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);

export default adminApi;
