import { supabase } from '../../utils/supabase';
import { db } from '../db';
import { Product, Partner, Category, NavbarConfig, Section } from '../../types';
import { syncImages } from './imageCache';

export const syncProducts = async () => {
  try {
    console.log('Syncing products...');
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) throw error;

    if (data) {
      // 1. Get local pending changes
      const pendingCreates = await db.sync_queue.where({ table: 'products', action: 'CREATE' }).toArray();
      const pendingUpdates = await db.sync_queue.where({ table: 'products', action: 'UPDATE' }).toArray();
      
      const pendingCreateIds = new Set(pendingCreates.map(i => i.data.id));
      const pendingUpdateIds = new Set(pendingUpdates.map(i => i.data.id));

      // 2. Identify stale local data (Deleted on server)
      const serverIds = new Set(data.map(d => d.id));
      const localIds = await db.products.toCollection().primaryKeys();
      
      const idsToDelete = localIds.filter(id => !serverIds.has(id) && !pendingCreateIds.has(id));

      if (idsToDelete.length > 0) {
        console.log(`Removing ${idsToDelete.length} stale products from local DB`);
        await db.products.bulkDelete(idsToDelete);
      }

      // 3. Apply server updates (Skip if we have a pending local update)
      const validServerData = data.filter(d => !pendingUpdateIds.has(d.id));
      
      if (validServerData.length > 0) {
        // Clear local cache to prevent duplicates if IDs mismatch or if clean slate is needed
        // But we MUST preserve pending creations that are only local!
        
        // Strategy: 
        // 1. Get all pending creations from buffer
        // 2. Clear table
        // 3. Put server data
        // 4. Put pending creations back
        
        // Actually, simpler: 
        // Just delete everything that IS NOT in pendingCreates?
        // No, `pendingCreates` are in `sync_queue`. The local `products` table copy of them is just an optimistic UI copy.
        // So we can clear `products` table entirely, then re-add server data + optimistic local creations.
        
        await db.products.clear();
        await db.products.bulkPut(validServerData as Product[]);
        
        // Re-apply optimistic updates from queue if they were cleared?
        // IF we cleared the table, we lost the optimistic 'Create' records.
        // We need to re-insert them.
        if (pendingCreates.length > 0) {
            const optimisticProducts = pendingCreates.map(p => ({ ...p.data, id: p.localId }));
            await db.products.bulkPut(optimisticProducts);
        }

        console.log(`Synced ${validServerData.length} products to local DB`);
        
        // Sync Images
        const imageUrls = validServerData.flatMap(p => [p.image, ...(p.images || [])]);
        syncImages(imageUrls);
      }
    }
  } catch (error) {
    console.error('Error syncing products:', error);
  }
};

export const syncPartners = async () => {
  try {
    console.log('Syncing partners...');
    const { data, error } = await supabase
      .from('partners')
      .select('*');

    if (error) throw error;

    if (data) {
      const pendingCreates = await db.sync_queue.where({ table: 'partners', action: 'CREATE' }).toArray();
      const pendingUpdates = await db.sync_queue.where({ table: 'partners', action: 'UPDATE' }).toArray();
      
      const pendingCreateIds = new Set(pendingCreates.map(i => i.data.id));
      const pendingUpdateIds = new Set(pendingUpdates.map(i => i.data.id));

      const serverIds = new Set(data.map(d => d.id));
      const localIds = await db.partners.toCollection().primaryKeys();
      
      const idsToDelete = localIds.filter(id => !serverIds.has(id) && !pendingCreateIds.has(id));

      if (idsToDelete.length > 0) {
        console.log(`Removing ${idsToDelete.length} stale partners`);
        await db.partners.bulkDelete(idsToDelete);
      }

      const validServerData = data.filter(d => !pendingUpdateIds.has(d.id));
      
      if (validServerData.length > 0) {
          await db.partners.clear();
          await db.partners.bulkPut(validServerData as Partner[]);

          // Re-apply optimistic creations
          if (pendingCreates.length > 0) {
            const optimisticPartners = pendingCreates.map(p => ({ ...p.data, id: p.localId }));
            await db.partners.bulkPut(optimisticPartners);
        }

          console.log(`Synced ${validServerData.length} partners to local DB`);
          
          // Sync Images
          const imageUrls = validServerData.map(p => p.logo);
          syncImages(imageUrls);
      }
    }
  } catch (error) {
    console.error('Error syncing partners:', error);
  }
};

