import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createCoupon, deleteCoupon, fetchAllCoupons, updateCoupon } from "../services/couponServices";

export const COUPON_KEYS = {
  ALL: ["admin", "coupons"],
  LIST: (params) => ["admin", "coupons", "list", params],
};

export const useCoupons = (params) =>
  useQuery({
    queryKey: COUPON_KEYS.LIST(params),
    queryFn: () => fetchAllCoupons(params).then((r) => r.data),
  });

export const useCreateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COUPON_KEYS.ALL });
      toast.success("Coupon created");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create coupon"),
  });
};

export const useUpdateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCoupon(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: COUPON_KEYS.ALL });
      const previous = qc.getQueriesData({ queryKey: COUPON_KEYS.ALL });
      qc.setQueriesData({ queryKey: COUPON_KEYS.ALL }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((c) => (String(c._id || c.id) === String(id) ? { ...c, ...data } : c)),
        };
      });
      return { previous };
    },
    onError: (err, newTodo, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      }
      toast.error("Failed to update coupon");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: COUPON_KEYS.ALL });
    },
    onSuccess: () => toast.success("Coupon updated"),
  });
};

export const useDeleteCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCoupon,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: COUPON_KEYS.ALL });
      const previous = qc.getQueriesData({ queryKey: COUPON_KEYS.ALL });
      qc.setQueriesData({ queryKey: COUPON_KEYS.ALL }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((c) => String(c._id || c.id) !== String(id)),
        };
      });
      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      }
      toast.error("Failed to delete coupon");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: COUPON_KEYS.ALL });
    },
    onSuccess: () => toast.success("Coupon deleted"),
  });
};

