import { useMemo, useState } from "react";
import { Plus, Search, Tag, Trash2, Pencil, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminApi from "../adminShared";
import { toast } from "react-toastify";

// Coupons list backend-il ninnu fetch cheyyunnu.
const useCoupons = () => {
  return useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: async () => {
      const { data } = await adminApi.get("/admin/coupons");
      return data;
    },
  });
};

// Puthiya coupon code create cheyyan.
const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => { await adminApi.post("/admin/coupons", data); },
    onSuccess: () => {
      // Create kazhinjal list refresh cheyyunnu.
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
      toast.success("Coupon created!");
    },
  });
};

// Existing coupon details update cheyyan.
const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => { await adminApi.put(`/admin/coupons/${id}`, data); },
    onSuccess: () => {
      // Update kazhinjal list reload cheyyunnu.
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
      toast.success("Coupon updated!");
    },
  });
};

// Coupon permanently delete cheyyan.
const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await adminApi.delete(`/admin/coupons/${id}`); },
    onSuccess: () => {
      // Delete success message and list refresh.
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
      toast.error("Coupon deleted!");
    },
  });
};

// Form initial state definition.
const emptyForm = { code: "", discount: "", type: "percent", minOrder: "", expiry: "", description: "" };

// A34 (Admin Coupon Workflow: Enables the administrative creation,
//  systematic monitoring, and relational assignment of discount tokens,
//  including automated expiry validation and multi-user eligibility management)

const AdminCoupons = () => {
  // Local states for search and modal management.
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Fetch hooks and mutations initialize cheyyunnu.
  const { data: coupons, isLoading } = useCoupons();
  const { mutate: createCoupon, isPending: isCreating } = useCreateCoupon();
  const { mutate: updateCoupon, isPending: isUpdating } = useUpdateCoupon();
  const { mutate: removeCoupon, isPending: isDeleting } = useDeleteCoupon();

  // Search text vechu coupons filter cheyyunnu.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return coupons || [];
    return (coupons || []).filter((c) => String(c.code || "").toLowerCase().includes(q));
  }, [coupons, search]);

  // Create modal thurakkunnu.
  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };

  // Edit modal with data thurakkunnu.
  const openEdit = (coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code || "",
      discount: coupon.discount ?? "",
      type: coupon.type || "percent",
      minOrder: coupon.minOrder ?? "",
      expiry: coupon.expiry || "",
      description: coupon.description || ""
    });
    setShowModal(true);
  };

  // Form submit handler (Create/Update).
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      code: String(form.code).trim().toUpperCase(),
      discount: Number(form.discount),
      type: form.type,
      minOrder: Number(form.minOrder || 0),
      expiry: form.expiry,
      description: form.description
    };

    if (!payload.code || !payload.expiry) return;

    if (editing) {
      updateCoupon({ id: editing.id, data: { ...editing, ...payload } }, { onSuccess: () => setShowModal(false) });
      return;
    }

    createCoupon({ id: Date.now().toString(), ...payload }, { onSuccess: () => setShowModal(false) });
  };

  return (
    <div>
      {/* Header area with add button. */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">Manage discount tokens.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
          <Plus size={16} />Add Coupon
        </button>
      </div>

      {/* Search filter input. */}
      <div className="bg-white p-4 mb-4 rounded-xl shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search code..." className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none" />
        </div>
      </div>

      {/* Coupons list table. */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Code</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Discount</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Min order</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Expiry</th>
                  <th className="text-right px-5 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* Coupons array map cheythu display cheyyunnu. */}
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-indigo-500" />
                        <span className="font-mono font-semibold">{c.code}</span>
                        {/* Expiry check indicator. */}
                        {c.expiry && new Date(c.expiry) < new Date() && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Expired</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium">{c.type === "percent" ? `${c.discount}%` : `₹${c.discount}`}</td>
                    <td className="px-5 py-3">{c.minOrder ? `₹${c.minOrder}` : "—"}</td>
                    <td className="px-5 py-3">{c.expiry ? new Date(c.expiry).toLocaleDateString() : "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-lg"><Pencil size={15} /></button>
                        <button disabled={isDeleting} onClick={() => { if (window.confirm(`Delete ${c.code}?`)) removeCoupon(c.id); }} className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={6} className="py-10 text-center text-gray-400">No coupons.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Coupon edit/create modal form. */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" 
        onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="w-full max-w-xl bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-base font-semibold">{editing ? `Edit ${editing.code}` : "Create Coupon"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-gray-500 mb-1">Coupon code</label><input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} required className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1">Type</label><select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"><option value="percent">Percent (%)</option><option value="flat">Flat (₹)</option></select></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1">Discount</label><input value={form.discount} onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))} required type="number" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1">Min order (₹)</label><input value={form.minOrder} onChange={(e) => setForm((p) => ({ ...p, minOrder: e.target.value }))} type="number" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1">Expiry</label><input value={form.expiry} onChange={(e) => setForm((p) => ({ ...p, expiry: e.target.value }))} required type="date" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none" /></div>
              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border text-sm text-gray-600">Cancel</button>
                <button disabled={isCreating || isUpdating} type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-60">
                  {isCreating || isUpdating ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
