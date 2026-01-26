import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import {
    Save, Plus, Trash2, ChevronUp, ChevronDown,
    Loader2, Check, AlertCircle, Image, Type, Link as LinkIcon
} from 'lucide-react';

interface MenuItem {
    id: string;
    label: string;
    labelAr: string;
    href: string;
    order: number;
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
        { id: '2', label: 'Products', labelAr: 'المنتجات', href: '/catalog', order: 1 },
        { id: '3', label: 'Partners', labelAr: 'الشركاء', href: '/#partners', order: 2 },
        { id: '4', label: 'About', labelAr: 'من نحن', href: '/about', order: 3 },
    ]
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

    const addMenuItem = () => {
        const newItem: MenuItem = {
            id: Date.now().toString(),
            label: 'New Link',
            labelAr: 'رابط جديد',
            href: '/',
            order: config.menu_items.length,
        };
        setConfig({ ...config, menu_items: [...config.menu_items, newItem] });
    };

    const updateMenuItem = (id: string, field: keyof MenuItem, value: string) => {
        setConfig({
            ...config,
            menu_items: config.menu_items.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            ),
        });
    };

    const deleteMenuItem = (id: string) => {
        setConfig({
            ...config,
            menu_items: config.menu_items.filter(item => item.id !== id),
        });
    };

    const moveMenuItem = (id: string, direction: 'up' | 'down') => {
        const items = [...config.menu_items];
        const index = items.findIndex(item => item.id === id);
        if (direction === 'up' && index > 0) {
            [items[index], items[index - 1]] = [items[index - 1], items[index]];
        } else if (direction === 'down' && index < items.length - 1) {
            [items[index], items[index + 1]] = [items[index + 1], items[index]];
        }
        setConfig({ ...config, menu_items: items.map((item, i) => ({ ...item, order: i })) });
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-200 dark:border-cyan-800 p-6">
                <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
                    <span className="text-slate-600 dark:text-slate-400">Loading navbar settings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-200 dark:border-cyan-800 overflow-hidden">
            {/* Header - Always Visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-6 flex items-center justify-between hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500 rounded-lg">
                        <LinkIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Navbar Controller</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Customize logo, site name & navigation menu</p>
                    </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {/* Expandable Content */}
            {isExpanded && (
                <div className="p-6 pt-0 space-y-6">
                    {/* Logo URL */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                            <Image className="w-4 h-4 text-cyan-500" /> Logo URL
                        </h4>
                        <input
                            type="url"
                            value={config.logo_url}
                            onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            placeholder="https://example.com/logo.png"
                        />
                        {config.logo_url && (
                            <img src={config.logo_url} alt="Logo Preview" className="mt-3 h-12 object-contain" />
                        )}
                    </div>

                    {/* Site Name */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                            <Type className="w-4 h-4 text-cyan-500" /> Site Name
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">English</label>
                                <input
                                    type="text"
                                    value={config.site_name}
                                    onChange={(e) => setConfig({ ...config, site_name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Arabic</label>
                                <input
                                    type="text"
                                    value={config.site_name_ar}
                                    onChange={(e) => setConfig({ ...config, site_name_ar: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-right"
                                    dir="rtl"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                                <LinkIcon className="w-4 h-4 text-cyan-500" /> Menu Items
                            </h4>
                            <button
                                onClick={addMenuItem}
                                className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500 text-white text-sm rounded-lg hover:bg-cyan-600"
                            >
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </div>

                        <div className="space-y-2">
                            {config.menu_items.map((item, index) => (
                                <div key={item.id} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                    <div className="flex flex-col gap-0.5">
                                        <button
                                            onClick={() => moveMenuItem(item.id, 'up')}
                                            disabled={index === 0}
                                            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded disabled:opacity-30"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => moveMenuItem(item.id, 'down')}
                                            disabled={index === config.menu_items.length - 1}
                                            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded disabled:opacity-30"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateMenuItem(item.id, 'label', e.target.value)}
                                        placeholder="Label (EN)"
                                        className="flex-1 px-3 py-1.5 border rounded-lg text-sm dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                                    />
                                    <input
                                        type="text"
                                        value={item.labelAr}
                                        onChange={(e) => updateMenuItem(item.id, 'labelAr', e.target.value)}
                                        placeholder="Label (AR)"
                                        className="flex-1 px-3 py-1.5 border rounded-lg text-sm dark:bg-slate-600 dark:border-slate-500 dark:text-white text-right"
                                        dir="rtl"
                                    />
                                    <input
                                        type="text"
                                        value={item.href}
                                        onChange={(e) => updateMenuItem(item.id, 'href', e.target.value)}
                                        placeholder="URL"
                                        className="w-32 px-3 py-1.5 border rounded-lg text-sm dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                                    />
                                    <button
                                        onClick={() => deleteMenuItem(item.id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={saveConfig}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>

                        {message && (
                            <span className={`flex items-center gap-1 ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                                {message.includes('Error') ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                {message}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NavbarController;
