import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { NavbarConfig, MenuItem } from '../types';

export const EquipmentsMigration = () => {
    const [status, setStatus] = useState('Ready');
    const [logs, setLogs] = useState<string[]>([]);
    const [isMigrating, setIsMigrating] = useState(false);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const runMigration = async () => {
        setIsMigrating(true);
        setLogs([]);
        setStatus('Migrating...');
        addLog('Starting Equipments Migration...');

        try {
            // 1. Fetch current config
            addLog('Fetching current navbar config...');
            const { data, error } = await supabase.from('navbar_config').select('*').eq('id', 'main').single();
            if (error || !data) throw new Error('Fetch failed: ' + error?.message);

            const config = data as NavbarConfig;
            let items = config.menu_items || [];
            addLog(`Loaded ${items.length} menu items.`);

            // 2. Remove ANY existing "Equipments" or "المعدات" category
            const initialCount = items.length;
            items = items.filter(i =>
                i.label.toLowerCase() !== 'equipments' &&
                i.labelAr !== 'المعدات'
            );

            if (items.length < initialCount) {
                addLog(`Removed ${initialCount - items.length} existing 'Equipments' categories.`);
            } else {
                addLog('No existing "Equipments" category found. Creating fresh.');
            }

            // 3. Define New Data
            const subcategories = [
                { label: 'Autoclaves', labelAr: 'الأوتوكلاف (أجهزة التعقيم)' },
                { label: 'Baths', labelAr: 'الحمامات المائية' },
                { label: 'Burners', labelAr: 'الشعلات' },
                { label: 'Carts', labelAr: 'العربات' },
                { label: 'Centrifuges', labelAr: 'أجهزة الطرد المركزي' },
                { label: 'Desiccators & Hoods', labelAr: 'المجففات والشفاطات' },
                { label: 'Electrophoresis', labelAr: 'الرحلان الكهربائي' },
                { label: 'Freezes & Refrigerators', labelAr: 'المجمدات والثلاجات' },
                { label: 'GC Instruments, Parts and Supplies', labelAr: 'أجهزة GC وقطع الغيار' },
                { label: 'General Chromatography', labelAr: 'الكروماتوغرافيا العامة' },
                { label: 'Grinders', labelAr: 'المطاحن' },
                { label: 'Heaters & cooling Blocks', labelAr: 'السخانات وقوالب التبريد' },
                { label: 'Homogenizers', labelAr: 'المجانسات' },
                { label: 'Hot Plates & sitrers & Vortexers', labelAr: 'السخانات والمقلبات' },
                { label: 'HPLC & spare parts', labelAr: 'HPLC وقطع الغيار' },
                { label: 'Incubators & Ovens', labelAr: 'الحضانات والأفران' },
                { label: 'Oil Equipments', labelAr: 'معدات الزيوت' },
                { label: 'Pumps', labelAr: 'المضخات' },
                { label: 'Shakers', labelAr: 'الهزازات' },
                { label: 'Transilluminators', labelAr: 'أجهزة الإضاءة' },
                { label: 'Viscometers', labelAr: 'مقاييس اللزوجة' },
                { label: 'Water Purification', labelAr: 'تنقية المياه' }
            ];

            const newChildren: MenuItem[] = subcategories.map((sub, idx) => ({
                id: `eq_sub_${Date.now()}_${idx}`,
                label: sub.label,
                labelAr: sub.labelAr,
                href: `/catalog?category=${encodeURIComponent(sub.label)}`,
                order: idx,
                children: []
            }));

            const newCategory: MenuItem = {
                id: `equipments_${Date.now()}`,
                label: 'Equipments',
                labelAr: 'المعدات',
                href: '#',
                order: 3, // Position it appropriately (e.g., after Products, before Instruments)
                children: newChildren
            };

            // Insert into items array - try to keep a logical order if possible, or just append
            // Let's append for safety, user can reorder in Admin
            items.push(newCategory);
            addLog('Added new "Equipments" category with 22 subcategories.');

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
                        The Equipments category has been updated.
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
                    <h3 className="font-bold">Equipments Tools</h3>
                    <span {...{ className: `px-2 py-0.5 text-xs rounded-full ${status === 'Error' ? 'bg-red-500' : isMigrating ? 'bg-blue-500' : 'bg-slate-700'}` }}>
                        {status}
                    </span>
                </div>

                <div className="p-4 space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Click below to force-update the "Equipments" category.
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
