import { useState } from "react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../queries/adminQueries";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

const AdminCategories = () => {
  const { data: categories, isLoading } = useCategories();
  const { mutate: createCat } = useCreateCategory();
  const { mutate: updateCat } = useUpdateCategory();
  const { mutate: deleteCat } = useDeleteCategory();

  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createCat(
      { id: `cat-${Date.now()}`, name: newName.trim(), productCount: 0 },
      { onSuccess: () => setNewName("") }
    );
  };

  const handleUpdate = (id) => {
    if (!editName.trim()) return;
    updateCat({ id, data: { name: editName.trim() } }, { onSuccess: () => setEditId(null) });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
        <p className="text-gray-500 text-sm mt-1">Organise your product catalogue.</p>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4 flex gap-3"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors"
        >
          <Plus size={16} />
          Add
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {categories?.map((cat) => {
              const cid = cat.id || cat._id;
              return (
                <li key={cid} className="flex items-center px-5 py-3 gap-3 hover:bg-gray-50">
                  {editId === cid ? (
                    <>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        className="flex-1 px-3 py-1.5 border border-indigo-300 rounded-lg text-sm focus:outline-none"
                      />
                      <button
                        onClick={() => handleUpdate(cid)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Check size={15} />
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
                      >
                        <X size={15} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium text-gray-700">{cat.name}</span>
                      <span className="text-xs text-gray-400">{cat.productCount || 0} products</span>
                      <button
                        onClick={() => {
                          setEditId(cid);
                          setEditName(cat.name);
                        }}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        disabled
                        onClick={() => window.confirm("Delete category?") && deleteCat(cid)}
                        className="p-1.5 text-gray-300 cursor-not-allowed rounded-lg transition-colors"
                        title="Deletion is temporarily disabled"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </li>
              );
            })}
            {!categories?.length && (
              <li className="py-10 text-center text-gray-400 text-sm">No categories yet.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
