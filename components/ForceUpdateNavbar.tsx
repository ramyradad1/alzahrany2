import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { NavbarConfig, MenuItem } from '../types';

export const ForceUpdateNavbar = () => {
    const [status, setStatus] = useState('Initializing Force Update...');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    useEffect(() => {
        const forceUpdate = async () => {
            try {
                addLog('Starting Force Update Sequence...');

                // 1. Clear Local Storage
                localStorage.removeItem('cached_navbar');
                addLog('Cleared cached_navbar from localStorage.');

                // 2. Fetch current config
                const { data, error } = await supabase.from('navbar_config').select('*').eq('id', 'main').single();
                if (error || !data) {
                    throw new Error('Could not fetch config: ' + error?.message);
                }

                const config = data as NavbarConfig;
                let items = config.menu_items || [];
                addLog(`Loaded ${items.length} existing menu items.`);

                // 3. Define the Subcategories
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
                    id: 'inst_' + Date.now() + '_' + idx,
                    label: item.label,
                    labelAr: item.labelAr,
                    href: '/catalog?category=' + encodeURIComponent(item.label),
                    order: idx,
                    children: []
                }));

                // 4. Find or Create "Instruments"
                const instrumentsIndex = items.findIndex(i => i.label.toLowerCase() === 'instruments');

                if (instrumentsIndex !== -1) {
                    addLog('Found "Instruments" category. Overwriting children...');
                    items[instrumentsIndex] = {
                        ...items[instrumentsIndex],
                        children: childrenToAdd
                    };
                } else {
                    addLog('"Instruments" category not found. Creating new one...');
                    items.push({
                        id: 'instruments_' + Date.now(),
                        label: 'Instruments',
                        labelAr: 'الأدوات',
                        href: '/catalog?category=Instruments',
                        order: items.length, // Put it at the end
                        children: childrenToAdd
                    });
                }

                // 5. Save to Supabase
                addLog('Saving updated config to Supabase...');
                const { error: saveError } = await supabase
                    .from('navbar_config')
                    .update({ menu_items: items })
                    .eq('id', 'main');

                if (saveError) {
                    throw new Error('Save failed: ' + saveError.message);
                }

                setStatus('SUCCESS: Navbar Updated!');
                addLog('-----------------------------------');
                addLog('PLEASE RELOAD THE PAGE IF CHANGES DO NOT APPEAR IMMEDIATELY.');
            } catch (err: any) {
                setStatus('FAILED: ' + err.message);
                addLog('Error details: ' + JSON.stringify(err));
            }
        };

        forceUpdate();
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 999999,
            background: 'white',
            color: 'black',
            padding: '2rem',
            border: '4px solid #000',
            borderRadius: '1rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            maxWidth: '90vw',
            width: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
        }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>
                System Update
            </h2>
            <div style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: status.includes('SUCCESS') ? 'green' : (status.includes('FAILED') ? 'red' : 'blue'),
                marginBottom: '1rem'
            }}>
                {status}
            </div>
            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {logs.map((log, i) => <div key={i} style={{ marginBottom: '0.5rem' }}>{log}</div>)}
            </div>
            {status.includes('SUCCESS') && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <p>You can verify the Navbar now.</p>
                </div>
            )}
        </div>
    );
};
