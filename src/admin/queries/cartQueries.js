import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllCarts, fetchCartByUser, clearUserCart, removeCartItem } from "../services/cartServices";
import { toast } from "react-toastify";
import api from "../../api/axios";

// Manglish: userId vechu users data map cheyyan helper
const fetchUsersMap = async () => {
  const { data: users } = await api.get("/users");
  return Object.fromEntries((users || []).map((u) => [String(u.id), u]));
};

export const CART_KEYS = {
  ALL: ["admin", "carts"],
  USER: (id) => ["admin", "carts", id],
};

export const useAllCarts = (params) =>
  useQuery({
    queryKey: [...CART_KEYS.ALL, params],
    queryFn: async () => {
      const [{ data: carts }, usersById] = await Promise.all([fetchAllCarts(params), fetchUsersMap()]);
      let list = (carts || []).map((cart) => ({
        ...cart,
        _id: cart._id || cart.id,
        user: usersById[String(cart.userId)] || null,
      }));

      const q = String(params?.search || "").trim().toLowerCase();
      if (q) {
        list = list.filter((cart) => {
          const name = String(cart.user?.name || "").toLowerCase();
          const email = String(cart.user?.email || "").toLowerCase();
          return name.includes(q) || email.includes(q);
        });
      }

      const totalCarts = list.length;
      const totalItems = list.reduce((sum, cart) => sum + (cart.items?.length || 0), 0);
      const totalValue = list.reduce(
        (sum, cart) =>
          sum +
          (cart.items || []).reduce((s, item) => s + Number(item.product?.price || 0) * Number(item.quantity || 0), 0),
        0
      );

      const page = Number(params?.page || 1);
      const limit = Number(params?.limit || 10);
      const start = (page - 1) * limit;
      return {
        carts: list.slice(start, start + limit),
        totalPages: Math.max(1, Math.ceil(list.length / limit)),
        totalCarts,
        totalItems,
        totalValue,
      };
    },
  });

export const useUserCart = (userId) =>
  useQuery({
    queryKey: CART_KEYS.USER(userId),
    queryFn: () => fetchCartByUser(userId).then((r) => r.data),
    enabled: !!userId,
  });

export const useClearUserCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearUserCart,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CART_KEYS.ALL });
      toast.success("Cart cleared");
    },
    onError: () => toast.error("Failed to clear cart"),
  });
};

export const useRemoveCartItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, itemId }) => removeCartItem(userId, itemId),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: CART_KEYS.USER(userId) });
      qc.invalidateQueries({ queryKey: CART_KEYS.ALL });
      toast.success("Item removed from cart");
    },
    onError: () => toast.error("Failed to remove item"),
  });
};
