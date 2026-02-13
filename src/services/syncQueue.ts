
import { db, SyncItem } from '../db';
import { supabase } from '../../utils/supabase';

const MAX_RETRIES = 3;

export const addToSyncQueue = async (
  table: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  data: any,
  localId?: number | string
) => {
  const syncItem: SyncItem = {
    table,
    action,
    data,
    timestamp: Date.now(),
    status: 'PENDING',
    retryCount: 0,
    localId
  };
  await db.sync_queue.add(syncItem);
  console.log('Added to sync queue:', syncItem);
  
  if (navigator.onLine) {
    processSyncQueue();
  }
};

export const processSyncQueue = async () => {
  if (!navigator.onLine) return;

  const pendingItems = await db.sync_queue
    .where('status')
    .equals('PENDING')
    .toArray();

  if (pendingItems.length === 0) return;

  console.log(`Processing ${pendingItems.length} items from sync queue...`);

  for (const item of pendingItems) {
    try {
      let newId: number | string | null = null;
      let response = null;

      if (item.action === 'CREATE') {
         // Remove temp ID if present, let Supabase gen ID
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         const { id, ...payload } = item.data; 
         response = await supabase.from(item.table).insert([payload]).select().single();
         if (response.data) newId = response.data.id;
      } else if (item.action === 'UPDATE') {
         response = await supabase.from(item.table).update(item.data).eq('id', item.data.id).select();
      } else if (item.action === 'DELETE') {
         response = await supabase.from(item.table).delete().eq('id', item.data.id).select();
      }

      if (response && response.error) {
        throw new Error(response.error.message);
      }

      // Cleanup local optimistic record if it exists (for CREATE actions)
      if (item.action === 'CREATE' && item.localId) {
          try {
             // Atomic Swap: Delete temp ID and Insert real ID (if not already present via Realtime)
             await db.transaction('rw', [db.table(item.table), db.sync_queue], async () => {
                 const table = db.table(item.table);
                 
                 // 1. Delete the temporary local record
                 await table.delete(item.localId!);
                 console.log(`[Sync] Removed local temporary record ${item.localId} from ${item.table}`);

                 // 2. Insert the server record (if we have it from response)
                 // This covers the gap before Realtime arrives. 
                 // If Realtime arrives later, it will just overwrite this, which is fine.
                 if (newId && response?.data) {
                     await table.put(response.data);
                     console.log(`[Sync] Inserted server record ${newId} into ${item.table}`);
                 }

                 // 3. Update any pending chained mutations
                 if (newId) {
                     const pendingMutations = await db.sync_queue
                        .where('status').equals('PENDING')
                        .filter(i => i.table === item.table && i.data.id === item.localId)
                        .toArray();
                     
                     if (pendingMutations.length > 0) {
                         console.log(`[Sync] Updating ${pendingMutations.length} pending items with new ID ${newId}`);
                         await Promise.all(pendingMutations.map(mutation => {
                             const updatedData = { ...mutation.data, id: newId };
                             return db.sync_queue.update(mutation.id!, { data: updatedData });
                         }));
                     }
                 }
             });

          } catch (cleanupError) {
              console.warn(`Failed to cleanup logic for ${item.localId}:`, cleanupError);
          }
      }

      await db.sync_queue.update(item.id!, { status: 'SYNCED' });
      await db.sync_queue.delete(item.id!);
      console.log(`Synced item ${item.id} (${item.action} ${item.table})`);

    } catch (err: any) {
      console.error(`Failed to sync item ${item.id}:`, err);
      
      const newRetryCount = (item.retryCount || 0) + 1;
      const updates: Partial<SyncItem> = {
          retryCount: newRetryCount,
          error: err.message || JSON.stringify(err)
      };

      if (newRetryCount >= MAX_RETRIES) {
          updates.status = 'FAILED';
      }

      await db.sync_queue.update(item.id!, updates);
    }
  }
};

export const getSyncStatus = async () => {
    const start = await db.sync_queue.where('status').equals('PENDING').count();
    const failed = await db.sync_queue.where('status').equals('FAILED').count();
    return { pending: start, failed };
};
