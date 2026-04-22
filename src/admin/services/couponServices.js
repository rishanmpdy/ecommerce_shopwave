import adminApi from "../api/adminApi";

export const fetchAllCoupons = (params) => adminApi.get("/admin/coupons", { params });
export const createCoupon = (data) => adminApi.post("/admin/coupons", data);
export const updateCoupon = (id, data) => adminApi.put(`/admin/coupons/${id}`, data);
export const deleteCoupon = (id) => adminApi.delete(`/admin/coupons/${id}`);

