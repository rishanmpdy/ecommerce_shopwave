import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDashboardStats,
  fetchAllProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchAllOrders,
  fetchOrderById,
  updateOrderStatus,
  fetchAllUsers,
  updateUserStatus,
  deleteUser,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/adminServices";
import { toast } from "react-toastify";

// Manglish: frontend component expect cheyyunna shape lekku json-server data normalize cheyyan helper
const normalizeProduct = (product) => ({
  ...product,
  _id: product._id || product.id,
  category:
    typeof product.category === "string" ? { name: product.category } : product.category || { name: "—" },
});

const normalizeOrder = (order, usersById = {}) => ({
  ...order,
  _id: order._id || order.id,
  totalAmount: order.totalAmount ?? order.total ?? 0,
  createdAt: order.createdAt || order.date,
  status: String(order.status || "processing").toLowerCase(),
  user: order.user || usersById[String(order.userId)] || null,
});

const normalizeUser = (user) => ({
  ...user,
  _id: user._id || user.id,
  isActive: user.isActive !== false,
});

export const QUERY_KEYS = {
  DASHBOARD: ["admin", "dashboard"],
  PRODUCTS: ["admin", "products"],
  PRODUCT: (id) => ["admin", "products", id],
  ORDERS: ["admin", "orders"],
  ORDER: (id) => ["admin", "orders", id],
  USERS: ["admin", "users"],
  CATEGORIES: ["admin", "categories"],
};

export const useDashboardStats = () =>
  useQuery({
    queryKey: QUERY_KEYS.DASHBOARD,
    queryFn: () => fetchDashboardStats().then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });

export const useProducts = (params) =>
  useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTS, params],
    queryFn: async () => {
      const { data } = await fetchAllProducts({});
      const list = Array.isArray(data) ? data.map(normalizeProduct) : [];
      const q = String(params?.search || "").trim().toLowerCase();
      const filtered = q ? list.filter((p) => p.name?.toLowerCase().includes(q)) : list;
      const page = Number(params?.page || 1);
      const limit = Number(params?.limit || 10);
      const start = (page - 1) * limit;
      return {
        products: filtered.slice(start, start + limit),
        totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      };
    },
  });

export const useProduct = (id) =>
  useQuery({
    queryKey: QUERY_KEYS.PRODUCT(id),
    queryFn: () => fetchProductById(id).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      toast.success("Product created successfully");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create product"),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      const previous = qc.getQueriesData({ queryKey: QUERY_KEYS.PRODUCTS });
      qc.setQueriesData({ queryKey: QUERY_KEYS.PRODUCTS }, (old) => {
        if (!old?.products) return old;
        return {
          ...old,
          products: old.products.map((p) => (String(p._id || p.id) === String(id) ? { ...p, ...data } : p)),
        };
      });
      return { previous };
    },
    onError: (err, newTodo, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      }
      toast.error("Failed to update product");
    },
    onSettled: (_, __, { id }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT(id) });
    },
    onSuccess: () => toast.success("Product updated successfully"),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      const previous = qc.getQueriesData({ queryKey: QUERY_KEYS.PRODUCTS });
      qc.setQueriesData({ queryKey: QUERY_KEYS.PRODUCTS }, (old) => {
        if (!old?.products) return old;
        return {
          ...old,
          products: old.products.filter((p) => String(p._id || p.id) !== String(id)),
        };
      });
      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      }
      toast.error("Failed to delete product");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
    },
    onSuccess: () => toast.success("Product deleted"),
  });
};

export const useOrders = (params) =>
  useQuery({
    queryKey: [...QUERY_KEYS.ORDERS, params],
    queryFn: async () => {
      const [{ data: ordersRaw }, { data: usersRaw }] = await Promise.all([
        fetchAllOrders({}),
        fetchAllUsers({}),
      ]);
      const usersById = Object.fromEntries((usersRaw || []).map((u) => [String(u.id), normalizeUser(u)]));
      let orders = (ordersRaw || []).map((order) => normalizeOrder(order, usersById));

      const q = String(params?.search || "").trim().toLowerCase();
      if (q) {
        orders = orders.filter(
          (order) =>
            String(order._id).toLowerCase().includes(q) ||
            String(order.user?.name || "").toLowerCase().includes(q)
        );
      }

      if (params?.status) {
        orders = orders.filter((order) => order.status === String(params.status).toLowerCase());
      }

      const page = Number(params?.page || 1);
      const limit = Number(params?.limit || 10);
      const start = (page - 1) * limit;
      return {
        orders: orders.slice(start, start + limit),
        totalPages: Math.max(1, Math.ceil(orders.length / limit)),
      };
    },
  });

