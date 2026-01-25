import React, { useState, useRef } from 'react';
import { Users, Upload, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { Partner, Translations } from '../../types';

interface AdminPartnersProps {
    partners: Partner[];
    onAddPartner: (name: string, logo: string) => void;
    onDeletePartner: (id: number) => void;
    t: Translations;
}

export const AdminPartners: React.FC<AdminPartnersProps> = ({ partners, onAddPartner, onDeletePartner, t }) => {
    const [newPartnerName, setNewPartnerName] = useState('');
    const [newPartnerLogo, setNewPartnerLogo] = useState('');
    const [isProcessingPartnerLogo, setIsProcessingPartnerLogo] = useState(false);
    const [fileError, setFileError] = useState('');

    const partnerLogoRef = useRef<HTMLInputElement>(null);

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

    const handlePartnerLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file, (result) => {
                setNewPartnerLogo(result);
            }, setIsProcessingPartnerLogo);
        }
    };

    const handlePartnerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPartnerName && newPartnerLogo) {
            onAddPartner(newPartnerName, newPartnerLogo);
            setNewPartnerName('');
            setNewPartnerLogo('');
        }
    };

    return (
        <div className="animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* Add New Partner Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 h-fit">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-3">
                        {t.addPartner}
                    </h3>
                    <form onSubmit={handlePartnerSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.partnerName}</label>
                            <input
                                required
                                type="text"
                                value={newPartnerName}
                                onChange={(e) => setNewPartnerName(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.partnerLogo}</label>
                            <div
                                onClick={() => !isProcessingPartnerLogo && partnerLogoRef.current?.click()}
                                className={`flex items-center justify-center border-2 border-dashed rounded-lg p-4 transition-all cursor-pointer ${newPartnerLogo ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {isProcessingPartnerLogo ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                                ) : newPartnerLogo ? (
                                    <img src={newPartnerLogo} alt="Logo Preview" className="h-12 object-contain" />
                                ) : (
                                    <div className="text-center">
                                        <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                                        <span className="text-xs text-slate-500">{t.uploadFile}</span>
                                    </div>
                                )}
                                <input
                                    ref={partnerLogoRef}
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={handlePartnerLogoUpload}
                                />
                            </div>
                        </div>

                        {fileError && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                {fileError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!newPartnerName || !newPartnerLogo || isProcessingPartnerLogo}
                            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {t.addPartner}
                        </button>
                    </form>
                </div>

                {/* Partners List */}
                <div className="md:col-span-1 lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        Existing Partners <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{partners.length}</span>
                    </h3>

                    {partners.length === 0 ? (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 text-center text-slate-500 border border-slate-200 dark:border-slate-700 border-dashed">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>{t.noPartners}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {partners.map(partner => (
                                <div key={partner.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-lg flex items-center justify-center p-2 border border-slate-100 dark:border-slate-600">
                                            <img src={partner.logo} alt={partner.name} className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-white">{partner.name}</span>
                                    </div>
                                    <button
                                        onClick={() => onDeletePartner(partner.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title={t.deletePartner}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
