import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import {
    Save, Plus, Trash2, ChevronUp, ChevronDown, ChevronRight,
    Loader2, Check, AlertCircle, Image, Type, Link as LinkIcon,
    X, Upload
} from 'lucide-react';

const processImage = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const MAX_WIDTH = 200;
            const MAX_HEIGHT = 200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);
            callback(canvas.toDataURL('image/webp', 0.8)); // Convert to optimized WebP
        };
    };
};
import { NavbarConfig, MenuItem } from '../../types';

const DEFAULT_CONFIG: NavbarConfig = {
    logo_url: '',
    logo_size: 40,
    favicon_url: '',
    favicon_size: 32,
    site_name: 'Alzahrany Trading',
    site_name_ar: 'الزهراني للتجارة',
    menu_items: [
        { id: '1', label: 'Home', labelAr: 'الرئيسية', href: '/', order: 0 },
        { id: '2', label: 'Products', labelAr: 'المنتجات', href: '/catalog', order: 1, children: [] },
        { id: '3', label: 'Partners', labelAr: 'الشركاء', href: '/#partners', order: 2 },
        { id: '4', label: 'About', labelAr: 'من نحن', href: '/about', order: 3 },
    ]
};

// Recursive MenuItem Editor Component
interface MenuItemEditorProps {
    item: MenuItem;
    index: number;
    totalItems: number;
    depth: number;
    onUpdate: (id: string, field: keyof MenuItem, value: any) => void;
    onDelete: (id: string) => void;
    onMove: (id: string, direction: 'up' | 'down') => void;
    onAddChild: (parentId: string) => void;
    onEditIcon: (id: string, icon: string) => void;
}

