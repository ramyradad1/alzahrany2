import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import {
    Save, Plus, Trash2, Image, Type, Link as LinkIcon,
    MessageCircle, Facebook, Twitter, Instagram, Linkedin, ChevronDown, ChevronUp,
    Loader2, Check, AlertCircle, Upload
} from 'lucide-react';

interface MenuItem {
    id: string;
    label: string;
    href: string;
    order: number;
}

interface SocialLinks {
    whatsapp?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
}

interface SiteSettings {
    id: string;
    logo_url: string;
    site_name: string;
    site_name_ar: string;
    menu_items: MenuItem[];
    social_links: SocialLinks;
}

const DEFAULT_SETTINGS: SiteSettings = {
    id: 'main',
    logo_url: '',
    site_name: 'Alzahrany Trading',
    site_name_ar: 'الزهراني للتجارة',
    menu_items: [
        { id: '1', label: 'Home', href: '/', order: 0 },
        { id: '2', label: 'Products', href: '/catalog', order: 1 },
        { id: '3', label: 'Partners', href: '/#partners', order: 2 },
        { id: '4', label: 'About', href: '/about', order: 3 },
    ],
    social_links: {
        whatsapp: '',
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
    }
};

export const AdminSettings: React.FC<{ t: any }> = ({ t }) => {
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState<'logo' | 'menu' | 'social'>('logo');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('id', 'main')
                .single();

            if (data && !error) {
                setSettings({
                    ...DEFAULT_SETTINGS,
                    ...data,
                    menu_items: data.menu_items?.length ? data.menu_items : DEFAULT_SETTINGS.menu_items,
                    social_links: data.social_links || DEFAULT_SETTINGS.social_links,
                });
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
        setLoading(false);
    };

    const saveSettings = async () => {
        setSaving(true);
        setMessage('');

        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    id: 'main',
                    logo_url: settings.logo_url,
                    site_name: settings.site_name,
                    site_name_ar: settings.site_name_ar,
                    menu_items: settings.menu_items,
                    social_links: settings.social_links,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
            setMessage('Settings saved successfully!');
        } catch (e: any) {
            setMessage('Error: ' + (e.message || 'Failed to save'));
        }
        setSaving(false);
    };

    const addMenuItem = () => {
        const newItem: MenuItem = {
            id: Date.now().toString(),
            label: 'New Link',
            href: '/',
            order: settings.menu_items.length,
        };
        setSettings({ ...settings, menu_items: [...settings.menu_items, newItem] });
    };

    const updateMenuItem = (id: string, field: keyof MenuItem, value: string) => {
        setSettings({
            ...settings,
            menu_items: settings.menu_items.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            ),
        });
    };

    const deleteMenuItem = (id: string) => {
        setSettings({
            ...settings,
            menu_items: settings.menu_items.filter(item => item.id !== id),
        });
    };

    const moveMenuItem = (id: string, direction: 'up' | 'down') => {
        const items = [...settings.menu_items];
        const index = items.findIndex(item => item.id === id);
        if (direction === 'up' && index > 0) {
            [items[index], items[index - 1]] = [items[index - 1], items[index]];
        } else if (direction === 'down' && index < items.length - 1) {
            [items[index], items[index + 1]] = [items[index + 1], items[index]];
        }
        setSettings({ ...settings, menu_items: items.map((item, i) => ({ ...item, order: i })) });
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                <span className="ml-2 text-slate-600 dark:text-slate-400">Loading settings...</span>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-slate-800">
            {/* Tab Buttons */}
            <div className="flex gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('logo')}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${activeTab === 'logo' ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                >
                    <Image size={18} /> Logo & Name
                </button>
                <button
                    onClick={() => setActiveTab('menu')}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${activeTab === 'menu' ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                >
                    <LinkIcon size={18} /> Menu Items
                </button>
                <button
                    onClick={() => setActiveTab('social')}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${activeTab === 'social' ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                >
                    <MessageCircle size={18} /> Social Links
                </button>
            </div>

            {/* Logo & Name Tab */}
            {activeTab === 'logo' && (
                <div className="space-y-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <Image className="text-cyan-500" size={20} /> Logo URL
                        </h3>
                        <input
                            type="url"
                            value={settings.logo_url || ''}
                            onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                            placeholder="https://example.com/logo.png"
                        />
                        {settings.logo_url && (
                            <img src={settings.logo_url} alt="Preview" className="mt-3 h-16 object-contain" />
                        )}
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <Type className="text-cyan-500" size={20} /> Site Name
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">English</label>
                                <input
                                    type="text"
                                    value={settings.site_name}
                                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Arabic</label>
                                <input
                                    type="text"
                                    value={settings.site_name_ar}
                                    onChange={(e) => setSettings({ ...settings, site_name_ar: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white text-right"
                                    dir="rtl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Items Tab */}
            {activeTab === 'menu' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">Navigation Links</h3>
                        <button
                            onClick={addMenuItem}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                        >
                            <Plus size={18} /> Add Link
                        </button>
                    </div>

                    {settings.menu_items.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => moveMenuItem(item.id, 'up')}
                                    disabled={index === 0}
                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30"
                                >
                                    <ChevronUp size={16} />
                                </button>
                                <button
                                    onClick={() => moveMenuItem(item.id, 'down')}
                                    disabled={index === settings.menu_items.length - 1}
                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30"
                                >
                                    <ChevronDown size={16} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={item.label}
                                onChange={(e) => updateMenuItem(item.id, 'label', e.target.value)}
                                placeholder="Label"
                                className="flex-1 px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                            />
                            <input
                                type="text"
                                value={item.href}
                                onChange={(e) => updateMenuItem(item.id, 'href', e.target.value)}
                                placeholder="URL (e.g., /about)"
                                className="flex-1 px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                            />
                            <button
                                onClick={() => deleteMenuItem(item.id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Social Links Tab */}
            {activeTab === 'social' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Social Media Links</h3>

                    {[
                        { key: 'whatsapp', label: 'WhatsApp Number', icon: MessageCircle, color: 'bg-green-500', placeholder: '966123456789' },
                        { key: 'facebook', label: 'Facebook URL', icon: Facebook, color: 'bg-blue-600', placeholder: 'https://facebook.com/yourpage' },
                        { key: 'twitter', label: 'Twitter URL', icon: Twitter, color: 'bg-sky-500', placeholder: 'https://twitter.com/yourhandle' },
                        { key: 'instagram', label: 'Instagram URL', icon: Instagram, color: 'bg-pink-500', placeholder: 'https://instagram.com/yourhandle' },
                        { key: 'linkedin', label: 'LinkedIn URL', icon: Linkedin, color: 'bg-blue-700', placeholder: 'https://linkedin.com/company/yourcompany' },
                    ].map(({ key, label, icon: Icon, color, placeholder }) => (
                        <div key={key} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                                <Icon className="text-white" size={20} />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">{label}</label>
                                <input
                                    type="text"
                                    value={(settings.social_links as any)[key] || ''}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        social_links: { ...settings.social_links, [key]: e.target.value }
                                    })}
                                    placeholder={placeholder}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex items-center gap-4">
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>

                {message && (
                    <span className={message.includes('Error') ? 'text-red-500' : 'text-green-500'}>
                        {message}
                    </span>
                )}
            </div>
        </div>
    );
};

export default AdminSettings;
