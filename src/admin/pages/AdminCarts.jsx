import { useState } from "react";
import { useAllCarts, useUserCart, useClearUserCart, useRemoveCartItem } from "../queries/cartQueries";
import { Search, ShoppingCart, Trash2, X, ChevronRight, Package } from "lucide-react";

const CartDrawer = ({ userId, userName, onClose }) => {
  // Manglish: selected user cart detail fetch
  const { data: cart, isLoading } = useUserCart(userId);
  const { mutate: removeItem } = useRemoveCartItem();
  const { mutate: clearCart } = useClearUserCart();

  const handleClear = () => {
    if (window.confirm(`Clear ${userName}'s entire cart?`)) {
      clearCart(userId, { onSuccess: onClose });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-800">{userName}'s Cart</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {cart?.items?.length || 0} item{cart?.items?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {cart?.items?.length > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} />
                Clear cart
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : cart?.items?.length ? (
            <ul className="space-y-3">
              {cart.items.map((item) => (
                <li
                  key={item._id || item.id || item.product?.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {item.product?.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package size={20} className="text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">
                      {item.product?.name || "Product unavailable"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ₹{item.product?.price?.toLocaleString()} × {item.quantity}
                    </p>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem({ userId, itemId: item._id || item.id || item.product?.id })}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ShoppingCart size={40} className="mb-3 opacity-40" />
              <p className="text-sm">This cart is empty</p>
            </div>
          )}
        </div>

        {cart?.items?.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Cart total</span>
              <span className="text-base font-bold text-gray-800">
                ₹
                {cart.items
                  .reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const AdminCarts = () => {
  // Manglish: carts list filter + pagination state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useAllCarts({ search, page, limit: 10 });
  const { mutate: clearCart } = useClearUserCart();

  const handleClear = (e, userId) => {
    e.stopPropagation();
    if (window.confirm("Clear this user's cart?")) clearCart(userId);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cart Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          View and manage active shopping carts across all users.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Active Carts</p>
          <p className="text-2xl font-bold text-gray-800">{data?.totalCarts ?? "—"}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Items</p>
          <p className="text-2xl font-bold text-gray-800">{data?.totalItems ?? "—"}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Cart Value</p>
          <p className="text-2xl font-bold text-gray-800">
            {data?.totalValue != null ? `₹${Number(data.totalValue).toLocaleString()}` : "—"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by user name or email..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">User</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Email</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Items</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Cart Value</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Last Updated</th>
                  <th className="text-right px-5 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.carts?.map((cart) => (
                  <tr
                    key={cart._id}
                    onClick={() => setSelected({ userId: cart.user?._id, userName: cart.user?.name })}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold uppercase flex-shrink-0">
                          {cart.user?.name?.[0] || "U"}
                        </div>
                        <span className="font-medium text-gray-700">{cart.user?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{cart.user?.email || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <ShoppingCart size={13} className="text-gray-400" />
                        {cart.items?.length || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-700">
                      ₹
                      {cart.items
                        ?.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0)
                        .toLocaleString() ?? "0"}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {cart.updatedAt ? new Date(cart.updatedAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => handleClear(e, cart.user?._id)}
                          title="Clear cart"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected({ userId: cart.user?._id, userName: cart.user?.name });
                          }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!data?.carts?.length && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-400">
                      No active carts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data?.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <CartDrawer
          userId={selected.userId}
          userName={selected.userName}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default AdminCarts;
