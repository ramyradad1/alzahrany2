
import { useEffect } from 'react';
import { setupRealtimeSubscriptions } from '../services/realtime';

export const useRealtimeSync = () => {
  useEffect(() => {
    const unsubscribe = setupRealtimeSubscriptions();
    return () => {
      unsubscribe();
    };
  }, []);
};
