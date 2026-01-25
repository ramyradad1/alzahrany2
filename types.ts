export interface Specification {
  label: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  price?: number;
  category: string;
  image: string;
  images?: string[];
  description: string;
  specifications: Specification[];
}

export interface Partner {
  id: number;
  name: string;
  logo: string;
}

export type ProductFormData = Omit<Product, 'id' | 'price'> & {
  price?: number | string; // Allow string for form input handling
};

export interface HeroContent {
  title_en?: string;
  title_ar?: string;
  subtitle_en?: string;
  subtitle_ar?: string;
  button_text_en?: string;
  button_text_ar?: string;
  image?: string;
}

export interface CatalogContent {
  title_en?: string;
  title_ar?: string;
  subtitle_en?: string;
  subtitle_ar?: string;
}

export interface PartnersContent {
  title_en?: string;
  title_ar?: string;
  subtitle_en?: string;
  subtitle_ar?: string;
}

export interface AboutContent {
  title_en?: string;
  title_ar?: string;
  mission_title_en?: string;
  mission_title_ar?: string;
  mission_text_en?: string;
  mission_text_ar?: string;
  quality_title_en?: string;
  quality_title_ar?: string;
  quality_text_en?: string;
  quality_text_ar?: string;
  global_title_en?: string;
  global_title_ar?: string;
  global_text_en?: string;
  global_text_ar?: string;
}

export interface CustomContent {
  title_en?: string;
  title_ar?: string;
  html?: string;
  bgColor?: string;
  bgImage?: string;
  textColor?: string;
}

export type SectionContent = HeroContent | CatalogContent | PartnersContent | AboutContent | CustomContent | any;

export interface Section {
  id: string; // 'hero' | 'catalog' | 'partners' | 'about'
  label: string;
  is_visible: boolean;
  order: number;
  content?: SectionContent;
}



export type Language = 'en' | 'ar';

export interface Translations {
  // Navigation
  navHome: string;
  navProducts: string;
  navAbout: string;
  navPartners: string;

  // Tooltips
  tooltipHome: string;
  tooltipSearch: string;
  tooltipAdmin: string;
  tooltipLang: string;
  tooltipTheme: string;
  tooltipMenu: string;
  tooltipCall: string;
  tooltipEmail: string;
  tooltipLocation: string;
  tooltipWhatsApp: string;

  // Stats
  statProducts: string;
  statCountries: string;
  statSupport: string;
  statIso: string;

  // Existing keys
  home: string;
  catalog: string;
  admin: string;
  search: string;
  heroTitle: string;
  heroSubtitle: string;
  heroButton: string;
  viewSpecs: string;
  categories: string;
  allCategories: string;
  quickView: string;
  inquire: string;
  readMore: string;
  readLess: string;
  techSpecs: string;
  warranty: string;
  certified: string;
  shipping: string;
  inquireWhatsApp: string;
  adminLogin: string;
  restricted: string;
  accessCode: string;
  authenticate: string;
  portfolio: string;
  logout: string;
  addItem: string;
  editItem: string;
  noProducts: string;
  viewAll: string;
  support: string;
  contactUs: string;
  item: string;
  category: string;
  price: string;
  actions: string;
  save: string;
  cancel: string;
  name: string;
  description: string;
  productImage: string;
  uploadFile: string;
  clickToChange: string;
  addSpecRow: string;
  label: string;
  value: string;

  // Partner Management
  partners: string;
  managePartners: string;
  addPartner: string;
  deletePartner: string;
  partnerName: string;
  partnerLogo: string;
  noPartners: string;
  trustedPartners: string;

  // Footer
  footerAbout: string;
  footerLinks: string;
  footerContact: string;
  footerNewsletter: string;
  newsletterDesc: string;
  subscribe: string;
  emailPlaceholder: string;
  privacyPolicy: string;
  termsOfService: string;
  rightsReserved: string;

  // About Section
  aboutTitle: string;
  aboutMission: string;
  aboutMissionText: string;
  aboutQuality: string;
  aboutQualityText: string;
  aboutGlobal: string;
  aboutGlobalText: string;

  // History Timeline
  aboutHistory: string;
  history2010: string;
  history2010Desc: string;
  history2015: string;
  history2015Desc: string;
  history2020: string;
  history2020Desc: string;
  history2024: string;
  history2024Desc: string;

  // Contact Form
  contactName: string;
  contactEmail: string;
  contactSubject: string;
  contactMessage: string;
  sendMessage: string;
  messageSent: string;

  // Storage
  storageErrorMsg: string;
  loadingError: string;
}
