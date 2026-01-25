import React, { useState, useRef, useEffect } from 'react';
import { Save, Upload, Loader2, AlertTriangle, LayoutTemplate } from 'lucide-react';
import { supabase } from '../../supabase';
import { Section, HeroContent, Translations } from '../../types';

interface AdminHeroProps {
    section: Section | undefined;
    onUpdate: (updatedSection: Section) => void;
    t: Translations;
}

export const AdminHero: React.FC<AdminHeroProps> = ({ section, onUpdate, t }) => {
    const [content, setContent] = useState<HeroContent>({
        title_en: '',
        title_ar: '',
        subtitle_en: '',
        subtitle_ar: '',
        button_text_en: '',
        button_text_ar: '',
        image: ''
    });

    const [loading, setLoading] = useState(false);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [fileError, setFileError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (section?.content) {
            setContent(prev => ({ ...prev, ...section.content }));
        }
    }, [section]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!section) return;

        setLoading(true);

        // 1. Prepare updated section object
        const updatedSection = {
            ...section,
            content: content
        };

        // 2. Update in Database
        const { error } = await supabase
            .from('sections')
            .update({ content: content })
            .eq('id', section.id);

        if (error) {
            console.error('Error updating hero section:', error);
            alert('Failed to update hero section');
        } else {
            // 3. Update local state via callback
            onUpdate(updatedSection);
            alert('Hero section updated successfully!');
        }

        setLoading(false);
    };

    const processFile = (file: File) => {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit for hero images
            setFileError('Image too large (>2MB). Please compress it.');
            return;
        }
        setFileError('');
        setIsProcessingImage(true);

        const reader = new FileReader();
        reader.onloadend = () => {
            setContent(prev => ({ ...prev, image: reader.result as string }));
            setIsProcessingImage(false);
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    if (!section) {
        return <div className="p-8 text-center text-slate-500">Loading section data...</div>;
    }

    return (
        <div className="animate-fade-in-up max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-8">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg text-cyan-600 dark:text-cyan-400">
                        <LayoutTemplate className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hero Section Editor</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Customize the main landing banner</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-8">

                    {/* Titles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">English Title</label>
                            <input
                                type="text"
                                value={content.title_en}
                                onChange={e => setContent({ ...content, title_en: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                                placeholder="e.g. Science Evolved"
                            />
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mt-4">English Subtitle</label>
                            <textarea
                                rows={3}
                                value={content.subtitle_en}
                                onChange={e => setContent({ ...content, subtitle_en: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
                                placeholder="e.g. Empowering scientific discovery..."
                            />
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mt-4">English Button Text</label>
                            <input
                                type="text"
                                value={content.button_text_en}
                                onChange={e => setContent({ ...content, button_text_en: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                                placeholder="e.g. Shop Now"
                            />
                        </div>

                        <div className="space-y-4" dir="rtl">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">العنوان بالعربية</label>
                            <input
                                type="text"
                                value={content.title_ar}
                                onChange={e => setContent({ ...content, title_ar: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                                placeholder="مثال: تطور العلوم"
                            />
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mt-4">الوصف بالعربية</label>
                            <textarea
                                rows={3}
                                value={content.subtitle_ar}
                                onChange={e => setContent({ ...content, subtitle_ar: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
                                placeholder="مثال: تمكين الاكتشافات العلمية..."
                            />
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mt-4">نص الزر بالعربية</label>
                            <input
                                type="text"
                                value={content.button_text_ar}
                                onChange={e => setContent({ ...content, button_text_ar: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                                placeholder="مثال: تسوق الآن"
                            />
                        </div>
                    </div>

                    {/* Background Image */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Background Image (Optional Override)</label>

                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Preview */}
                            <div className="w-full md:w-1/2 aspect-video bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center relative group">
                                {content.image ? (
                                    <>
                                        <img src={content.image} alt="Hero Background" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => setContent({ ...content, image: '' })}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700"
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <p className="text-slate-400 text-sm">No custom image set.</p>
                                        <p className="text-slate-500 text-xs mt-1">Default abstract background will be used.</p>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="w-full md:w-1/2 space-y-4">
                                <div
                                    onClick={() => !isProcessingImage && fileInputRef.current?.click()}
                                    className={`p-6 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center ${isProcessingImage ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    {isProcessingImage ? (
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-600" />
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to Upload New Image</span>
                                            <p className="text-xs text-slate-400 mt-1">Recommended size: 1920x1080 (Max 2MB)</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={handleImageUpload}
                                />
                                {fileError && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <AlertTriangle className="w-4 h-4" />
                                        {fileError}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading || isProcessingImage}
                            className="flex items-center px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />}
                            Save Changes
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
