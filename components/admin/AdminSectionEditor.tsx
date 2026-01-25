import React, { useState, useEffect } from 'react';
import { Section, Translations } from '../../types';
import { AdminHero } from './AdminHero';
import { Save, Loader2 } from 'lucide-react';
import { supabase } from '../../supabase';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

interface AdminSectionEditorProps {
    section: Section;
    onUpdate: (section: Section) => void;
    t: Translations;
}

// Generic Simple Text Editor (for Catalog & Partners)
const SimpleTextEditor: React.FC<{ section: Section, onUpdate: (s: Section) => void }> = ({ section, onUpdate }) => {
    const [content, setContent] = React.useState<any>(section.content || {});
    const [loading, setLoading] = React.useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const updated = { ...section, content };

        const { error } = await supabase
            .from('sections')
            .update({ content })
            .eq('id', section.id);

        if (error) {
            alert('Failed to update section');
        } else {
            onUpdate(updated);
            alert('Section updated!');
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">English Title</label>
                    <input
                        type="text"
                        value={content.title_en || ''}
                        onChange={e => setContent({ ...content, title_en: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">English Subtitle</label>
                    <textarea
                        rows={3}
                        value={content.subtitle_en || ''}
                        onChange={e => setContent({ ...content, subtitle_en: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
                    />
                </div>
                <div className="space-y-4" dir="rtl">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">العنوان بالعربية</label>
                    <input
                        type="text"
                        value={content.title_ar || ''}
                        onChange={e => setContent({ ...content, title_ar: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">الوصف بالعربية</label>
                    <textarea
                        rows={3}
                        value={content.subtitle_ar || ''}
                        onChange={e => setContent({ ...content, subtitle_ar: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
                    />
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />}
                    Save
                </button>
            </div>
        </form>
    );
};

// Complex Editor for About Section
const AboutEditor: React.FC<{ section: Section, onUpdate: (s: Section) => void }> = ({ section, onUpdate }) => {
    const [content, setContent] = React.useState<any>(section.content || {});
    const [loading, setLoading] = React.useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const updated = { ...section, content };

        const { error } = await supabase
            .from('sections')
            .update({ content })
            .eq('id', section.id);

        if (error) {
            alert('Failed to update section');
        } else {
            onUpdate(updated);
            alert('About section updated!');
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Title */}
                <div className="col-span-full border-b border-slate-200 dark:border-slate-700 pb-4">
                    <h4 className="font-bold mb-4 text-cyan-600">Main Section Title</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase font-bold text-slate-500 mb-1">English</label>
                            <input type="text" value={content.title_en || ''} onChange={e => setContent({ ...content, title_en: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                        </div>
                        <div dir="rtl">
                            <label className="block text-xs uppercase font-bold text-slate-500 mb-1">العربية</label>
                            <input type="text" value={content.title_ar || ''} onChange={e => setContent({ ...content, title_ar: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                        </div>
                    </div>
                </div>

                {/* Mission */}
                <div className="col-span-full border-b border-slate-200 dark:border-slate-700 pb-4">
                    <h4 className="font-bold mb-4 text-cyan-600">Mission Block</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <input placeholder="Title (EN)" type="text" value={content.mission_title_en || ''} onChange={e => setContent({ ...content, mission_title_en: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                            <textarea placeholder="Text (EN)" rows={3} value={content.mission_text_en || ''} onChange={e => setContent({ ...content, mission_text_en: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                        </div>
                        <div className="space-y-2" dir="rtl">
                            <input placeholder="العنوان (AR)" type="text" value={content.mission_title_ar || ''} onChange={e => setContent({ ...content, mission_title_ar: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                            <textarea placeholder="النص (AR)" rows={3} value={content.mission_text_ar || ''} onChange={e => setContent({ ...content, mission_text_ar: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                        </div>
                    </div>
                </div>

                {/* Quality */}
                <div className="col-span-full border-b border-slate-200 dark:border-slate-700 pb-4">
                    <h4 className="font-bold mb-4 text-cyan-600">Quality Block</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <input placeholder="Title (EN)" type="text" value={content.quality_title_en || ''} onChange={e => setContent({ ...content, quality_title_en: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                            <textarea placeholder="Text (EN)" rows={3} value={content.quality_text_en || ''} onChange={e => setContent({ ...content, quality_text_en: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                        </div>
                        <div className="space-y-2" dir="rtl">
                            <input placeholder="العنوان (AR)" type="text" value={content.quality_title_ar || ''} onChange={e => setContent({ ...content, quality_title_ar: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                            <textarea placeholder="النص (AR)" rows={3} value={content.quality_text_ar || ''} onChange={e => setContent({ ...content, quality_text_ar: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                        </div>
                    </div>
                </div>

                {/* Global */}
                <div className="col-span-full pb-4">
                    <h4 className="font-bold mb-4 text-cyan-600">Global Reach Block</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <input placeholder="Title (EN)" type="text" value={content.global_title_en || ''} onChange={e => setContent({ ...content, global_title_en: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                            <textarea placeholder="Text (EN)" rows={3} value={content.global_text_en || ''} onChange={e => setContent({ ...content, global_text_en: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                        </div>
                        <div className="space-y-2" dir="rtl">
                            <input placeholder="العنوان (AR)" type="text" value={content.global_title_ar || ''} onChange={e => setContent({ ...content, global_title_ar: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                            <textarea placeholder="النص (AR)" rows={3} value={content.global_text_ar || ''} onChange={e => setContent({ ...content, global_text_ar: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                        </div>
                    </div>
                </div>

            </div>
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />}
                    Save
                </button>
            </div>
        </form>
    );
};

// Ensure CustomSectionEditor is defined before AdminSectionEditor

const CustomSectionEditor: React.FC<{ section: Section, onUpdate: (s: Section) => void }> = ({ section, onUpdate }) => {
    const [html, setHtml] = useState(section.content?.html || '');
    const [bgColor, setBgColor] = useState(section.content?.bgColor || '#ffffff');
    const [textColor, setTextColor] = useState(section.content?.textColor || '#000000');
    const [bgImage, setBgImage] = useState(section.content?.bgImage || '');
    const [saving, setSaving] = useState(false);

    // Update local state when section changes
    useEffect(() => {
        setHtml(section.content?.html || '');
        setBgColor(section.content?.bgColor || '#ffffff');
        setTextColor(section.content?.textColor || '#000000');
        setBgImage(section.content?.bgImage || '');
    }, [section.id, section.content]); // added section.content dependency just in case

    const handleSave = async () => {
        setSaving(true);
        try {
            const newContent = {
                ...section.content,
                html,
                bgColor,
                textColor,
                bgImage
            };

            const { error } = await supabase
                .from('sections')
                .update({ content: newContent })
                .eq('id', section.id);

            if (error) throw error;
            onUpdate();
            alert('Section updated successfully!');
        } catch (error) {
            console.error('Error updating section:', error);
            alert('Failed to update section.');
        } finally {
            setSaving(false);
        }
    };

    /*
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'video'],
            ['clean'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }]
        ],
    };
    */

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Background Color</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="h-10 w-20 rounded cursor-pointer border border-slate-200"
                        />
                        <span className="text-xs text-slate-500 font-mono">{bgColor}</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Text Color</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="h-10 w-20 rounded cursor-pointer border border-slate-200"
                        />
                        <span className="text-xs text-slate-500 font-mono">{textColor}</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Background Image URL</label>
                    <input
                        type="text"
                        value={bgImage}
                        onChange={(e) => setBgImage(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md border-slate-200 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content (HTML Supported)</label>
                <div className="bg-white text-slate-900 rounded-lg overflow-hidden border border-slate-200">
                    <textarea
                        value={html}
                        onChange={(e) => setHtml(e.target.value)}
                        className="w-full p-4 h-64 focus:outline-none"
                        placeholder="Enter HTML content here (or plain text)..."
                    />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    Note: Rich Text Editor is temporarily disabled due to missing "react-quill" package. You can write raw HTML here.
                </p>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Content
                </button>
            </div>
        </div>
    );
};

export const AdminSectionEditor: React.FC<AdminSectionEditorProps> = ({ section, onUpdate, t }) => {
    switch (section.id) {
        case 'hero':
            return <AdminHero section={section} onUpdate={onUpdate} t={t} />;
        case 'catalog':
        case 'partners':
            return <SimpleTextEditor section={section} onUpdate={onUpdate} />;
        case 'about':
            return <AboutEditor section={section} onUpdate={onUpdate} />;
        default:
            return <CustomSectionEditor section={section} onUpdate={onUpdate} />;
    }
};
