
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

import { uploadImageToSupabase } from '../utils/storage';

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

      // Clone data to avoid mutating original queue item in memory before update
      let payload = JSON.parse(JSON.stringify(item.data));

      // --- HANDLE IMAGE UPLOADS ---
      if (item.table === 'products' && (item.action === 'CREATE' || item.action === 'UPDATE')) {
        if (payload.image && payload.image.startsWith('data:image')) {
          const url = await uploadImageToSupabase(payload.image, 'products', 'uploads/products');
          if (url) payload.image = url;
        }
        if (payload.images && Array.isArray(payload.images)) {
          const uploadPromises = payload.images.map(async (img: string) => {
            if (img.startsWith('data:image')) {
              return await uploadImageToSupabase(img, 'products', 'uploads/products/gallery') || img;
            }
            return img;
          });
          payload.images = await Promise.all(uploadPromises);
        }
      }

      if (item.table === 'partners' && (item.action === 'CREATE' || item.action === 'UPDATE')) {
        if (payload.logo && payload.logo.startsWith('data:image')) {
          const url = await uploadImageToSupabase(payload.logo, 'products', 'uploads/partners');
          if (url) payload.logo = url;
        }
      }
      // -----------------------------

      if (item.action === 'CREATE') {
         // Remove temp ID if present, let Supabase gen ID
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...cleanPayload } = payload;
        response = await supabase.from(item.table).insert([cleanPayload]).select().single();
         if (response.data) newId = response.data.id;
      } else if (item.action === 'UPDATE') {
        response = await supabase.from(item.table).update(payload).eq('id', payload.id).select();
      } else if (item.action === 'DELETE') {
        response = await supabase.from(item.table).delete().eq('id', payload.id).select();
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
                   // Find pending items that need to be updated
                   const pendingItems = await db.sync_queue
                        .where('status').equals('PENDING')
                     .toArray(); // We have to scan because we can't index JSON fields easily in Dexie without custom indices

                   const itemsToUpdate = pendingItems.filter(i => {
                     // 1. Update same item mutations (e.g. invalidating previous updates to the temp ID)
                     if (i.table === item.table && i.data.id === item.localId) return true;

                     // 2. Update Foreign Keys
                     // If we just created a Category (item.table === 'categories'), look for things referencing it
                     if (item.table === 'categories') {
                       // Products referencing this category
                       if (i.table === 'products' && i.data.category_id === item.localId) return true;
                       // Subcategories referencing this category
                       if (i.table === 'categories' && i.data.parent_id === item.localId) return true;
                     }
                     return false;
                   });

                   if (itemsToUpdate.length > 0) {
                     console.log(`[Sync] Updating ${itemsToUpdate.length} pending items with new ID ${newId}`);
                     await Promise.all(itemsToUpdate.map(mutation => {
                       const updatedData = { ...mutation.data };

                       // Update Primary Key match
                       if (mutation.data.id === item.localId) {
                         updatedData.id = newId;
                       }

                       // Update Foreign Key matches
                       if (item.table === 'categories') {
                         if (mutation.table === 'products' && mutation.data.category_id === item.localId) {
                           updatedData.category_id = newId;
                         }
                         if (mutation.table === 'categories' && mutation.data.parent_id === item.localId) {
                           updatedData.parent_id = newId;
                         }
                       }

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
