import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { NavbarConfig, MenuItem } from '../types';

export const CategoryMigration = () => {
    const [status, setStatus] = useState('Initializing...');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    useEffect(() => {
        const migrate = async () => {
            setStatus('Fetching config...');
            addLog('Connecting to Supabase...');
            const { data, error } = await supabase.from('navbar_config').select('*').eq('id', 'main').single();

            if (error || !data) {
                setStatus('Error fetching config');
                addLog('Error: ' + error?.message);
                return;
            }

            const config = data as NavbarConfig;
            let items = config.menu_items || [];
            addLog(`Loaded ${items.length} menu items.`);

            // Target items
            // Arabic translations:
            // Titration: المعايرة
            // Refractometers: أجهزة قياس الانكسار
            // Thermometers: مقاييس الحرارة
            // Spectrophotometers: مقاييس الطيف الضوئي
            // pH Meters & Multimeters: مقاييس الأس الهيدروجيني والمتعددة
            // Microscopes: المجاهر
            // Hygrometers: مقاييس الرطوبة
            // Melting Point Apparatus: أجهزة نقطة الانصهار
            // Colorimeters: مقاييس الألوان
            // Data Loggers: مسجلات البيانات
            // Conductivity: الموصلية
            // Balances: الموازين

            const newSubItems = [
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

            const childrenToAdd: MenuItem[] = newSubItems.map((item, idx) => ({
                id: 'mig_' + Date.now() + '_' + idx,
                label: item.label,
                labelAr: item.labelAr,
                href: '/catalog?category=' + encodeURIComponent(item.label),
                order: idx,
                children: []
            }));

            // Find 'Instruments' or fallback
            // Try explicit 'Instruments' first
            let targetIndex = items.findIndex(i => i.label.toLowerCase() === 'instruments');

            // If not found, look for 'Products' and check if we should add it there or create new
            // The user request said "Inside Instruments".
            // If Instruments doesn't exist, we'll create it.

            if (targetIndex !== -1) {
                addLog(`Found existing "Instruments" category at index ${targetIndex}.`);
                const target = items[targetIndex];
                const existingChildren = target.children || [];

                // Add only if not exists
                const finalChildren = [...existingChildren];
                let addedCount = 0;

                childrenToAdd.forEach(newChild => {
                    if (!finalChildren.some(ex => ex.label === newChild.label)) {
                        finalChildren.push(newChild);
                        addedCount++;
                    }
                });

                if (addedCount === 0) {
                    addLog('All items already exist in Instruments.');
                } else {
                    addLog(`Adding ${addedCount} new items to Instruments.`);
                    items[targetIndex] = { ...target, children: finalChildren };
                }
            } else {
                // Check if we should add to Products or create new?
                // Given the request "Inside Instruments", and typical lab sites, Instruments IS the Products or a main category.
                // I will create a new Top Level category "Instruments" if "Products" exists to avoid messing up "Products" if it's distinct.
                // However, often Products == Instruments. 
                // Let's create "Instruments" as a top level item to be safe and precise.

                addLog('Instruments category not found. Creating new top-level category.');
                items.push({
                    id: 'new_instruments_' + Date.now(),
                    label: 'Instruments',
                    labelAr: 'الأدوات',
                    href: '/catalog?category=Instruments',
                    order: items.length,
                    children: childrenToAdd
                });
            }

            // Save
            addLog('Saving to Supabase...');
            const { error: saveError } = await supabase
                .from('navbar_config')
                .update({ menu_items: items })
                .eq('id', 'main');

            if (saveError) {
                setStatus('Error saving');
                addLog('Error: ' + saveError.message);
            } else {
                setStatus('Migration Complete');
                addLog('Successfully updated navbar config!');
            }
        };

        migrate();
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: 99999,
            background: 'white',
            color: 'black',
            padding: 20,
            border: '2px solid blue',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            maxWidth: 400
        }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: 10 }}>Database Migration Status</h3>
            <div style={{ fontWeight: 'bold', color: status.includes('Error') ? 'red' : 'green', marginBottom: 10 }}>
                {status}
            </div>
            <div style={{ fontSize: 12, maxHeight: 200, overflowY: 'auto', background: '#eee', padding: 5 }}>
                {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
            {status === 'Migration Complete' && (
                <div style={{ marginTop: 10, fontSize: 11, color: '#555' }}>
                    You can now check the Navbar. This component will be removed shortly.
                </div>
            )}
        </div>
    );
};
