import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../src/db';
import { Language } from '../../types';
import { addToSyncQueue } from '../../src/services/syncQueue';
import { Plus, Edit, Trash2, X, ChevronRight, ChevronDown, FolderOpen } from 'lucide-react';

interface AdminCategoriesProps {
    lang: Language;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ lang }) => {
    const categories = useLiveQuery(() => db.categories.toArray(), []) || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name_en: '', name_ar: '', parent_id: '' });
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    const toggleExpand = (id: number) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleOpenAdd = (parentId?: number) => {
        setEditingId(null);
        setFormData({ name_en: '', name_ar: '', parent_id: parentId?.toString() || '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (cat: any) => {
        setEditingId(cat.id);
        setFormData({
            name_en: cat.name_en,
            name_ar: cat.name_ar,
            parent_id: cat.parent_id?.toString() || ''
        });
      setIsModalOpen(true);
  };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
        const parentId = formData.parent_id ? parseInt(formData.parent_id) : undefined;

        if (editingId) {
            await (db.categories as any).update(editingId, {
                name_en: formData.name_en,
                name_ar: formData.name_ar,
                parent_id: parentId
            });
            await addToSyncQueue('categories', 'UPDATE', {
                id: editingId,
                name_en: formData.name_en,
                name_ar: formData.name_ar,
                parent_id: parentId
            });
        } else {
          const id = Date.now();
          const newCat = {
              id,
              name_en: formData.name_en,
              name_ar: formData.name_ar,
              parent_id: parentId
          };
          await db.categories.add(newCat);
          await addToSyncQueue('categories', 'CREATE', newCat, id);
      }
        setIsModalOpen(false);
    } catch (error) {
          console.error(error);
          alert('Operation failed');
      }
  };

    const handleDelete = async (id: number) => {
      if (confirm('Delete this category?')) {
          try {
              await db.categories.delete(id);
              await addToSyncQueue('categories', 'DELETE', { id });
          } catch (error) {
              console.error(error);
          }
      }
  };

    const buildTree = (parentId: number | undefined = undefined) => {
        return categories
            .filter(c => c.parent_id === parentId)
            .map(cat => (
                <div key={cat.id} className="ml-6 border-l-2 border-slate-100 dark:border-slate-700 pl-4 py-2">
                    <div className="flex items-center gap-2 group">
                        <button onClick={() => toggleExpand(cat.id)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400" aria-label={expanded[cat.id] ? "Collapse" : "Expand"}>
                            {expanded[cat.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                  <FolderOpen className="w-5 h-5 text-cyan-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                      {lang === 'en' ? cat.name_en : cat.name_ar}
                  </span>

                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button onClick={() => handleOpenAdd(cat.id)} className="p-1 text-green-500 hover:bg-green-50 rounded" title="Add Subcategory" aria-label="Add Subcategory">
                          <Plus className="w-4 h-4" />
                      </button>
                            <button onClick={() => handleOpenEdit(cat)} className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="Edit Category" aria-label="Edit Category">
                          <Edit className="w-4 h-4" />
                      </button>
                            <button onClick={() => handleDelete(cat.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Delete Category" aria-label="Delete Category">
                          <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
              </div>
              {expanded[cat.id] && buildTree(cat.id)}
          </div>
      ));
  };

    return (
      <div>
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Category Structure</h3>
              <button 
                  onClick={() => handleOpenAdd()}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                  <Plus className="w-4 h-4" />
                  Add Root Category
              </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              {buildTree(undefined)}
              {categories.length === 0 && <p className="text-center text-slate-500 py-8">No categories found</p>}
          </div>

          {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md p-6">
                      <div className="flex justify-between mb-4">
                          <h3 className="font-bold text-lg">{editingId ? 'Edit Category' : 'New Category'}</h3>
                          <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
                      </div>
                      <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="cat_name_en">English Name</label>
                              <input
                                    id="cat_name_en"
                                  required
                                  value={formData.name_en}
                                  onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                              />
                          </div>
                          <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="cat_name_ar">Arabic Name</label>
                              <input
                                    id="cat_name_ar"
                                  required
                                  value={formData.name_ar}
                                  onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-lg text-right"
                              />
                          </div>
                          <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="cat_parent_id">Parent ID (Optional)</label>
                              <input
                                    id="cat_parent_id"
                                  type="number"
                                  value={formData.parent_id}
                                  onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                                  placeholder="Root if empty"
                              />
                          </div>
                          <button
                              type="submit"
                              className="w-full py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-bold"
                          >
                              Save Category
                          </button>
                      </form>
                  </div>
              </div>
          )}
      </div>
  );
};