export const useOrder = (id) =>
  useQuery({
    queryKey: QUERY_KEYS.ORDER(id),
    queryFn: () => fetchOrderById(id).then((r) => r.data),
    enabled: !!id,
  });

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    // Manglish: Optimistic update - request complete aavunnathinu munne UI-il status change reflect cheyyunnu.
    onMutate: async ({ id, status }) => {
      // 1. Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await qc.cancelQueries({ queryKey: QUERY_KEYS.ORDERS_ALL });

      // 2. Snapshot the previous value
      const previousOrders = qc.getQueriesData({ queryKey: QUERY_KEYS.ORDERS_ALL });

      // 3. Optimistically update to the new value
      qc.setQueriesData({ queryKey: QUERY_KEYS.ORDERS_ALL }, (old) => {
        if (!old) return old;
        // Paginated data handling
        if (old.orders) {
          return {
            ...old,
            orders: old.orders.map((order) =>
              String(order.id || order._id) === String(id) ? { ...order, status } : order
            ),
          };
        }
        // Single order handling
        if (Array.isArray(old)) {
          return old.map((order) =>
            String(order.id || order._id) === String(id) ? { ...order, status } : order
          );
        }
        return old;
      });

      // 4. Return context with snapshot
      return { previousOrders };
    },
    // Error aayal pazhaya status-lekku thirichu pokum.
    onError: (err, newTodo, context) => {
      if (context?.previousOrders) {
        context.previousOrders.forEach(([queryKey, data]) => {
          qc.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to update status");
    },
    // Finalize: validation or refresh to confirm server state.
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS_ALL });
    },
    onSuccess: () => {
      toast.success("Order status updated");
    },
  });
};

export const useUsers = (params) =>
  useQuery({
    queryKey: [...QUERY_KEYS.USERS, params],
    queryFn: async () => {
      const { data } = await fetchAllUsers({});
      const list = (data || []).map(normalizeUser);
      const q = String(params?.search || "").trim().toLowerCase();
      const filtered = q
        ? list.filter(
            (user) =>
              user.name?.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q)
          )
        : list;
      const page = Number(params?.page || 1);
      const limit = Number(params?.limit || 10);
      const start = (page - 1) * limit;
      return {
        users: filtered.slice(start, start + limit),
        totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      };
    },
  });

export const useUpdateUserStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => updateUserStatus(id, isActive),
    onMutate: async ({ id, isActive }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.USERS });
      const previous = qc.getQueriesData({ queryKey: QUERY_KEYS.USERS });
      qc.setQueriesData({ queryKey: QUERY_KEYS.USERS }, (old) => {
        if (!old?.users) return old;
        return {
          ...old,
          users: old.users.map((u) => (String(u._id || u.id) === String(id) ? { ...u, isActive } : u)),
        };
      });
      return { previous };
    },
    onError: (err, vars, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      }
      toast.error("Failed to update user status");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },
    onSuccess: () => toast.success("User status updated"),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.USERS });
      const previous = qc.getQueriesData({ queryKey: QUERY_KEYS.USERS });
      qc.setQueriesData({ queryKey: QUERY_KEYS.USERS }, (old) => {
        if (!old?.users) return old;
        return {
          ...old,
          users: old.users.filter((u) => String(u._id || u.id) !== String(id)),
        };
      });
      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      }
      toast.error("Failed to delete user");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },
    onSuccess: () => toast.success("User deleted"),
  });
};

export const useCategories = () =>
  useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: () => fetchCategories().then((r) => r.data),
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      toast.success("Category created");
    },
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      const previous = qc.getQueryData(QUERY_KEYS.CATEGORIES);
      qc.setQueryData(QUERY_KEYS.CATEGORIES, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((c) => (String(c._id || c.id) === String(id) ? { ...c, ...data } : c));
      });
      return { previous };
    },
    onError: (err, vars, context) => {
      if (context?.previous) qc.setQueryData(QUERY_KEYS.CATEGORIES, context.previous);
      toast.error("Failed to update category");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
    },
    onSuccess: () => toast.success("Category updated"),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      const previous = qc.getQueryData(QUERY_KEYS.CATEGORIES);
      qc.setQueryData(QUERY_KEYS.CATEGORIES, (old) => {
        if (!Array.isArray(old)) return old;
        return old.filter((c) => String(c._id || c.id) !== String(id));
      });
      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous) qc.setQueryData(QUERY_KEYS.CATEGORIES, context.previous);
      toast.error("Failed to delete category");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
    },
    onSuccess: () => toast.success("Category deleted"),
  });
};
