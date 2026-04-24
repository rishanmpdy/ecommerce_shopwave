import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminApi from "../adminShared";
import { Search, Trash2, ShieldOff, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

// Registered users list fetch cheyyanulla shared hook.
const useAdminUsers = ({ search, page, limit }) => {
  return useQuery({
    queryKey: ["admin", "users", { search, page, limit }],
    queryFn: async () => {
      // Backend-ilekku get request ayakkunnu pagination controls vechu.
      const response = await adminApi.get("/admin/users", {
        params: { q: search, _page: page, _limit: limit },
      });
      return {
        users: response.data,
        total: parseInt(response.headers["x-total-count"] || 0),
      };
    },
  });
};

// User status (Active/Blocked) toggle cheyyanulla mutation.
const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }) => {
      // User profile update cheyyan patch request ayakkunnu.
      await adminApi.patch(`/admin/users/${id}`, { isActive });
    },
    onSuccess: () => {
      // Success aayaal list update cheyyunnu.
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User status updated!");
    },
  });
};

// User-e system-il ninnu permanently remove cheyyan.
const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      // Admin particular user ID vechu delete request ayakkunnu.
      await adminApi.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      // Success message and list refresh.
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.error("User deleted!");
    },
  });
};

// A38 (Admin User Workflow: Orchestrates registered account management, providing administrators with tools for search-based monitoring, real-time account status toggling, and secure user deletion)
const AdminUsers = () => {
  // UI state management for search and paging.
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Pagination click cheyyumpol smooth aayi top-ilekku scroll cheyyan.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // Fetch hooks call cheyyunnu.
  const { data, isLoading } = useAdminUsers({ search, page, limit: 10 });
  const { mutate: updateStatus } = useUpdateUserStatus();
  const { mutate: deleteUser } = useDeleteUser();

  // Delete button click logic with confirmation.
  const handleDelete = (id) => {
    if (window.confirm("Permanently delete this user?")) deleteUser(id);
  };

  return (
    <div>
      {/* Page title section. */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <p className="text-gray-500 text-sm mt-1">Manage registered customers.</p>
      </div>

      {/* User search bar area. */}
      <div className="bg-white p-4 mb-4 rounded-xl shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Users table listing. */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">User</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Email</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Joined</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-right px-5 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* Users array map cheythu table rows create cheyyunnu. */}
                {data?.users?.map((user) => (
                  <tr key={user._id || user.id} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {/* User initial icon. */}
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold uppercase">
                          {user.name?.[0] || "U"}
                        </div>
                        <span className="font-medium text-gray-700">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{user.email}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {user.date ? new Date(user.date).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-5 py-3">
                      {/* Status badge showing active or blocked. */}
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                      >
                        {user.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {/* Action buttons for each user row. */}
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateStatus({ id: user._id || user.id, isActive: !user.isActive })}
                          title={user.isActive ? "Block user" : "Unblock user"}
                          className={`p-1.5 rounded-lg transition-colors ${user.isActive
                            ? "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
                            : "text-gray-500 hover:text-green-600 hover:bg-green-50"
                            }`}
                        >
                          {user.isActive ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
                        </button>
                        <button
                          onClick={() => handleDelete(user._id || user.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!data?.users?.length && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination area for large user lists. */}
      {data?.total > 10 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-700">{data.users.length}</span> of{" "}
            <span className="font-medium text-gray-700">{data.total}</span> users
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-indigo-50 transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(data.total / 10) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(p => Math.min(Math.ceil(data.total / 10), p + 1))}
              disabled={page >= Math.ceil(data.total / 10)}
              className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-indigo-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
