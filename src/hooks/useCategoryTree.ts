import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Category, MenuItem } from '../../types';

export const useCategoryTree = () => {
  const categories = useLiveQuery(() => db.categories.toArray());

  const categoryTree = useLiveQuery(async () => {
    const allCategories = await db.categories.toArray();
    
    // Map to MenuItem format
    const categoryMap = new Map<number, MenuItem>();
    
    // 1. Create MenuItem for each category
    allCategories.forEach(cat => {
      categoryMap.set(cat.id, {
        id: `cat-${cat.id}`,
        label: cat.name_en,
        labelAr: cat.name_ar,
        href: `/catalog?category=${encodeURIComponent(cat.name_en)}`, // Pass ID if possible, but name is used currently
        order: 0, 
        children: []
      } as MenuItem);
    });

    const rootItems: MenuItem[] = [];

    // 2. Build Tree
    allCategories.forEach(cat => {
      const item = categoryMap.get(cat.id)!;
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          // Parent might be missing children array if initialized strictly from type? 
          // But we initialized it with children: [] above.
          if (!parent.children) parent.children = [];
          parent.children.push(item);
        } else {
            // Parent not found (maybe filtered out or error), treat as root
            rootItems.push(item);
        }
      } else {
        rootItems.push(item);
      }
    });

    // 3. Sort by name
    const sortItems = (items: MenuItem[]) => {
        items.sort((a, b) => a.label.localeCompare(b.label));
        items.forEach(i => {
            if (i.children && i.children.length > 0) {
                sortItems(i.children);
            }
        });
    };
    sortItems(rootItems);

    return rootItems;

  }, [categories]); // Re-run when categories change

  return categoryTree || [];
};
