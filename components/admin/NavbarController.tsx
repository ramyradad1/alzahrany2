import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import {
    Save, Plus, Trash2, ChevronUp, ChevronDown, ChevronRight,
    Loader2, Check, AlertCircle, Image, Type, Link as LinkIcon
} from 'lucide-react';

interface MenuItem {
    id: string;
    label: string;
    labelAr: string;
    href: string;
    order: number;
    icon?: string;
    children?: MenuItem[];
}

interface NavbarConfig {
    logo_url: string;
    site_name: string;
    site_name_ar: string;
    menu_items: MenuItem[];
}

const DEFAULT_CONFIG: NavbarConfig = {
    logo_url: '',
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
}

const MenuItemEditor: React.FC<MenuItemEditorProps> = ({
    item, index, totalItems, depth, onUpdate, onDelete, onMove, onAddChild
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

                {/* Icon - Moved here */}
                <div className="relative group/icon">
                    <input
                        type="text"
                        value={item.icon || ''}
                        onChange={(e) => onUpdate(item.id, 'icon', e.target.value)}
                        placeholder="Icon"
                        className="w-24 flex-shrink-0 px-2 py-1 border rounded text-sm dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                        title="Paste image URL here"
                    />
                    {item.icon && (
                        <div className="absolute top-full right-0 mt-1 hidden group-hover/icon:block z-50 p-1 bg-white shadow-lg rounded border">
                            <img src={item.icon} alt="preview" className="w-8 h-8 object-contain" />
                        </div>
                    )}
                </div>

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
            {/* Logo URL */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                    <Image className="w-5 h-5 text-cyan-500" /> Logo URL
                </h4>
                <input
                    type="url"
                    value={config.logo_url}
                    onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="https://example.com/logo.png"
                />
                {config.logo_url && (
                    <img src={config.logo_url} alt="Logo Preview" className="mt-4 h-16 object-contain" />
                )}
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
        </div>
    );
};

export default NavbarController;
