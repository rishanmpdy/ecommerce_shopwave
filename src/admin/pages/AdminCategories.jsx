import React, { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import adminApi, { useCategories, useSubcategories } from "../adminShared";
import { Plus, Pencil, Trash2, X, Check, ChevronRight, Hash } from "lucide-react";
import { toast } from "react-toastify";

// A36 (Admin Category Workflow: Manages the hierarchical relationship between 
// Categories and Subcategories, ensuring data integrity across the product catalog)

// Puthiya category create cheyyanulla logic.
const useCreateCategory = () => {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async (data) => {
      // Backend-ilekku post request ayakkunnu.
      await adminApi.post("/admin/categories", data);
    },
    onSuccess: () => {
      // Success aayaal list refresh cheyyanam.
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category created!");
    },
  });
};

// Existing category update cheyyanulla logic.
const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      // Particular ID vechu patch request ayakkunnu.
      await adminApi.patch(`/admin/categories/${id}`, data);
    },
    onSuccess: () => {
      // Update kazhinjal list update cheyyunnu.
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category updated!");
    },
  });
};

// Category delete cheyyanulla logic.
const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      // Backend-il ninnu delete cheyyunnu.
      await adminApi.delete(`/admin/categories/${id}`);
    },
    onSuccess: () => {
      // Delete kazhinjal list refresh cheyyunnu.
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.error("Category deleted!");
    },
  });
};

// Puthiya subcategory create cheyyanulla logic.
const useCreateSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      // Subcategory data backend-ilekku ayakkunnu.
      await adminApi.post("/admin/subcategories", data);
    },
    onSuccess: () => {
      // Refresh subcategories list.
      queryClient.invalidateQueries({ queryKey: ["admin", "subcategories"] });
      toast.success("Subcategory created!");
    },
  });
};

// Subcategory update cheyyan.
const useUpdateSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      await adminApi.patch(`/admin/subcategories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subcategories"] });
      toast.success("Subcategory updated!");
    },
  });
};

// Subcategory delete cheyyan.
const useDeleteSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await adminApi.delete(`/admin/subcategories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subcategories"] });
      toast.error("Subcategory deleted!");
    },
  });
};

