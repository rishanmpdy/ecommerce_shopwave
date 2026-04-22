import { useMemo, useState } from "react";
import { useProducts, useDeleteProduct, useUpdateProduct, useCreateProduct, useCategories } from "../queries/adminQueries";
import { Plus, Pencil, Trash2, Search, Eye, X } from "lucide-react";

const AdminProducts = () => {
  // Manglish: search + page state manage cheyyan
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState(null); // view | edit | create
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    description: "",
    image: "",
  });

  // Manglish: backend data query hook
  const { data, isLoading } = useProducts({ search, page, limit: 10 });
  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { data: catData } = useCategories();
  const catList = catData || [];

  const handleDelete = (id) => {
    if (window.confirm("Delete this product?")) deleteProduct(id);
  };

  const openView = (product) => {
    setSelectedProduct(product);
    setMode("view");
  };

  const openEdit = (product) => {
    setSelectedProduct(product);
    setForm({
      name: product.name || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      category: product.category?.name || "",
      brand: product.brand || "",
      description: product.description || "",
      image: product.images?.[0] || "",
    });
    setMode("edit");
  };

  const openCreate = () => {
    setSelectedProduct(null);
    setForm({
      name: "",
      price: "",
      stock: "",
      category: "",
      brand: "",
      description: "",
      image: "",
    });
    setMode("create");
  };

  const closeModal = () => {
    setMode(null);
    setSelectedProduct(null);
  };

  const payload = useMemo(
    () => ({
      name: form.name,
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      category: form.category,
      brand: form.brand,
      description: form.description,
      images: form.image ? [form.image] : [],
    }),
    [form]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "edit" && selectedProduct) {
      updateProduct(
        { id: selectedProduct._id || selectedProduct.id, data: { ...selectedProduct, ...payload } },
        { onSuccess: closeModal }
      );
    }

    if (mode === "create") {
      createProduct({ id: `p-${Date.now()}`, ...payload }, { onSuccess: closeModal });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors"
        >
          <Plus size={16} />
          Add Product
        </button>
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
            placeholder="Search products..."
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
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Product</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Category</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Price</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Stock</th>
                  <th className="text-right px-5 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.products?.map((product) => (
                  <tr key={product._id || product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            N/A
                          </div>
                        )}
                        <span className="font-medium text-gray-700 line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{product.category?.name || "—"}</td>
                    <td className="px-5 py-3 text-gray-700 font-medium">
                      ₹{product.price?.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          product.stock > 10
                            ? "bg-green-100 text-green-700"
                            : product.stock > 0
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openView(product)}
                          className="p-1.5 text-gray-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id || product.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!data?.products?.length && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-400">
                      No products found.
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

      {mode && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800 capitalize">
                {mode === "view" ? "View Product" : mode === "edit" ? "Edit Product" : "Create Product"}
              </h2>
              <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {mode === "view" ? (
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="font-medium text-gray-800">{selectedProduct?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Brand</p>
                  <p className="font-medium text-gray-800">{selectedProduct?.brand || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="font-medium text-gray-800">{selectedProduct?.category?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Price / Stock</p>
                  <p className="font-medium text-gray-800">
                    ₹{Number(selectedProduct?.price || 0).toLocaleString()} / {selectedProduct?.stock ?? 0}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700">{selectedProduct?.description || "—"}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Product name"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <input
                  value={form.brand}
                  onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                  placeholder="Brand"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <input
                  required
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="Price"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <input
                  required
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                  placeholder="Stock"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  <option value="">Select Category</option>
                  {catList.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  value={form.image}
                  onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                  placeholder="Image URL"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Description"
                  className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[90px]"
                />

                <div className="md:col-span-2 flex justify-end gap-2">
                  <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating || isCreating}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-60"
                  >
                    {isUpdating || isCreating ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
