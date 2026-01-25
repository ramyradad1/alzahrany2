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
    const [bgPosition, setBgPosition] = useState(section.content?.bgPosition || 'center');
    const [bgSize, setBgSize] = useState(section.content?.bgSize || 'cover');
    const [bgOpacity, setBgOpacity] = useState(section.content?.bgOpacity ?? 1);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Update local state when section changes
    useEffect(() => {
        setHtml(section.content?.html || '');
        setBgColor(section.content?.bgColor || '#ffffff');
        setTextColor(section.content?.textColor || '#000000');
        setBgImage(section.content?.bgImage || '');
        setBgPosition(section.content?.bgPosition || 'center');
        setBgSize(section.content?.bgSize || 'cover');
        setBgOpacity(section.content?.bgOpacity ?? 1);
    }, [section.id, section.content]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${section.id}_${Date.now()}.${fileExt}`;
            const filePath = `section-images/${fileName}`;

            // Simulate progress (Supabase doesn't provide upload progress)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 100);

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('section-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            clearInterval(progressInterval);

            if (error) {
                console.error('Upload error:', error);
                if (error.message.includes('bucket') || error.message.includes('not found')) {
                    alert('خطأ: الـ bucket "section-images" غير موجود.\nاذهب لـ Supabase Dashboard > Storage وأنشئ bucket اسمه "section-images"');
                } else {
                    alert('Failed to upload image: ' + error.message);
                }
                return;
            }

            setUploadProgress(100);

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('section-images')
                .getPublicUrl(fileName);

            setBgImage(publicUrl);

            // Auto-save after upload
            setTimeout(() => setUploadProgress(0), 1000);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading image');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setBgImage('');
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const newContent = {
                ...section.content,
                html,
                bgColor,
                textColor,
                bgImage,
                bgPosition,
                bgSize,
                bgOpacity
            };

            const { error } = await supabase
                .from('sections')
                .update({ content: newContent })
                .eq('id', section.id);

            if (error) throw error;
            onUpdate({ ...section, content: newContent });
            alert('Section updated successfully!');
        } catch (error) {
            console.error('Error updating section:', error);
            alert('Failed to update section.');
        } finally {
            setSaving(false);
        }
    };

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

                {/* Image Upload Section */}
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Background Image
                    </label>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${uploading ? 'bg-slate-300 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700 text-white'}`}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    className="hidden"
                                />
                                {uploading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )}
                                <span className="text-sm">{uploading ? 'Uploading...' : 'Upload Image'}</span>
                            </label>
                            {bgImage && (
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                    title="Remove Image"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Progress Bar */}
                        {uploadProgress > 0 && (
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-cyan-500 h-full transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        )}

                        {/* Image Preview */}
                        {bgImage && (
                            <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
                                <img
                                    src={bgImage}
                                    alt="Background preview"
                                    className="w-full h-24 object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                                    {bgImage.split('/').pop()}
                                </div>
                            </div>
                        )}

                        {/* Or enter URL manually */}
                        <input
                            type="text"
                            value={bgImage}
                            onChange={(e) => setBgImage(e.target.value)}
                            className="w-full px-3 py-2 text-xs border rounded-md border-slate-200 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500"
                            placeholder="Or paste image URL..."
                        />
                    </div>
                </div>
            </div>

            {/* Image Settings - Only show when image is set */}
            {bgImage && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="col-span-full text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Image Settings</h4>

                    {/* Position */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Position</label>
                        <select
                            value={bgPosition}
                            onChange={(e) => setBgPosition(e.target.value)}
                            className="w-full px-3 py-2 text-sm border rounded-md border-slate-200 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="center">Center</option>
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                            <option value="top left">Top Left</option>
                            <option value="top right">Top Right</option>
                            <option value="bottom left">Bottom Left</option>
                            <option value="bottom right">Bottom Right</option>
                        </select>
                    </div>

                    {/* Size */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Size</label>
                        <select
                            value={bgSize}
                            onChange={(e) => setBgSize(e.target.value)}
                            className="w-full px-3 py-2 text-sm border rounded-md border-slate-200 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="cover">Cover (Fill)</option>
                            <option value="contain">Contain (Fit)</option>
                            <option value="auto">Original Size</option>
                            <option value="100% 100%">Stretch</option>
                            <option value="50%">50%</option>
                            <option value="75%">75%</option>
                            <option value="150%">150%</option>
                        </select>
                    </div>

                    {/* Opacity */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Opacity: {Math.round(bgOpacity * 100)}%
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={bgOpacity}
                                onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </div>
                    </div>
                </div>
            )}

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
