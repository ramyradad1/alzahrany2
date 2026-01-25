import React from 'react';
import { Section, Translations } from '../../types';
import { AdminHero } from './AdminHero';
import { Save, Loader2 } from 'lucide-react';
import { supabase } from '../../supabase';

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
            return <div className="p-4 text-center text-slate-500">No editor available for this section.</div>;
    }
};
