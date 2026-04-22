import { useMemo, useState } from "react";
import { Plus, Search, Tag, Trash2, Pencil, X } from "lucide-react";
import { useCoupons, useCreateCoupon, useDeleteCoupon, useUpdateCoupon } from "../queries/couponQueries";

const emptyForm = {
  code: "",
  discount: "",
  type: "percent",
  minOrder: "",
  expiry: "",
  description: "",
  userId: "",
};

const AdminCoupons = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data: coupons, isLoading } = useCoupons();
  const { mutate: createCoupon, isPending: isCreating } = useCreateCoupon();
  const { mutate: updateCoupon, isPending: isUpdating } = useUpdateCoupon();
  const { mutate: removeCoupon, isPending: isDeleting } = useDeleteCoupon();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return coupons || [];
    return (coupons || []).filter((c) => {
      const code = String(c.code || "").toLowerCase();
      const userId = String(c.userId || "").toLowerCase();
      return code.includes(q) || userId.includes(q);
    });
  }, [coupons, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code || "",
      discount: coupon.discount ?? "",
      type: coupon.type || "percent",
      minOrder: coupon.minOrder ?? "",
      expiry: coupon.expiry || "",
      description: coupon.description || "",
      userId: coupon.userId || "",
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      code: String(form.code).trim().toUpperCase(),
      discount: Number(form.discount),
      type: form.type,
      minOrder: Number(form.minOrder || 0),
      expiry: form.expiry,
      description: form.description,
      userId: String(form.userId || "").trim(),
    };

    if (!payload.code) return;
    if (!payload.expiry) return;

    if (editing) {
      updateCoupon(
        { id: editing.id, data: { ...editing, ...payload } },
        { onSuccess: () => setShowModal(false) }
      );
      return;
    }

    createCoupon({ id: Date.now().toString(), ...payload }, { onSuccess: () => setShowModal(false) });
  };

  const handleDelete = (coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
    removeCoupon(coupon.id);
  };

  const saving = isCreating || isUpdating;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">Create, edit and delete coupons.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors"
        >
          <Plus size={16} />
          Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or userId..."
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
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Code</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Discount</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Min order</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Expiry</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">UserId</th>
                  <th className="text-right px-5 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => {
                  const expired = c.expiry ? new Date(c.expiry) < new Date() : false;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-indigo-500" />
                          <span className="font-mono font-semibold text-gray-800">{c.code}</span>
                          {expired && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
                              Expired
                            </span>
                          )}
                        </div>
                        {c.description && <p className="text-xs text-gray-400 mt-1">{c.description}</p>}
                      </td>
                      <td className="px-5 py-3 text-gray-700 font-medium">
                        {c.type === "percent" ? `${c.discount}%` : `₹${c.discount}`}
                      </td>
                      <td className="px-5 py-3 text-gray-600">{c.minOrder ? `₹${c.minOrder}` : "—"}</td>
                      <td className="px-5 py-3 text-gray-600">
                        {c.expiry ? new Date(c.expiry).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-600">{c.userId || "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            disabled={isDeleting}
                            onClick={() => handleDelete(c)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-60"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!filtered.length && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-400">
                      No coupons found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="w-full max-w-xl bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                {editing ? `Edit ${editing.code}` : "Create Coupon"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Coupon code</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                  placeholder="SAVE20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                >
                  <option value="percent">Percent (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Discount</label>
                <input
                  value={form.discount}
                  onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))}
                  required
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Min order (₹)</label>
                <input
                  value={form.minOrder}
                  onChange={(e) => setForm((p) => ({ ...p, minOrder: e.target.value }))}
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Expiry</label>
                <input
                  value={form.expiry}
                  onChange={(e) => setForm((p) => ({ ...p, expiry: e.target.value }))}
                  required
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">UserId (required for cart)</label>
                <input
                  value={form.userId}
                  onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                  placeholder="e.g. 1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                  placeholder="Short description..."
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-60"
                >
                  {saving ? "Saving..." : editing ? "Update coupon" : "Create coupon"}
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

