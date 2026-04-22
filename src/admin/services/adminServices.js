import adminApi from "../api/adminApi";

// Manglish: admin login api call
export const adminLoginApi = (credentials) => adminApi.post("/admin/login", credentials);

// Manglish: dashboard stats fetch cheyyan
export const fetchDashboardStats = () => adminApi.get("/admin/dashboard/stats");

// Manglish: product CRUD
export const fetchAllProducts = (params) => adminApi.get("/admin/products", { params });
export const fetchProductById = (id) => adminApi.get(`/admin/products/${id}`);
export const createProduct = (data) => adminApi.post("/admin/products", data);
export const updateProduct = (id, data) => adminApi.put(`/admin/products/${id}`, data);
export const deleteProduct = (id) => adminApi.delete(`/admin/products/${id}`);

// Manglish: order fetch + status update (json-server il /status endpoint illa, direct order patch cheyyum)
export const fetchAllOrders = (params) => adminApi.get("/admin/orders", { params });
export const fetchOrderById = (id) => adminApi.get(`/admin/orders/${id}`);
export const updateOrderStatus = (id, status) => adminApi.patch(`/admin/orders/${id}`, { status });

// Manglish: user management
export const fetchAllUsers = (params) => adminApi.get("/admin/users", { params });
export const fetchUserById = (id) => adminApi.get(`/admin/users/${id}`);
export const updateUserStatus = (id, isActive) => adminApi.patch(`/admin/users/${id}`, { isActive });
export const deleteUser = (id) => adminApi.delete(`/admin/users/${id}`);

// Manglish: category CRUD
export const fetchCategories = () => adminApi.get("/admin/categories");
export const createCategory = (data) => adminApi.post("/admin/categories", data);
export const updateCategory = (id, data) => adminApi.put(`/admin/categories/${id}`, data);
export const deleteCategory = (id) => adminApi.delete(`/admin/categories/${id}`);
