import React, { useState, useMemo } from 'react';
import { Product, Translations, Language, ProductFormData } from '../../types';
import { Plus, Search, Edit, Trash2, X, Image as ImageIcon, Save, AlertCircle } from 'lucide-react';

interface AdminProductsProps {
    products: Product[];
    onAdd: (data: ProductFormData) => Promise<void>;
    onEdit: (id: number, data: ProductFormData) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    t: Translations;
    lang: Language;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ products, onAdd, onEdit, onDelete, t, lang }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<ProductFormData>({
    name: '',
      category: '', // Legacy
      description: '',
      image: '',
    price: '',
      specifications: []
  });

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const handleOpenAdd = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
        category: '',
        description: '',
        image: '',
        price: '',
        specifications: []
    });
      setIsModalOpen(true);
  };

    const handleOpenEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            description: product.description,
            image: product.image,
            price: product.price || '',
            specifications: product.specifications || []
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
      setLoading(true);
      try {
        if (editingProduct) {
            await onEdit(editingProduct.id, formData);
        } else {
          await onAdd(formData);
      }
        setIsModalOpen(false);
    } catch (error) {
        console.error(error);
        alert('Operation failed');
    } finally {
        setLoading(false);
      }
  };

    const handleSpecChange = (index: number, field: 'label' | 'value', value: string) => {
        const newSpecs = [...(formData.specifications || [])];
        newSpecs[index] = { ...newSpecs[index], [field]: value };
      setFormData({ ...formData, specifications: newSpecs });
  };

    const addSpec = () => {
        setFormData({
        ...formData,
        specifications: [...(formData.specifications || []), { label: '', value: '' }]
    });
  };

    const removeSpec = (index: number) => {
        const newSpecs = [...(formData.specifications || [])];
        newSpecs.splice(index, 1);
        setFormData({ ...formData, specifications: newSpecs });
    };

    return (
      <div>
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
              <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                      type="text"
                      placeholder={t.search}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
              </div>
              <button 
                  onClick={handleOpenAdd}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-cyan-500/20"
              >
                  <Plus className="w-5 h-5" />
                  {t.addItem}
              </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                  <div key={product.id} className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                      <div className="relative h-48 overflow-hidden">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                              <span className="text-white font-bold">{product.category}</span>
                          </div>
                </div>
                <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{product.description}</p>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button 
                            onClick={() => handleOpenEdit(product)}
                            className="flex-1 py-2 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700/50 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-colors text-sm font-medium"
                        >
                            <Edit className="w-4 h-4" />
                            {t.editItem}
                        </button>
                        <button
                            onClick={() => onDelete(product.id)}
                            className="px-4 py-2 flex items-center justify-center bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        ))}

              {filteredProducts.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                      <AlertCircle className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-xl">No products found</p>
                  </div>
              )}
          </div>

          {/* Edit/Add Modal */}
          {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                      <div className="sticky top-0 z-10 flex justify-between items-center p-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                              {editingProduct ? t.editItem : t.addItem}
                          </h2>
                          <button
                              onClick={() => setIsModalOpen(false)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                          >
                              <X className="w-6 h-6" />
                          </button>
                      </div>

                      <form onSubmit={handleSubmit} className="p-6 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.name}</label>
                                  <input 
                                      type="text" 
                                      required 
                                      value={formData.name}
                                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.category}</label>
                                  <input 
                                      type="text"
                                      required
                                      value={formData.category}
                                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                                  />
                              </div>
                              <div className="col-span-full">
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.description}</label>
                                  <textarea 
                                      rows={3}
                                      required 
                                      value={formData.description}
                                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                                  />
                              </div>
                              <div className="col-span-full">
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.productImage} (URL)</label>
                                  <div className="flex gap-4">
                                      <div className="relative flex-1">
                                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                          <input
                                              type="url"
                                              required
                                              value={formData.image}
                                              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                                          />
                                      </div>
                                      {formData.image && (
                                          <img src={formData.image} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                                      )}
                                  </div>
                              </div>
                          </div>

                          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                              <div className="flex justify-between items-center mb-4">
                                  <h3 className="font-bold text-lg">{t.techSpecs}</h3>
                                  <button
                                      type="button" 
                                      onClick={addSpec}
                                      className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                  >
                                      + {t.addSpecRow}
                                  </button>
                              </div>
                              <div className="space-y-3">
                                  {formData.specifications?.map((spec, idx) => (
                                      <div key={idx} className="flex gap-3">
                                          <input
                                              type="text"
                                              placeholder={t.label}
                                              value={spec.label}
                              onChange={(e) => handleSpecChange(idx, 'label', e.target.value)}
                              className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                          />
                          <input
                              type="text"
                              placeholder={t.value}
                              value={spec.value}
                              onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                              className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                          />
                          <button
                              type="button" 
                              onClick={() => removeSpec(idx)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                  ))}
                              </div>
                          </div>

                          <div className="sticky bottom-0 bg-white dark:bg-slate-800 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                              <button
                                  type="button" 
                                  onClick={() => setIsModalOpen(false)}
                                  className="px-6 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              >
                                  {t.cancel}
                              </button>
                              <button
                                  type="submit" 
                                  disabled={loading}
                                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
                              >
                                  {loading ? <AlertCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                  {t.save}
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          )}
      </div>
  );
};
