import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const DEFAULT_SECTIONS = [
  {
    id: 'hero',
    label: 'Hero Section',
    is_visible: true,
    order: 0,
    content: {
      title_en: 'Welcome to Alzahrany',
      title_ar: 'مرحباً بكم في الزهراني',
      subtitle_en: 'Leading provider of Lab & Medical Equipment',
      subtitle_ar: 'الشركة الرائدة في مجال المعدات المعملية والطبية',
      button_text_en: 'View Catalog',
      button_text_ar: 'تصفح الكتالوج'
    }
  },
  {
    id: 'catalog',
    label: 'Product Catalog',
    is_visible: true,
    order: 20,
    content: {
      title_en: 'Our Products',
      title_ar: 'منتجاتنا',
      subtitle_en: 'Browse our extensive collection',
      subtitle_ar: 'تصفح مجموعتنا الواسعة',
      selectedCategory: 'All'
    }
  },
  {
    id: 'business-divisions',
    label: 'Business Divisions',
    is_visible: true,
    order: 10, 
    // Let's check original order: Hero=0, Catalog=1, Partners=2, About=3.
    // User probably wants it after Hero. let's put it at 0.5 to be safe, or I can renumber.
    // Floating point order is fine for float sorting.
    content: {
      title_en: 'Business Divisions',
      title_ar: 'قطاعات الأعمال'
    }
  },
  {
    id: 'partners',
    label: 'Our Partners',
    is_visible: true,
    order: 30,
    content: {
      title_en: 'Trusted Partners',
      title_ar: 'شركاؤنا',
      subtitle_en: 'We work with the best',
      subtitle_ar: 'نحن نعمل مع الأفضل'
    }
  },
  {
    id: 'about',
    label: 'About Us',
    is_visible: true,
    order: 40,
    content: {
        title_en: 'About Us',
        title_ar: 'من نحن',
        mission_title_en: 'Our Mission',
        mission_title_ar: 'مهمتنا',
        mission_text_en: 'To provide high quality equipment...',
        mission_text_ar: 'توفير معدات عالية الجودة...',
        quality_title_en: 'Quality Assurance',
        quality_title_ar: 'ضمان الجودة',
        quality_text_en: 'We ensure the best quality...',
        quality_text_ar: 'نحن نضمن أفضل جودة...',
        global_title_en: 'Global Reach',
        global_title_ar: 'الوصول العالمي',
        global_text_en: 'Serving clients worldwide...',
        global_text_ar: 'خدمة العملاء في جميع أنحاء العالم...'
    }
  },
  {
    id: 'contact_form',
    label: 'Contact Form',
    is_visible: true,
    order: 50,
    content: {
      html: '<div class="text-center"><h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2><p class="text-gray-600 dark:text-gray-300">Get in touch with us related to potential business cases.</p></div>'
    }
  },

];

async function seedSections() {
  console.log('🌱 Seeding Sections...');

  for (const section of DEFAULT_SECTIONS) {
    const { error } = await supabase
      .from('sections')
      .upsert(section, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Error seeding section ${section.id}:`, error.message);
    } else {
      console.log(`✅ Seeded section: ${section.id}`);
    }
  }

  console.log('✨ Section seeding complete!');
}

seedSections().catch(console.error);
