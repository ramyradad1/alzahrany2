import Dexie, { Table } from 'dexie';
import { Product, Partner, Category, NavbarConfig, Section } from '../types';

export interface SyncItem {
  id?: number;
  table: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  retryCount?: number;
  error?: string;
  localId?: number | string; // ID of the local optimistic record to delete after sync
}

export interface CachedImage {
  id: string; // URL
  data: Blob;
  mimeType: string;
  timestamp: number;
}

export class AppDatabase extends Dexie {
  products!: Table<Product, number>;
  partners!: Table<Partner, number>;
  categories!: Table<Category, number>;
  sync_queue!: Table<SyncItem, number>;
  images!: Table<CachedImage, string>;
  navbar_config!: Table<NavbarConfig, string>;
  sections!: Table<Section, string>;

  constructor() {
    super('AlzahranyDB');
    this.version(5).stores({
      products: '++id, category, category_id, name',
      partners: '++id, name',
      categories: '++id, name_en, name_ar, parent_id',
      sync_queue: '++id, table, action, [table+action], timestamp, status', // New table for offline sync
      images: 'id, timestamp',
      navbar_config: 'id',
      sections: 'id, order'
    });
  }
}

export const db = new AppDatabase();

export const resetDatabase = async () => {
  await db.delete();
  window.location.reload();
};
