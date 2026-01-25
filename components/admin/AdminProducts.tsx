import React, { useState, useRef, useMemo } from 'react';
import { Package, Plus, Image as ImageIcon, Edit, Trash2, X, Upload, Loader2, Save, AlertTriangle } from 'lucide-react';
import { Product, ProductFormData, Translations, Language, Specification } from '../../types';

interface AdminProductsProps {
    products: Product[];
    onAdd: (product: ProductFormData) => void;
    onEdit: (id: number, product: ProductFormData) => void;
    onDelete: (id: number) => void;
    t: Translations;
    lang: Language;
}

const INITIAL_FORM_STATE: ProductFormData = {
    name: '',
    price: '',
    category: '',
    image: '',
    images: [],
    description: '',
    specifications: []
};

export const AdminProducts: React.FC<AdminProductsProps> = ({ products, onAdd, onEdit, onDelete, t, lang }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM_STATE);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [fileError, setFileError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const existingCategories = useMemo(() => {
        return Array.from(new Set(products.map(p => p.category)));
    }, [products]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalPrice = formData.price === '' || formData.price === 0 ? undefined : Number(formData.price);

        const cleanedFormData: ProductFormData = {
            ...formData,
            price: finalPrice,
            specifications: formData.specifications.filter(s => s.label.trim() !== '' || s.value.trim() !== '')
        };

        setIsSaving(true);
        setUploadProgress(0);

        // Simulate progress - since we can't track actual JSON body upload easily
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) return 90;
                return prev + 5;
            });
        }, 200);

        try {
            if (isEditing !== null) {
                await onEdit(isEditing, cleanedFormData);
                setIsEditing(null);
            } else {
                await onAdd(cleanedFormData);
                setIsAdding(false);
            }
            setUploadProgress(100);
            setFormData(INITIAL_FORM_STATE);
        } catch (error) {
            console.error(error);
            alert("An error occurred while saving.");
        } finally {
            clearInterval(interval);
            setTimeout(() => {
                setIsSaving(false);
                setUploadProgress(0);
            }, 500);
        }
    };

    const processFile = (file: File, callback: (result: string) => void, setLoading: (l: boolean) => void) => {
        if (file.size > 1024 * 1024) {
            setFileError('Image too large (>1MB). Please compress it to save storage space.');
            return;
        }
        setFileError('');
        setLoading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            callback(reader.result as string);
            setLoading(false);
        };
        reader.readAsDataURL(file);
    };

    // ... (rest of methods handleMainImageUpload etc. stay the same until return)

    const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file, (result) => {
                setFormData(prev => ({ ...prev, image: result }));
            }, setIsProcessingImage);
        }
    };

    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file, (result) => {
                setFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), result]
                }));
            }, setIsProcessingImage);
        }
    };

    const handleRemoveGalleryImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index)
        }));
    };

    const handleAddSpec = () => {
        setFormData(prev => ({
            ...prev,
            specifications: [...prev.specifications, { label: '', value: '' }]
        }));
    };

    const handleRemoveSpec = (index: number) => {
        setFormData(prev => ({
            ...prev,
            specifications: prev.specifications.filter((_, i) => i !== index)
        }));
    };

    const handleSpecChange = (index: number, field: keyof Specification, value: string) => {
        const newSpecs = [...formData.specifications];
        newSpecs[index] = { ...newSpecs[index], [field]: value };
        setFormData(prev => ({ ...prev, specifications: newSpecs }));
    };

    const startEdit = (product: Product) => {
        setFormData({
            name: product.name,
            price: product.price || '',
            category: product.category,
            image: product.image,
            images: product.images || [product.image],
            description: product.description,
            specifications: product.specifications || []
        });
        setIsEditing(product.id);
        setIsAdding(false);
        setFileError('');
    };

    const startAdd = () => {
        setFormData(INITIAL_FORM_STATE);
        setIsAdding(true);
        setIsEditing(null);
        setFileError('');
    };

    const cancelForm = () => {
        setIsAdding(false);
        setIsEditing(null);
        setFormData(INITIAL_FORM_STATE);
        setFileError('');
    };

    return (
        <div className="animate-fade-in-up">
            <div className="flex justify-end mb-4">
                {!isAdding && !isEditing && (
                    <button
                        onClick={startAdd}
                        className="flex items-center justify-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-cyan-500/20"
                    >
                        <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        {t.addItem}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`lg:col-span-${isAdding || isEditing ? '2' : '3'} transition-all duration-300`}>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left rtl:text-right">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.item}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.category}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.price}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right rtl:text-left">{t.actions}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {product.image ? (
                                                        <img src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover mr-3 rtl:ml-3 rtl:mr-0 bg-slate-100 dark:bg-slate-700" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center mr-3 rtl:ml-3 rtl:mr-0 text-slate-400 border border-slate-200 dark:border-slate-600">
                                                            <ImageIcon className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-slate-900 dark:text-slate-200">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-slate-700 dark:text-cyan-400 font-semibold">
                                                {product.price ? `$${product.price.toFixed(2)}` : <span className="text-slate-400 italic">On Request</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right rtl:text-left space-x-2">
                                                <button
                                                    onClick={() => startEdit(product)}
                                                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors inline-block"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(product.id)}
                                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors inline-block"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {products.length === 0 && (
                                <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>{t.noProducts}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {(isAdding || isEditing) && (
                    <div className="lg:col-span-1 animate-fade-in-right">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 sticky top-24 max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {isAdding ? t.addItem : t.editItem}
                                </h3>
                                <button onClick={cancelForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                {isSaving && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs mb-1 text-slate-600 dark:text-slate-300">
                                            <span>Saving...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-cyan-500 h-2 rounded-full transition-all duration-300 ease-out"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.name}</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-900 dark:text-white transition-all text-left rtl:text-right"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.price} <span className="text-xs text-slate-400 font-normal">(Optional)</span></label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="On Request"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-900 dark:text-white transition-all text-left rtl:text-right placeholder-slate-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.category}</label>
                                        <input
                                            required
                                            type="text"
                                            list="categories-list"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-900 dark:text-white transition-all text-left rtl:text-right"
                                            placeholder={lang === 'en' ? "Select or Type..." : "اختر أو اكتب..."}
                                        />
                                        <datalist id="categories-list">
                                            {existingCategories.map(cat => (
                                                <option key={cat} value={cat} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.description}</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none text-slate-900 dark:text-white transition-all text-left rtl:text-right"
                                    />
                                </div>

                                <div className="border-t border-b border-slate-200 dark:border-slate-700 py-4 my-2">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t.techSpecs}</label>
                                        <button
                                            type="button"
                                            onClick={handleAddSpec}
                                            className="text-xs flex items-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1 rounded transition-colors"
                                        >
                                            <Plus className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" /> {t.addSpecRow}
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {formData.specifications.length === 0 && (
                                            <p className="text-xs text-slate-400 italic text-center py-2">No specifications added yet.</p>
                                        )}
                                        {formData.specifications.map((spec, index) => (
                                            <div key={index} className="flex gap-2 items-start animate-fade-in-up">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        placeholder={t.label}
                                                        value={spec.label}
                                                        onChange={(e) => handleSpecChange(index, 'label', e.target.value)}
                                                        className="w-full px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-slate-900 dark:text-white text-left rtl:text-right"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        placeholder={t.value}
                                                        value={spec.value}
                                                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                                        className="w-full px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-slate-900 dark:text-white text-left rtl:text-right"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSpec(index)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.productImage}</label>
                                    <div
                                        onClick={() => !isProcessingImage && fileInputRef.current?.click()}
                                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all group ${isProcessingImage
                                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/10 cursor-wait'
                                            : 'border-slate-300 dark:border-slate-600 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-cyan-500 dark:hover:border-cyan-500'
                                            }`}
                                    >
                                        <div className="space-y-1 text-center">
                                            {isProcessingImage ? (
                                                <div className="py-4">
                                                    <Loader2 className="w-8 h-8 mx-auto text-cyan-600 dark:text-cyan-400 animate-spin mb-2" />
                                                    <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">Processing...</p>
                                                </div>
                                            ) : formData.image ? (
                                                <div className="relative">
                                                    <img src={formData.image} alt="Preview" className="mx-auto h-32 object-contain rounded-md shadow-md" />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                                        <p className="text-white text-xs font-medium">{t.clickToChange}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="mx-auto h-12 w-12 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                                                    <div className="flex text-sm text-slate-600 dark:text-slate-400">
                                                        <span className="relative rounded-md font-medium text-cyan-600 hover:text-cyan-500 focus-within:outline-none">
                                                            {t.uploadFile}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-500">Max 1MB</p>
                                                </>
                                            )}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={handleMainImageUpload}
                                                disabled={isProcessingImage}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Gallery Images (Optional)</label>
                                    <div className="grid grid-cols-4 gap-2 mb-2">
                                        {formData.images?.map((img, idx) => (
                                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveGalleryImage(idx)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => galleryInputRef.current?.click()}
                                            className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-cyan-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-cyan-500"
                                        >
                                            <Plus className="w-6 h-6" />
                                            <span className="text-[10px] mt-1">Add</span>
                                        </button>
                                    </div>
                                    <input
                                        ref={galleryInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={handleGalleryUpload}
                                        disabled={isProcessingImage}
                                    />
                                </div>

                                {fileError && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <AlertTriangle className="w-4 h-4" />
                                        {fileError}
                                    </div>
                                )}

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-cyan-500/20 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isProcessingImage || isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                                {t.save}
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelForm}
                                        disabled={isSaving}
                                        className="flex-1 py-2.5 px-4 bg-transparent border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-all"
                                    >
                                        {t.cancel}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
