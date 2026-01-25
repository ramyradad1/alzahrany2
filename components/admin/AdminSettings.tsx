import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import {
    Save, Upload, Plus, Trash2, GripVertical, Image, Type, Link as LinkIcon,
    MessageCircle, Facebook, Twitter, Instagram, Linkedin, ChevronDown, ChevronUp,
    Loader2, Check, AlertCircle
} from 'lucide-react';

interface MenuItem {
    id: string;
    label: string;
    href: string;
    order: number;
    children?: MenuItem[];
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
        whatsapp: '966123456789',
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
    }
};

interface AdminSettingsProps {
    t: any;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ t }) => {
    console.log('[AdminSettings] Component rendering...');

    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState<string>('logo');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            console.log('[AdminSettings] Fetching settings...');
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('id', 'main')
                .single();

            console.log('[AdminSettings] Result:', { data, error });

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching settings:', error);
                setError('Failed to load settings: ' + error.message);
            }

            if (data) {
                setSettings({
                    ...DEFAULT_SETTINGS,
                    ...data,
                    menu_items: data.menu_items || DEFAULT_SETTINGS.menu_items,
                    social_links: data.social_links || DEFAULT_SETTINGS.social_links,
                });
            }
        } catch (e: any) {
            console.error('[AdminSettings] Error:', e);
            setError('Error loading settings: ' + (e.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSaved(false);

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
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e: any) {
            setError(e.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('images')
            .upload(fileName, file);

        if (error) {
            setError('Failed to upload logo');
            return;
        }

        const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);

        setSettings({ ...settings, logo_url: urlData.publicUrl });
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

    const updateSocialLink = (platform: keyof SocialLinks, value: string) => {
        setSettings({
            ...settings,
            social_links: { ...settings.social_links, [platform]: value },
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        );
    }

    const sections = [
        { id: 'logo', label: 'Logo & Name', icon: Image },
        { id: 'menu', label: 'Menu Items', icon: LinkIcon },
        { id: 'social', label: 'Social Links', icon: MessageCircle },
    ];

    return (
        <div className="p-6">
            {/* Section Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                {sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                            ${activeSection === section.id
                                ? 'bg-cyan-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }
                        `}
                    >
                        <section.icon className="w-4 h-4" />
                        {section.label}
                    </button>
                ))}
            </div>

            {/* Logo & Site Name Section */}
            {activeSection === 'logo' && (
                <div className="space-y-6">
                    {/* Logo Upload */}
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Image className="w-5 h-5 text-cyan-500" />
                            Logo
                        </h3>
                        <div className="flex items-center gap-6">
                            {settings.logo_url ? (
                                <img src={settings.logo_url} alt="Logo" className="w-20 h-20 object-contain bg-white rounded-lg border" />
                            ) : (
                                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                    <Image className="w-8 h-8 text-slate-400" />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg cursor-pointer hover:bg-cyan-600 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    Upload Logo
                                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                </label>
                                <p className="text-sm text-slate-500">PNG, JPG, SVG (max 2MB)</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Or enter URL</label>
                            <input
                                type="url"
                                value={settings.logo_url}
                                onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                                placeholder="https://example.com/logo.png"
                            />
                        </div>
                    </div>

                    {/* Site Name */}
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Type className="w-5 h-5 text-cyan-500" />
                            Site Name
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">English Name</label>
                                <input
                                    type="text"
                                    value={settings.site_name}
                                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Arabic Name</label>
                                <input
                                    type="text"
                                    value={settings.site_name_ar}
                                    onChange={(e) => setSettings({ ...settings, site_name_ar: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 text-right"
                                    dir="rtl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Items Section */}
            {activeSection === 'menu' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">Menu Items</h3>
                        <button
                            onClick={addMenuItem}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                    </div>

                    <div className="space-y-2">
                        {settings.menu_items.map((item, index) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl"
                            >
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => moveMenuItem(item.id, 'up')}
                                        disabled={index === 0}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30"
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => moveMenuItem(item.id, 'down')}
                                        disabled={index === settings.menu_items.length - 1}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex-1 grid md:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateMenuItem(item.id, 'label', e.target.value)}
                                        placeholder="Label"
                                        className="px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                                    />
                                    <input
                                        type="text"
                                        value={item.href}
                                        onChange={(e) => updateMenuItem(item.id, 'href', e.target.value)}
                                        placeholder="URL (e.g., /about)"
                                        className="px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                                    />
                                </div>
                                <button
                                    onClick={() => deleteMenuItem(item.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Social Links Section */}
            {activeSection === 'social' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Social Media Links</h3>

                    <div className="grid gap-4">
                        {/* WhatsApp */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
                                <input
                                    type="text"
                                    value={settings.social_links.whatsapp || ''}
                                    onChange={(e) => updateSocialLink('whatsapp', e.target.value)}
                                    placeholder="966123456789 (without + or spaces)"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                                />
                            </div>
                        </div>

                        {/* Facebook */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Facebook className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">Facebook URL</label>
                                <input
                                    type="url"
                                    value={settings.social_links.facebook || ''}
                                    onChange={(e) => updateSocialLink('facebook', e.target.value)}
                                    placeholder="https://facebook.com/yourpage"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                                />
                            </div>
                        </div>

                        {/* Twitter */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                            <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                                <Twitter className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">Twitter URL</label>
                                <input
                                    type="url"
                                    value={settings.social_links.twitter || ''}
                                    onChange={(e) => updateSocialLink('twitter', e.target.value)}
                                    placeholder="https://twitter.com/yourhandle"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                                />
                            </div>
                        </div>

                        {/* Instagram */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
                                <Instagram className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">Instagram URL</label>
                                <input
                                    type="url"
                                    value={settings.social_links.instagram || ''}
                                    onChange={(e) => updateSocialLink('instagram', e.target.value)}
                                    placeholder="https://instagram.com/yourhandle"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                                />
                            </div>
                        </div>

                        {/* LinkedIn */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                                <Linkedin className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                                <input
                                    type="url"
                                    value={settings.social_links.linkedin || ''}
                                    onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                                    placeholder="https://linkedin.com/company/yourcompany"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex items-center gap-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                    {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : saved ? (
                        <Check className="w-5 h-5" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
                </button>

                {error && (
                    <div className="flex items-center gap-2 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSettings;