const AdminCategories = () => {
  // Data fetch cheyyunnu (Categories and Subcategories).
  const { data: categories, isLoading: isCatLoading } = useCategories();
  const { data: subcategories, isLoading: isSubLoading } = useSubcategories();

  // Mutations define cheyyunnu for CRUD operations.
  const { mutate: createCat } = useCreateCategory();
  const { mutate: updateCat } = useUpdateCategory();
  const { mutate: deleteCat } = useDeleteCategory();

  const { mutate: createSub } = useCreateSubcategory();
  const { mutate: updateSub } = useUpdateSubcategory();
  const { mutate: deleteSub } = useDeleteSubcategory();

  // Local states for UI management (Search, Edit modes, etc).
  const [activeCatId, setActiveCatId] = useState(null);
  const [newCatName, setNewCatName] = useState("");
  const [editCatId, setEditCatId] = useState(null);
  const [editCatName, setEditCatName] = useState("");

  const [newSubName, setNewSubName] = useState("");
  const [editSubId, setEditSubId] = useState(null);
  const [editSubName, setEditSubName] = useState("");

  // Currently select cheytha category kandupidikkunnu.
  const activeCategory = useMemo(() => {
    if (!activeCatId && categories?.length) return categories[0];
    return categories?.find(c => (c.id || c._id) === activeCatId);
  }, [categories, activeCatId]);

  // Selected category-kkulla subcategories mathram filter cheyyunnu.
  const filteredSubcategories = useMemo(() => {
    const cid = activeCategory?.id || activeCategory?._id;
    return subcategories?.filter(s => s.categoryId === cid) || [];
  }, [subcategories, activeCategory]);

  // Category create form submit cheyyumpol.
  const handleCreateCat = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    createCat({ id: `cat-${Date.now()}`, name: newCatName.trim(), productCount: 0 },
     { onSuccess: () => setNewCatName("") });
  };

  // Category update cheyyumpol.
  const handleUpdateCat = (id) => {
    if (!editCatName.trim()) return;
    updateCat({ id, data: { name: editCatName.trim() } }, { onSuccess: () => setEditCatId(null) });
  };

  // Subcategory create cheyyumpol.
  const handleCreateSub = (e) => {
    e.preventDefault();
    const cid = activeCategory?.id || activeCategory?._id;
    if (!newSubName.trim() || !cid) return;
    createSub({ id: `sub-${Date.now()}`, name: newSubName.trim(), categoryId: cid }, { onSuccess: () => setNewSubName("") });
  };

  // Subcategory update cheyyumpol.
  const handleUpdateSub = (id) => {
    if (!editSubName.trim()) return;
    updateSub({ id, data: { name: editSubName.trim() } }, { onSuccess: () => setEditSubId(null) });
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Page header area. */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage categories and subcategories.</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left side - Category list column. */}
        <div className="w-1/3 flex flex-col bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50/50">
            {/* New category add cheyyanulla form. */}
            <form onSubmit={handleCreateCat} className="flex gap-2">
              <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="New Category..." className="flex-1 px-3 py-2 bg-white rounded-lg text-sm focus:outline-none" />
              <button type="submit" className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"><Plus size={18} /></button>
            </form>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Categories list rendering. */}
            {isCatLoading ? (<div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>) : (
              categories?.map((cat) => {
                const cid = cat.id || cat._id;
                const isActive = (activeCategory?.id || activeCategory?._id) === cid;
                return (
                  <div key={cid} onClick={() => setActiveCatId(cid)} className={`group flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all ${isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>
                    <div className="flex-1 flex items-center gap-3">
                      {/* Edit mode check cheyyunnu. */}
                      {editCatId === cid ? (<input value={editCatName} onChange={(e) => setEditCatName(e.target.value)} autoFocus onClick={(e) => e.stopPropagation()} onBlur={() => handleUpdateCat(cid)} className="flex-1 px-2 py-1 bg-white rounded text-sm focus:outline-none" />) : (<span className="text-sm font-medium">{cat.name}</span>)}
                    </div>
                    {/* Edit/Delete buttons. */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); setEditCatId(cid); setEditCatName(cat.name); }} className="p-1 hover:text-indigo-600"><Pencil size={12} /></button>
                      <button onClick={(e) => { e.stopPropagation(); if (window.confirm("Delete category and its subcategories?")) deleteCat(cid); }} className="p-1 hover:text-red-600"><Trash2 size={12} /></button>
                    </div>
                    {isActive && <ChevronRight size={16} className="ml-2" />}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right side - Subcategory management area. */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm overflow-hidden">
          {!activeCategory ? (
            // Category select cheythilla enkil empty state kaanikkunnu.
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center"><Hash size={48} className="mb-4 opacity-20" /><p>Select a category to manage its subcategories</p></div>
          ) : (
            <>
              {/* Selected category details area. */}
              <div className="p-6 flex items-center justify-between bg-indigo-50/30">
                <div><h2 className="text-lg font-bold text-gray-800">{activeCategory.name}</h2><p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Subcategories</p></div>
                {/* Subcategory create form. */}
                <form onSubmit={handleCreateSub} className="flex gap-2 w-64">
                  <input value={newSubName} onChange={(e) => setNewSubName(e.target.value)} placeholder={`AddNew Sub ${activeCategory.name}...`} className="flex-1 px-3 py-2 bg-white rounded-lg text-sm focus:outline-none" />
                  <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors"><Plus size={16} /></button>
                </form>
              </div>
              <div className="flex-1 overflow-y-auto">
                {/* Subcategories table rendering. */}
                {isSubLoading ? (<div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/50 sticky top-0"><tr><th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Subcategory Name</th><th className="text-right px-6 py-3 text-xs font-bold text-gray-400 uppercase">Actions</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredSubcategories.map((sub) => {
                        const sid = sub.id || sub._id;
                        return (
                          <tr key={sid} className="group hover:bg-indigo-100 transition-colors">
                            <td className="px-6 py-4">
                              {/* Subcategory edit mode. */}
                              {editSubId === sid ? (<input value={editSubName} onChange={(e) => setEditSubName(e.target.value)} autoFocus onBlur={() => handleUpdateSub(sid)} className="w-full max-w-xs px-2 py-1 bg-white rounded text-sm focus:outline-none" />) : (<span className="font-medium text-gray-700">{sub.name}</span>)}
                            </td>
                            <td className="px-6 py-4">
                              {/* Subcategory actions. */}
                              <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditSubId(sid); setEditSubName(sub.name); }} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                                <button onClick={() => window.confirm("Delete subcategory?") && deleteSub(sid)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredSubcategories.length === 0 && (<tr><td colSpan={2} className="py-20 text-center text-gray-400">No subcategories found for this category.</td></tr>)}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
