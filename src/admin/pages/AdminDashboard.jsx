import { useState } from "react";
import { useDashboardStats, useUpdateOrderStatus } from "../queries/adminQueries";
import { ShoppingCart, Users, Package, DollarSign, Eye, X } from "lucide-react";

const statCards = [
  {
    key: "totalRevenue",
    label: "Total Revenue",
    Icon: DollarSign,
    color: "bg-emerald-500",
    format: (v) => `₹${Number(v || 0).toLocaleString()}`,
  },
  {
    key: "totalOrders",
    label: "Total Orders",
    Icon: ShoppingCart,
    color: "bg-indigo-500",
    format: (v) => Number(v || 0).toLocaleString(),
  },
  {
    key: "totalProducts",
    label: "Products",
    Icon: Package,
    color: "bg-amber-500",
    format: (v) => Number(v || 0).toLocaleString(),
  },
  {
    key: "totalUsers",
    label: "Users",
    Icon: Users,
    color: "bg-pink-500",
    format: (v) => Number(v || 0).toLocaleString(),
  },
];

const AdminDashboard = () => {
  // Manglish: dashboard cards + recent orders data backend il ninnu varum
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { data: stats, isLoading, isError } = useDashboardStats();
  const { mutate: updateStatus } = useUpdateOrderStatus();

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (isError)
    return (
      <div className="text-red-500 text-center py-12">Failed to load dashboard data.</div>
    );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ key, label, Icon, color, format }) => (
          <div key={key} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 font-medium">{label}</p>
              <div className={`${color} p-2 rounded-lg`}>
                <Icon size={16} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{format(stats?.[key])}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-3 text-gray-500 font-medium">Order ID</th>
                <th className="text-left pb-3 text-gray-500 font-medium">Customer</th>
                <th className="text-left pb-3 text-gray-500 font-medium">Amount</th>
                <th className="text-left pb-3 text-gray-500 font-medium">Status</th>
                <th className="text-right pb-3 text-gray-500 font-medium whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((order) => (
                <tr key={order._id || order.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 text-gray-600 font-mono text-xs">
                    #{String(order._id || order.id).slice(-6).toUpperCase()}
                  </td>
                  <td className="py-3 text-gray-700">{order.user?.name || "Guest"}</td>
                  <td className="py-3 text-gray-700">₹{order.totalAmount?.toLocaleString()}</td>
                  <td className="py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Quick View"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              )) ?? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-400">
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Order Details Modal (Same as AdminOrders) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  ID: #{selectedOrder._id || selectedOrder.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Management */}
              <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
                <label className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 block">
                  Current Status
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      updateStatus({ id: selectedOrder._id || selectedOrder.id, status: e.target.value });
                      setSelectedOrder({ ...selectedOrder, status: e.target.value });
                    }}
                    className={`text-sm font-bold px-4 py-2 rounded-lg border-2 border-transparent shadow-sm cursor-pointer focus:outline-none capitalize transition-all ${
                      statusColors[selectedOrder.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 block">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                        <img 
                          src={item.product?.images?.[0] || "https://placehold.co/100"} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{item.product?.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.product?.price}</p>
                      </div>
                      <div className="text-sm font-bold text-gray-900 leading-none">
                        ₹{(item.quantity * (item.product?.price || 0)).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer Info</h4>
                  <p className="text-sm font-bold text-gray-900">{selectedOrder.user?.name || "Guest User"}</p>
                  <p className="text-xs text-gray-500">{selectedOrder.user?.email || "No email"}</p>
                  
                  {selectedOrder.shippingAddress && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-1">Shipping Address</h5>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}<br />
                        {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zip}
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Order Summary</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Placed on:</span>
                        <span className="text-gray-700 font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                      </div>
                      {selectedOrder.paymentMethod && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Payment:</span>
                          <span className="text-gray-700 font-medium uppercase">{selectedOrder.paymentMethod}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-end">
                    <span className="text-xs font-bold text-gray-500">Total</span>
                    <span className="text-xl font-black text-indigo-600 leading-none">₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
      statusColors[status] || "bg-gray-100 text-gray-600"
    }`}
  >
    {status}
  </span>
);

export default AdminDashboard;
