import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../src/db';
import { Category } from '../../types';
import { Plus, Edit, Trash2, Save, X, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { addToSyncQueue } from '../../src/services/syncQueue';

interface AdminCategoriesProps {
    lang: 'en' | 'ar';
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ lang }) => {
    const categories = useLiveQuery(() => db.categories.toArray()) || [];
    
    // State
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<Partial<Category>>({ name_en: '', name_ar: '', parent_id: null });
    const [expandedStats, setExpandedStats] = useState<Record<number, boolean>>({});

    // Helper to build tree
    const buildTree = (cats: Category[]) => {
        const map = new Map<number, Category & { children: any[] }>();
        cats.forEach(c => map.set(c.id, { ...c, children: [] }));
        const roots: (Category & { children: any[] })[] = [];
        
        cats.forEach(c => {
            const node = map.get(c.id)!;
            if (c.parent_id && map.has(c.parent_id)) {
                map.get(c.parent_id)!.children.push(node);
            } else {
                roots.push(node);
            }
        });
        return roots;
    };

    const tree = buildTree(categories);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Update
                const updated = { ...formData, id: isEditing } as Category;
                // Remove children if present to avoid circular reference in Dexie types
                const { children, ...updatePayload } = updated as any; 
                await (db.categories as any).update(isEditing, updatePayload);
                await addToSyncQueue('categories', 'UPDATE', updated);
            } else {
                // Create
                // Use a temporary negative ID for optimistic UI until sync
                const tempId = -Date.now(); 
                const newCat = { 
                    ...formData, 
                    id: tempId
                } as Category;
                
                await db.categories.add(newCat);
                await addToSyncQueue('categories', 'CREATE', newCat, tempId);
            }
            resetForm();
        } catch (error) {
            console.error('Failed to save category:', error);
            alert('Error saving category');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure? This will not delete products but might orphan subcategories.')) return;
        try {
            await db.categories.delete(id);
            await addToSyncQueue('categories', 'DELETE', { id });
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };

    const startEdit = (cat: Category) => {
        setFormData({ ...cat });
        setIsEditing(cat.id);
        setIsAdding(false);
    };

    const resetForm = () => {
        setFormData({ name_en: '', name_ar: '', parent_id: null });
        setIsEditing(null);
        setIsAdding(false);
    };

    const toggleExpand = (id: number) => {
        setExpandedStats(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Recursive Renderer
    const renderNode = (node: Category & { children: any[] }, depth = 0) => {
        const hasChildren = node.children.length > 0;
        const isExpanded = expandedStats[node.id];

        return (
            <div key={node.id} className="select-none">
                <div 
                    className={`flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${depth > 0 ? 'bg-slate-50/50 dark:bg-slate-900/20' : ''} pl-[length:var(--indent)]`}
                    style={{ '--indent': `${depth * 20 + 12}px` } as React.CSSProperties}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        {hasChildren ? (
                            <button onClick={() => toggleExpand(node.id)} className="text-slate-400 hover:text-cyan-500" title={isExpanded ? "Collapse" : "Expand"}>
                                {isExpanded ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                            </button>
                        ) : (
                            <Folder className="w-5 h-5 text-slate-300" />
                        )}
                        
                        <div className="flex flex-col">
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                                {lang === 'en' ? node.name_en : node.name_ar}
                            </span>
                            <span className="text-xs text-slate-400">
                                {lang === 'en' ? node.name_ar : node.name_en}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => startEdit(node)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                            title="Edit Category"
                            aria-label="Edit Category"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete(node.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            title="Delete Category"
                            aria-label="Delete Category"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div className="animate-fade-in-down">
                        {node.children.map(child => renderNode(child as Category & { children: any[] }, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* List */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300">Category Hierarchy</h3>
                    {!isAdding && !isEditing && (
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-500/20"
                        >
                            <Plus className="w-4 h-4" /> Add Category
                        </button>
                    )}
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tree.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">No categories found.</div>
                    ) : (
                        tree.map(node => renderNode(node))
                    )}
                </div>
            </div>

            {/* Editor */}
            {(isAdding || isEditing) && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 h-fit sticky top-6 animate-slide-in-right">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                            {isAdding ? 'New Category' : 'Edit Category'}
                        </h3>
                        <button onClick={resetForm} className="text-slate-400 hover:text-slate-600" title="Close">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name (English)</label>
                            <input 
                                required
                                value={formData.name_en}
                                onChange={e => setFormData({...formData, name_en: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 outline-none"
                                placeholder="Category Name (English)"
                                title="Category Name (English)"
                            />
                        </div>
                        <div dir="rtl">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الاسم (بالعربية)</label>
                            <input 
                                required
                                value={formData.name_ar}
                                onChange={e => setFormData({...formData, name_ar: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 outline-none"
                                placeholder="اسم الفئة (عربي)"
                                title="اسم الفئة (عربي)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Parent Category</label>
                            <select 
                                value={formData.parent_id || ''}
                                onChange={e => setFormData({...formData, parent_id: e.target.value ? Number(e.target.value) : null})}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 outline-none"
                                title="Select Parent Category"
                                aria-label="Select Parent Category"
                            >
                                <option value="">(None - Root Category)</option>
                                {categories
                                    .filter(c => c.id !== isEditing) // Prevent self-parenting
                                    .map(c => (
                                    <option key={c.id} value={c.id}>
                                        {lang === 'en' ? c.name_en : c.name_ar}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button 
                                type="submit"
                                className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold shadow-lg shadow-cyan-500/20 flex justify-center items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save
                            </button>
                            <button 
                                type="button" 
                                onClick={resetForm}
                                className="flex-1 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
