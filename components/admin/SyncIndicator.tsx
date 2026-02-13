
import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../src/db';
import { processSyncQueue } from '../../src/services/syncQueue';
import { syncAll } from '../../src/services/dbSync';

export const SyncIndicator = () => {
    const pendingCount = useLiveQuery(() => db.sync_queue.where('status').equals('PENDING').count());
    const failedCount = useLiveQuery(() => db.sync_queue.where('status').equals('FAILED').count());
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleStatusChange = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handleStatusChange);
        window.addEventListener('offline', handleStatusChange);
        return () => {
            window.removeEventListener('online', handleStatusChange);
            window.removeEventListener('offline', handleStatusChange);
        };
    }, []);

    if (pendingCount === 0 && failedCount === 0 && isOnline) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 text-sm flex flex-col gap-1 z-50">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            
            {pendingCount && pendingCount > 0 ? (
                <div className="text-amber-600 dark:text-amber-400">
                    Syncing {pendingCount} changes...
                </div>
            ) : null}

            {failedCount && failedCount > 0 ? (
                <div className="text-red-600 dark:text-red-400">
                    {failedCount} failed syncs. 
                    <button 
                        onClick={() => processSyncQueue()}
                        className="ml-2 underline hover:no-underline"
                    >
                        Retry
                    </button>
                </div>
            ) : null}

            <div className="pt-1 border-t border-slate-200 dark:border-slate-700 mt-1">
                <button
                    onClick={async () => {
                        try {
                            const btn = document.getElementById('resync-btn');
                            if (btn) btn.classList.add('animate-spin');
                            await syncAll();
                            alert('Sync complete!');
                        } catch (e) {
                            alert('Sync failed');
                            console.error(e);
                        } finally {
                            const btn = document.getElementById('resync-btn');
                            if (btn) btn.classList.remove('animate-spin');
                        }
                    }}
                    className="text-xs text-slate-500 hover:text-cyan-600 flex items-center gap-1 w-full justify-end"
                >
                    <svg id="resync-btn" className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Resync All
                </button>
            </div>
        </div>
    );
};
