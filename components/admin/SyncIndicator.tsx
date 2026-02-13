
import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../src/db';
import { processSyncQueue } from '../../src/services/syncQueue';

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
        </div>
    );
};