const MenuItemEditor: React.FC<MenuItemEditorProps> = ({
    item, index, totalItems, depth, onUpdate, onDelete, onMove, onAddChild, onEditIcon
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = item.children && item.children.length > 0;

    return (
        <div className={`${depth > 0 ? 'ml-6 border-l-2 border-cyan-200 dark:border-cyan-800 pl-3' : ''}`}>
            <div className={`flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg ${depth > 0 ? 'bg-slate-100 dark:bg-slate-600' : ''}`}>
                {/* Expand/Collapse for items with children */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`p-1 hover:bg-slate-200 dark:hover:bg-slate-500 rounded ${!hasChildren && !item.children ? 'opacity-0' : ''}`}
                    disabled={!hasChildren && !item.children}
                >
                    <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {/* Move Up/Down */}
                <div className="flex flex-col gap-0.5">
                    <button
                        onClick={() => onMove(item.id, 'up')}
                        disabled={index === 0}
                        className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-500 rounded disabled:opacity-30"
                    >
                        <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => onMove(item.id, 'down')}
                        disabled={index === totalItems - 1}
                        className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-500 rounded disabled:opacity-30"
                    >
                        <ChevronDown className="w-3 h-3" />
                    </button>
                </div>

                {/* Label EN */}
                <input
                    type="text"
                    value={item.label}
                    onChange={(e) => onUpdate(item.id, 'label', e.target.value)}
                    placeholder="Label (EN)"
                    className="flex-1 px-2 py-1 border rounded text-sm dark:bg-slate-600 dark:border-slate-500 dark:text-white min-w-0"
                />

                {/* Label AR */}
                <input
                    type="text"
                    value={item.labelAr}
                    onChange={(e) => onUpdate(item.id, 'labelAr', e.target.value)}
                    placeholder="AR"
                    className="w-24 px-2 py-1 border rounded text-sm dark:bg-slate-600 dark:border-slate-500 dark:text-white text-right"
                    dir="rtl"
                />

                {/* URL */}
                <input
                    type="text"
                    value={item.href}
                    onChange={(e) => onUpdate(item.id, 'href', e.target.value)}
                    placeholder="URL"
                    className="w-28 px-2 py-1 border rounded text-sm dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                />

                {/* Icon Controller */}
                <div className="relative group/icon-wrapper">
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded border border-slate-300 dark:border-slate-500 hover:border-cyan-500 bg-slate-50 dark:bg-slate-700 transition-colors"
                        onClick={() => onEditIcon(item.id, item.icon || '')}
                        title="Change Icon"
                    >
                        {item.icon ? (
                            <img src={item.icon} alt="icon" className="w-5 h-5 object-contain" />
                        ) : (
                            <Image className="w-4 h-4 text-slate-400" />
                        )}
                    </button>

                    {/* Modal for Icon Selection */}

                </div>

                {/* Backdrpop for closing */}
                {/* Simplified: Using X button to close logic above for now to keep local state clean without huge refactor */}

                {/* Add Sub-item */}
                <button
                    onClick={() => {
                        onAddChild(item.id);
                        setIsExpanded(true);
                    }}
                    className="p-1 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded"
                    title="Add sub-item"
                >
                    <Plus className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                    onClick={() => onDelete(item.id)}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Children */}
            {isExpanded && item.children && item.children.length > 0 && (
                <div className="mt-2 space-y-2">
                    {item.children.map((child, childIndex) => (
                        <MenuItemEditor
                            key={child.id}
                            item={child}
                            index={childIndex}
                            totalItems={item.children!.length}
                            depth={depth + 1}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onMove={onMove}
                            onAddChild={onAddChild}
                            onEditIcon={onEditIcon}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

interface NavbarControllerProps {
    t: any;
}

export const NavbarController: React.FC<NavbarControllerProps> = ({ t }) => {
    const [config, setConfig] = useState<NavbarConfig>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [editingIcon, setEditingIcon] = useState<{ id: string, icon: string } | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('navbar_config')
                .select('*')
                .eq('id', 'main')
                .single();

            if (data && !error) {
                setConfig({
                    logo_url: data.logo_url || '',
                    logo_size: data.logo_size || 40,
                    favicon_url: data.favicon_url || '',
                    favicon_size: data.favicon_size || 32,
                    site_name: data.site_name || DEFAULT_CONFIG.site_name,
                    site_name_ar: data.site_name_ar || DEFAULT_CONFIG.site_name_ar,
                    menu_items: data.menu_items?.length ? data.menu_items : DEFAULT_CONFIG.menu_items,
                });
            }
        } catch (e) {
            console.log('Using default navbar config');
        }
        setLoading(false);
    };

    const saveConfig = async () => {
        setSaving(true);
        setMessage('');

        try {
            const { error } = await supabase
                .from('navbar_config')
                .upsert({
                    id: 'main',
                    logo_url: config.logo_url,
                    logo_size: config.logo_size,
                    favicon_url: config.favicon_url,
                    favicon_size: config.favicon_size,
                    site_name: config.site_name,
                    site_name_ar: config.site_name_ar,
                    menu_items: config.menu_items,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
            setMessage('Saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (e: any) {
            setMessage('Error: ' + (e.message || 'Failed to save'));
        }
        setSaving(false);
    };

    // Recursive function to find and update item in tree
    const updateItemInTree = (items: MenuItem[], id: string, field: keyof MenuItem, value: any): MenuItem[] => {
        return items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            if (item.children) {
                return { ...item, children: updateItemInTree(item.children, id, field, value) };
            }
            return item;
        });
    };

    // Recursive function to delete item from tree
    const deleteItemFromTree = (items: MenuItem[], id: string): MenuItem[] => {
        return items
            .filter(item => item.id !== id)
            .map(item => ({
                ...item,
                children: item.children ? deleteItemFromTree(item.children, id) : undefined
            }));
    };

    // Add child to a parent item
    const addChildToItem = (items: MenuItem[], parentId: string): MenuItem[] => {
        return items.map(item => {
            if (item.id === parentId) {
                const newChild: MenuItem = {
                    id: Date.now().toString(),
                    label: 'Sub-item',
                    labelAr: 'عنصر فرعي',
                    href: '/',
                    order: (item.children?.length || 0),
                };
                return {
                    ...item,
                    children: [...(item.children || []), newChild]
                };
            }
            if (item.children) {
                return { ...item, children: addChildToItem(item.children, parentId) };
            }
            return item;
        });
    };

    // Move item within its siblings (recursive)
    const moveItemInTree = (items: MenuItem[], id: string, direction: 'up' | 'down'): MenuItem[] => {
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            const newItems = [...items];
            if (direction === 'up' && index > 0) {
                [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
            } else if (direction === 'down' && index < items.length - 1) {
                [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
            }
            return newItems.map((item, i) => ({ ...item, order: i }));
        }
        // Recursively check children
        return items.map(item => ({
            ...item,
            children: item.children ? moveItemInTree(item.children, id, direction) : undefined
        }));
    };

    const handleUpdate = (id: string, field: keyof MenuItem, value: any) => {
        setConfig(prev => ({
            ...prev,
            menu_items: updateItemInTree(prev.menu_items, id, field, value)
        }));
    };

    const handleDelete = (id: string) => {
        setConfig(prev => ({
            ...prev,
            menu_items: deleteItemFromTree(prev.menu_items, id)
        }));
    };

    const handleMove = (id: string, direction: 'up' | 'down') => {
        setConfig(prev => ({
            ...prev,
            menu_items: moveItemInTree(prev.menu_items, id, direction)
        }));
    };

    const handleAddChild = (parentId: string) => {
        setConfig(prev => ({
            ...prev,
            menu_items: addChildToItem(prev.menu_items, parentId)
        }));
    };

    const handleEditIcon = (id: string, icon: string) => {
        setEditingIcon({ id, icon });
    };

    const handleIconChange = (val: string) => {
        if (!editingIcon) return;
        setEditingIcon(prev => prev ? { ...prev, icon: val } : null);

        if (editingIcon.id === 'logo_url') {
            setConfig(prev => ({ ...prev, logo_url: val }));
        } else if (editingIcon.id === 'favicon_url') {
            setConfig(prev => ({ ...prev, favicon_url: val }));
        } else {
            handleUpdate(editingIcon.id, 'icon', val);
        }
    };

    const addTopLevelItem = () => {
        const newItem: MenuItem = {
            id: Date.now().toString(),
            label: 'New Link',
            labelAr: 'رابط جديد',
            href: '/',
            order: config.menu_items.length,
        };
        setConfig({ ...config, menu_items: [...config.menu_items, newItem] });
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                <span className="ml-2 text-slate-600 dark:text-slate-400">Loading navbar settings...</span>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-fade-in-up">
            {/* Logo & Favicon Section */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Logo URL */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                        <Image className="w-5 h-5 text-cyan-500" /> Website Logo
                    </h4>

                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={config.logo_url}
                                onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
                                className="flex-1 px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                                placeholder="https://..."
                            />
                            <button
                                onClick={() => setEditingIcon({ id: 'logo_url', icon: config.logo_url })}
                                className="px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                                title="Upload Image"
                            >
                                <Upload className="w-4 h-4" />
                            </button>
                            {config.logo_url && (
                                <button
                                    onClick={() => setConfig({ ...config, logo_url: '' })}
                                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                    title="Delete Logo"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {config.logo_url ? (
                            <div className="flex items-start gap-4">
                                <img
                                    src={config.logo_url}
                                    alt="Logo Preview"
                                    style={{ width: config.logo_size || 40 }}
                                    className="object-contain bg-slate-50 dark:bg-slate-900 rounded p-1 border border-slate-200 dark:border-slate-700"
                                />
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-slate-500 mb-2">
                                        Logo Size: {config.logo_size || 40}px
                                    </label>
                                    <input
                                        type="range"
                                        min="20"
                                        max="120"
                                        value={config.logo_size || 40}
                                        onChange={(e) => setConfig({ ...config, logo_size: parseInt(e.target.value) })}
                                        className="w-full accent-cyan-500"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="h-16 flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-400">
                                No Logo
                            </div>
                        )}
                    </div>
                </div>

                {/* Favicon URL */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                        <Image className="w-5 h-5 text-purple-500" /> Favicon (Icon)
                    </h4>

                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={config.favicon_url || ''}
                                onChange={(e) => setConfig({ ...config, favicon_url: e.target.value })}
                                className="flex-1 px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                                placeholder="https://..."
                            />
                            <button
                                onClick={() => setEditingIcon({ id: 'favicon_url', icon: config.favicon_url || '' })}
                                className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                                title="Upload Image"
                            >
                                <Upload className="w-4 h-4" />
                            </button>
                            {config.favicon_url && (
                                <button
                                    onClick={() => setConfig({ ...config, favicon_url: '' })}
                                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                    title="Delete Favicon"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {config.favicon_url ? (
                            <div className="flex items-start gap-4">
                                <img
                                    src={config.favicon_url}
                                    alt="Favicon Preview"
                                    style={{ width: config.favicon_size || 32, height: config.favicon_size || 32 }}
                                    className="object-contain bg-slate-50 dark:bg-slate-900 rounded p-1 border border-slate-200 dark:border-slate-700"
                                />
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-slate-500 mb-2">
                                        Favicon Size: {config.favicon_size || 32}px
                                    </label>
                                    <input
                                        type="range"
                                        min="16"
                                        max="64"
                                        value={config.favicon_size || 32}
                                        onChange={(e) => setConfig({ ...config, favicon_size: parseInt(e.target.value) })}
                                        className="w-full accent-purple-500"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-400">
                                None
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Site Name */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                    <Type className="w-5 h-5 text-cyan-500" /> Site Name
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">English</label>
                        <input
                            type="text"
                            value={config.site_name}
                            onChange={(e) => setConfig({ ...config, site_name: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">Arabic</label>
                        <input
                            type="text"
                            value={config.site_name_ar}
                            onChange={(e) => setConfig({ ...config, site_name_ar: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-right"
                            dir="rtl"
                        />
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                        <LinkIcon className="w-5 h-5 text-cyan-500" /> Menu Items (with Dropdowns)
                    </h4>
                    <button
                        onClick={addTopLevelItem}
                        className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
                    >
                        <Plus className="w-4 h-4" /> Add Menu Item
                    </button>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                    💡 Click the <strong>+ button</strong> on any item to add a dropdown sub-item. Sub-items can also have their own dropdowns.
                </p>

                <div className="space-y-2">
                    {config.menu_items.map((item, index) => (
                        <MenuItemEditor
                            key={item.id}
                            item={item}
                            index={index}
                            totalItems={config.menu_items.length}
                            depth={0}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                            onMove={handleMove}
                            onAddChild={handleAddChild}
                            onEditIcon={handleEditIcon}
                        />
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4 pt-2">
                <button
                    onClick={saveConfig}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 shadow-lg shadow-cyan-500/25"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>

                {message && (
                    <span className={`flex items-center gap-2 font-medium ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                        {message.includes('Error') ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                        {message}
                    </span>
                )}
            </div>

            {/* Top Level Icon Modal */}
            {editingIcon && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div
                        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm p-5 transform transition-all scale-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Image className="w-4 h-4 text-cyan-500" />
                                {editingIcon.id === 'logo_url' ? 'Upload Logo' : editingIcon.id === 'favicon_url' ? 'Upload Favicon' : 'Select Icon'}
                            </h3>
                            <button
                                onClick={() => setEditingIcon(null)}
                                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Option 1: URL */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Image Link (URL)</label>
                                <input
                                    type="text"
                                    value={editingIcon.icon || ''}
                                    onChange={(e) => handleIconChange(e.target.value)}
                                    placeholder="https://example.com/icon.png"
                                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                                />
                            </div>

                            <div className="relative flex py-1 items-center">
                                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                                <span className="flex-shrink-0 mx-2 text-xs text-slate-400">OR UPLOAD</span>
                                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                            </div>

                            {/* Option 2: Upload */}
                            <div>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 cursor-pointer transition-all group">
                                    <div className="text-center p-4">
                                        <Upload className="w-8 h-8 mx-auto text-slate-400 group-hover:text-cyan-500 mb-2 transition-colors" />
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                            Click to upload PNG or SVG
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1">Max size 1MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/png,image/svg+xml,image/jpeg,image/webp"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setLoading(true);
                                                processImage(file, (base64) => {
                                                    handleIconChange(base64);
                                                    setLoading(false);
                                                });
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            {editingIcon.icon && (
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                                    <button
                                        onClick={() => handleIconChange('')}
                                        className="w-full py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" /> Remove Icon
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={() => setEditingIcon(null)}
                                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-cyan-500/20"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NavbarController;
