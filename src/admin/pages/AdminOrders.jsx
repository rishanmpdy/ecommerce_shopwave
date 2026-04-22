import { useState } from "react";
import { useOrders, useUpdateOrderStatus } from "../queries/adminQueries";
import { Search, Eye, X, Package, Truck, CheckCircle, Clock } from "lucide-react";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const AdminOrders = () => {
  // Manglish: filter state (search + status + page)
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data, isLoading } = useOrders({ search, status: statusFilter, page, limit: 10 });
  const { mutate: updateStatus } = useUpdateOrderStatus();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and track all customer orders.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by order ID or customer..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 text-gray-600"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
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
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Order ID</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium whitespace-nowrap">Product</th>
                   <th className="text-left px-5 py-3 text-gray-500 font-medium whitespace-nowrap">Total</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium whitespace-nowrap">Status</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium whitespace-nowrap">Date</th>
                  <th className="text-right px-5 py-3 text-gray-500 font-medium whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.orders?.map((order) => (
                  <tr key={order._id || order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">
                      #{String(order._id || order.id).slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 text-gray-700">{order.user?.name || "Guest"}</td>
                    <td className="px-5 py-3">
                      {order.items && order.items.length > 0 ? (
                        <div className="flex items-center gap-3 max-w-xs">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                            <img 
                              src={order.items[0]?.product?.images?.[0] || "https://placehold.co/100"} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {order.items[0]?.product?.name || "Product Name"}
                            </p>
                            {order.items.length > 1 && (
                              <p className="text-[10px] text-indigo-500 font-medium">
                                +{order.items.length - 1} more items
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No items</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-700 font-medium">
                      ₹{order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus({ id: order._id || order.id, status: e.target.value })}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none capitalize ${
                          statusColors[order.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                     <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!data?.orders?.length && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-400">
                      No orders found.
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
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-indigo-700 italic">
                    * Changing status will immediately update the database.
                  </p> 
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <Package size={16} /> Order Items
                </h4>
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

              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
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
                className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
