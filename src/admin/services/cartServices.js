import adminApi from "../api/adminApi";

export const fetchAllCarts = (params) => adminApi.get("/admin/carts", { params });

// Manglish: carts table il userId use cheyyunnu, cart id alla
export const fetchCartByUser = async (userId) => {
  const response = await adminApi.get("/admin/carts", { params: { userId } });
  return { ...response, data: response.data?.[0] || null };
};

// Manglish: clear cart = items empty aakkuka (cart row delete cheyyaruthu)
export const clearUserCart = async (userId) => {
  const response = await adminApi.get("/admin/carts", { params: { userId } });
  const cart = response.data?.[0];
  if (!cart) return null;
  return adminApi.patch(`/admin/carts/${cart.id}`, { items: [] });
};

// Manglish: item remove cheyyan cart fetch cheythu items filter cheyyum
export const removeCartItem = async (userId, itemId) => {
  const response = await adminApi.get("/admin/carts", { params: { userId } });
  const cart = response.data?.[0];
  if (!cart) return null;
  const nextItems = (cart.items || []).filter(
    (item) => String(item.id || item._id || item.product?.id) !== String(itemId)
  );
  return adminApi.patch(`/admin/carts/${cart.id}`, { items: nextItems });
};
