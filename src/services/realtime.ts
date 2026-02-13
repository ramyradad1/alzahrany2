
import { supabase } from '../../utils/supabase';
import { db } from '../db';
import { Product, Partner, Category } from '../../types';
import { cacheImage } from './imageCache';

export const setupRealtimeSubscriptions = () => {
    console.log('Setting up Supabase realtime subscriptions...');

    const channel = supabase.channel('db-sync-channel')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'products' },
            async (payload) => {
                console.log('Realtime Change received for products:', payload);
                const { eventType, new: newRecord, old: oldRecord } = payload;

                if (eventType === 'INSERT' || eventType === 'UPDATE') {
                    if (newRecord) {
                        await db.products.put(newRecord as Product);
                        // Cache image
                        const product = newRecord as Product;
                        if (product.image) cacheImage(product.image);
                        if (product.images && product.images.length > 0) {
                            product.images.forEach(img => cacheImage(img));
                        }
                    }
                } else if (eventType === 'DELETE') {
                    if (oldRecord && oldRecord.id) {
                        await db.products.delete(oldRecord.id);
                    }
                }
            }
        )
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'partners' },
            async (payload) => {
                console.log('Realtime Change received for partners:', payload);
                const { eventType, new: newRecord, old: oldRecord } = payload;

                if (eventType === 'INSERT' || eventType === 'UPDATE') {
                    if (newRecord) {
                        await db.partners.put(newRecord as Partner);
                        // Cache logo
                        const partner = newRecord as Partner;
                        if (partner.logo) cacheImage(partner.logo);
                    }
                } else if (eventType === 'DELETE') {
                    if (oldRecord && oldRecord.id) {
                        await db.partners.delete(oldRecord.id);
                    }
                }
            }
        )
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'categories' },
            async (payload) => {
                console.log('Realtime Change received for categories:', payload);
                const { eventType, new: newRecord, old: oldRecord } = payload;

                if (eventType === 'INSERT' || eventType === 'UPDATE') {
                    if (newRecord) {
                        await db.categories.put(newRecord as Category);
                    }
                } else if (eventType === 'DELETE') {
                    if (oldRecord && oldRecord.id) {
                        await db.categories.delete(oldRecord.id);
                    }
                }
            }
        )
         .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'navbar_config' },
            async (payload) => {
                 console.log('Realtime Change received for navbar_config:', payload);
                 const { eventType, new: newRecord } = payload;
                 if (eventType === 'INSERT' || eventType === 'UPDATE') {
                     if (newRecord) {
                         await db.navbar_config.put(newRecord as any);
                         if (newRecord.logo_url) cacheImage(newRecord.logo_url);
                         if (newRecord.favicon_url) cacheImage(newRecord.favicon_url);
                     }
                 }
            }
         )
         .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'sections' },
             async (payload) => {
                 console.log('Realtime Change received for sections:', payload);
                 const { eventType, new: newRecord, old: oldRecord } = payload;
                 if (eventType === 'INSERT' || eventType === 'UPDATE') {
                     if (newRecord) {
                         await db.sections.put(newRecord as any);
                         // Try to cache images if present in content
                         const section = newRecord as any;
                         if (section.content?.image) cacheImage(section.content.image);
                         if (section.content?.bgImage) cacheImage(section.content.bgImage);
                     }
                 } else if (eventType === 'DELETE') {
                     if (oldRecord && oldRecord.id) {
                         await db.sections.delete(oldRecord.id);
                     }
                 }
            }
         )
        .subscribe((status) => {
             console.log('Supabase realtime subscription status:', status);
        });

    return () => {
        console.log('Cleaning up Supabase realtime subscriptions...');
        supabase.removeChannel(channel);
    };
};
