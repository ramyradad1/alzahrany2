
import { useRealtimeSync } from './useRealtimeSync';
import { useBackgroundSync } from './useBackgroundSync';

export const useSync = () => {
  useRealtimeSync();
  useBackgroundSync();
};
