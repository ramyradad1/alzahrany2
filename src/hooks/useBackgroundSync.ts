
import { useEffect } from 'react';
import { processSyncQueue } from '../services/syncQueue';

export const useBackgroundSync = () => {
  useEffect(() => {
    // Attempt to sync on mount if online
    if (navigator.onLine) {
        processSyncQueue();
    }

    const handleOnline = () => {
      console.log('Network status: Online. Processing sync queue...');
      processSyncQueue();
    };

    const handleOffline = () => {
        console.log('Network status: Offline.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
};