export const syncCategories = async () => {
  try {
    console.log('Syncing categories...');
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error) throw error;

    if (data) {
      // 1. Get local pending changes
      const pendingCreates = await db.sync_queue.where({ table: 'categories', action: 'CREATE' }).toArray();
      const pendingUpdates = await db.sync_queue.where({ table: 'categories', action: 'UPDATE' }).toArray();

      const pendingCreateIds = new Set(pendingCreates.map(i => i.data.id));
      const pendingUpdateIds = new Set(pendingUpdates.map(i => i.data.id));

      // 2. Identify stale local data (Deleted on server)
      const serverIds = new Set(data.map(d => d.id));
      const localIds = await db.categories.toCollection().primaryKeys();

      const idsToDelete = localIds.filter(id => !serverIds.has(id) && !pendingCreateIds.has(id));

      if (idsToDelete.length > 0) {
        console.log(`Removing ${idsToDelete.length} stale categories from local DB`);
        await db.categories.bulkDelete(idsToDelete);
      }

      // 3. Apply server updates (Skip if we have a pending local update)
      const validServerData = data.filter(d => !pendingUpdateIds.has(d.id));

      if (validServerData.length > 0) {
      // Clear local cache to prevent duplicates if IDs mismatch or if clean slate is needed
      // But we MUST preserve pending creations that are only local!

        await db.categories.clear();
        await db.categories.bulkPut(validServerData as Category[]);

        // Re-apply optimistic updates from queue
        if (pendingCreates.length > 0) {
          const optimisticCategories = pendingCreates.map(p => ({ ...p.data, id: p.localId }));
          await db.categories.bulkPut(optimisticCategories);
        }

        console.log(`Synced ${validServerData.length} categories to local DB`);
      }
    }
  } catch (error) {
    console.error('Error syncing categories:', error);
  }
};

export const syncNavbarConfig = async () => {
  try {
    console.log('Syncing navbar_config...');
    const { data, error } = await supabase
      .from('navbar_config')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is acceptable (no rows)

    if (data) {
        await db.navbar_config.put(data as NavbarConfig);
        console.log('Synced navbar_config to local DB');
        
        // Sync Images
        const imageUrls = [data.logo_url, data.favicon_url];
        syncImages(imageUrls);
    }
  } catch (error) {
    console.error('Error syncing navbar_config:', error);
  }
};

export const syncSections = async () => {
  try {
    console.log('Syncing sections...');
    const { data, error } = await supabase
      .from('sections')
      .select('*');

    if (error) throw error;

    if (data) {
      const serverIds = new Set(data.map(d => d.id));
      const localIds = await db.sections.toCollection().primaryKeys();
        
      const idsToDelete = localIds.filter(id => !serverIds.has(id));

      if (idsToDelete.length > 0) {
         await db.sections.bulkDelete(idsToDelete);
      }

      await db.sections.bulkPut(data as Section[]);
      console.log(`Synced ${data.length} sections to local DB`);
      
      // Sync Images from section content
      // Note: This iterates through all sections and tries to find 'image' or 'bgImage' fields in content.
      // It's a best-effort approach based on types.ts definitions.
      const imageUrls: string[] = [];
      data.forEach(section => {
          if (section.content) {
              if (section.content.image) imageUrls.push(section.content.image);
              if (section.content.bgImage) imageUrls.push(section.content.bgImage);
          }
      });
      syncImages(imageUrls);
    }
  } catch (error) {
    console.error('Error syncing sections:', error);
  }
};

export const syncAll = async () => {
  console.log('Starting sync...');
  await Promise.all([
    syncProducts(), 
    syncPartners(), 
    syncCategories(),
    syncNavbarConfig(),
    syncSections()
  ]);
  console.log('Sync complete');
};
