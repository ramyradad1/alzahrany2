import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { NavbarConfig, MenuItem } from '../types';

export const MigrationDashboard = () => {
    const [status, setStatus] = useState('Ready');
    const [logs, setLogs] = useState<string[]>([]);
    const [isMigrating, setIsMigrating] = useState(false);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const runMigration = async () => {
        setIsMigrating(true);
        setLogs([]);
        setStatus('Migrating...');
        addLog('Starting Manual Migration...');

        try {
            // 1. Fetch current config
            addLog('Fetching current navbar config...');
            const { data, error } = await supabase.from('navbar_config').select('*').eq('id', 'main').single();
            if (error || !data) throw new Error('Fetch failed: ' + error?.message);

            const config = data as NavbarConfig;
            let items = config.menu_items || [];
            addLog(`Loaded ${items.length} menu items.`);

            // 2. Remove ANY existing "Instruments" or "الأدوات" category
            const initialCount = items.length;
            items = items.filter(i =>
                i.label.toLowerCase() !== 'instruments' &&
                i.labelAr !== 'الأدوات'
            );

            if (items.length < initialCount) {
                addLog(`Removed ${initialCount - items.length} existing 'Instruments' categories.`);
            } else {
                addLog('No existing "Instruments" category found. Creating fresh.');
            }

            // 3. Define New Data
            const subcategories = [
                { label: 'Titration', labelAr: 'المعايرة' },
                { label: 'Refractometers', labelAr: 'أجهزة قياس الانكسار' },
                { label: 'Thermometers', labelAr: 'مقاييس الحرارة' },
                { label: 'Spectrophotometers', labelAr: 'مقاييس الطيف الضوئي' },
                { label: 'pH Meters & Multimeters', labelAr: 'مقاييس الأس الهيدروجيني والمتعددة' },
                { label: 'Microscopes', labelAr: 'المجاهر' },
                { label: 'Hygrometers', labelAr: 'مقاييس الرطوبة' },
                { label: 'Melting Point Apparatus', labelAr: 'أجهزة نقطة الانصهار' },
                { label: 'Colorimeters', labelAr: 'مقاييس الألوان' },
                { label: 'Data Loggers', labelAr: 'مسجلات البيانات' },
                { label: 'Conductivity', labelAr: 'الموصلية' },
                { label: 'Balances', labelAr: 'الموازين' }
            ];

            const newChildren: MenuItem[] = subcategories.map((sub, idx) => ({
                id: `inst_sub_${Date.now()}_${idx}`,
                label: sub.label,
                labelAr: sub.labelAr,
                href: `/catalog?category=${encodeURIComponent(sub.label)}`,
                order: idx,
                children: []
            }));

            const newCategory: MenuItem = {
                id: `instruments_${Date.now()}`,
                label: 'Instruments',
                labelAr: 'الأدوات',
                href: '#', // Category parent usually doesn't navigate itself if it has children, or goes to full list
                order: 99, // Put at end, can be reordered in admin
                children: newChildren
            };

            items.push(newCategory);
            addLog('Added new "Instruments" category with 12 subcategories.');

            // 4. Save to Supabase
            addLog('Saving to database...');
            const { error: saveError } = await supabase
                .from('navbar_config')
                .update({ menu_items: items })
                .eq('id', 'main');

            if (saveError) throw new Error('Save failed: ' + saveError.message);

            // 5. Clear Cache
            localStorage.removeItem('cached_navbar');
            addLog('Cleared local cache.');

            setStatus('SUCCESS');
            addLog('Migration Completed Successfully!');
            addLog('Please reload the page to see changes.');

        } catch (err: any) {
            console.error(err);
            setStatus('ERROR');
            addLog('FAILED: ' + err.message);
        } finally {
            setIsMigrating(false);
        }
    };

    if (status === 'SUCCESS') {
        return (
            <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl max-w-md w-full text-center space-y-4 shadow-2xl border-2 border-green-500">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-3xl">✅</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Migration Successful!</h2>
                    <p className="text-slate-600 dark:text-slate-300">
                        The Instruments category has been updated.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all"
                    >
                        Reload Page Now
                    </button>
                    <div className="text-xs text-left bg-slate-100 dark:bg-slate-900 p-2 rounded h-32 overflow-auto font-mono">
                        {logs.map((L, i) => <div key={i}>{L}</div>)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-xl border border-slate-200 dark:border-slate-700 w-80 overflow-hidden">
                <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                    <h3 className="font-bold">Migration Dashboard</h3>
                    <span {...{ className: `px-2 py-0.5 text-xs rounded-full ${status === 'Error' ? 'bg-red-500' : isMigrating ? 'bg-blue-500' : 'bg-slate-700'}` }}>
                        {status}
                    </span>
                </div>

                <div className="p-4 space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Click below to force-update the "Instruments" category.
                    </p>

                    <button
                        onClick={runMigration}
                        disabled={isMigrating}
                        className={`w-full py-2 rounded-lg font-bold text-white transition-all ${isMigrating
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/20'
                            }`}
                    >
                        {isMigrating ? 'Processing...' : 'START MIGRATION'}
                    </button>

                    {logs.length > 0 && (
                        <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded text-xs font-mono h-32 overflow-y-auto border border-slate-200 dark:border-slate-700">
                            {logs.map((log, i) => (
                                <div key={i} className="mb-1 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800/50 pb-1 last:border-0">
                                    {log}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
