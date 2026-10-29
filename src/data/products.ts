export interface ProductVariantGroup {
  name: string;
  options: {
    label: string;
    price: number;
    originalPrice?: number;
  }[];
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  bengaliSub?: string;
  slug: string;
  artKey: string;
  imageUrl?: string;
  galleryUrls?: string[];
  category: string;
  categoryLabel: string;
  categoriesList: string;
  sku: string;
  priceDisplay: string;
  oldPriceDisplay?: string;
  basePrice: number;
  originalPrice?: number;
  discountPercent?: number;
  isBestSelling?: boolean;
  isOrganicCertified?: boolean;
  inStock: boolean;
  shortBullets: string[];
  variantGroups: ProductVariantGroup[];
  specifications: ProductSpec[];
  description: string;
  warrantyInfo: string;
  rating: number;
  reviewsCount: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  bengaliName: string;
  imageUrl?: string;
  artKey?: string;
  sortOrder?: number;
  itemCount: number;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  ctaText: string;
  imageUrl?: string;
  slideIndex: number;
  bgGradient: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CouponItem {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  isActive: boolean;
}

export interface StoreSettings {
  storeNameBn: string;
  storeNameSubBn: string;
  storeNameEn: string;
  logoUrl: string;
  announcementText: string;
  hotline: string;
  whatsapp: string;
  email: string;
  address: string;
  insideDhakaShipping: number;
  outsideDhakaShipping: number;
  freeShippingThreshold: number;
  featuredCategoriesTitle: string;
  topSellingTitle: string;
  organicCertifiedTitle: string;
  winterSpecialTitle: string;
  winterSpecialSubtitle: string;
  footerAbout: string;
  fbPixelId?: string;
  tiktokPixelId?: string;
  gtmId?: string;
  enablePixelEvents?: boolean;
  trackPageView?: boolean;
  trackViewContent?: boolean;
  trackAddToCart?: boolean;
  trackInitiateCheckout?: boolean;
  trackPurchase?: boolean;
}

export interface OrderActivity {
  id: string;
  orderId: string;
  statusTitle: string;
  note: string;
  actor: string;
  createdAt: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeNameBn: 'শিতের',
  storeNameSubBn: 'বাজার',
  storeNameEn: 'Shiter Bazar Organic',
  logoUrl: '',
  announcementText:
    '🌿 ১০০% খাঁটি ও ল্যাব টেস্টেড অর্গানিক ফুড • ১,৫০০৳+ অর্ডারে সারাদেশে ফ্রি ডেলিভারি!',
  hotline: '+880 9613-800800',
  whatsapp: '+880 1700-000000',
  email: 'support@shiterbazar.com',
  address: 'Banani, Dhaka-1213, Bangladesh',
  insideDhakaShipping: 60,
  outsideDhakaShipping: 120,
  freeShippingThreshold: 1500,
  featuredCategoriesTitle: 'Featured Categories',
  topSellingTitle: 'Top Selling Products',
  organicCertifiedTitle: 'Organic Certified',
  winterSpecialTitle: 'Winter Specials & Superfoods',
  winterSpecialSubtitle:
    'শীতের বিশেষ মধু, পাবনার গাওয়া ঘি, মদিনার আজওয়া খেজুর এবং কম্বো অফার',
  footerAbout:
    'শুদ্ধতার সাথে স্বাস্থ্যের মেলবন্ধন — আমরা সরাসরি কৃষক, মৌয়াল ও খামারিদের কাছ থেকে ১০০% খাঁটি ও অর্গানিক খাদ্যপণ্য আপনার ঘরে পৌঁছে দিচ্ছি।',
  fbPixelId: '',
  tiktokPixelId: '',
  gtmId: '',
  enablePixelEvents: true,
  trackPageView: true,
  trackViewContent: true,
  trackAddToCart: true,
  trackInitiateCheckout: true,
  trackPurchase: true,
};


export const CATEGORIES: CategoryItem[] = [
  { id: 'combos', name: 'Combos', bengaliName: 'কম্বো প্যাক', itemCount: 8 },
  { id: 'dates', name: 'Dates', bengaliName: 'প্রিমিয়াম খেজুর', itemCount: 12 },
  { id: 'flours-lentils', name: 'Flours & Lentils', bengaliName: 'আটা ও ডাল', itemCount: 15 },
  { id: 'functional-food', name: 'Functional Food', bengaliName: 'সুপারফুড ও মরিঙ্গা', itemCount: 10 },
  { id: 'honey-ghee', name: 'Honey & Ghee', bengaliName: 'খাঁটি মধু ও ঘি', itemCount: 14 },
  { id: 'oils-spices', name: 'Oils & Spices', bengaliName: 'সরিষার তেল ও মশলা', itemCount: 9 },
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod-mashkalai-dal',
    name: 'Organic Red Mashkalai Dal 1 Kg',
    bengaliSub: 'চাঁপাইনবাবগঞ্জের ঐতিহ্যবাহী খোসা ছাড়ানো মাসকলাই ডাল',
    slug: 'organic-red-mashkalai-dal-1-kg',
    artKey: 'mashkalai-dal',
    category: 'flours-lentils',
    categoryLabel: 'Flours & Lentils',
    categoriesList: 'Flours & Lentils, Organic Certified, Traditional Dal',
    sku: 'SBO-DAL-001',
    priceDisplay: '250৳',
    oldPriceDisplay: '299৳',
    basePrice: 250,
    originalPrice: 299,
    discountPercent: 16,
    isBestSelling: true,
    isOrganicCertified: true,
    inStock: true,
    shortBullets: [
      'Directly sourced from traditional farmers in Chapainawabganj',
      'Stone-ground & naturally sun-dried without artificial polishing',
      'Rich in dietary fiber, plant protein, iron, and essential minerals',
      'Useful for authentic winter recipe dishes, dal, and healthy meals',
    ],
    variantGroups: [
      {
        name: 'Pack Weight',
        options: [
          { label: '1 Kg', price: 250, originalPrice: 299 },
          { label: '2 Kg', price: 480, originalPrice: 598 },
          { label: '5 Kg Family Pack', price: 1150, originalPrice: 1495 },
        ],
      },
      {
        name: 'Processing Type',
        options: [
          { label: 'Whole Split (আস্ত ভাঙ্গা)', price: 250 },
          { label: 'Stone Ground Powder (গুঁড়া)', price: 270 },
        ],
      },
    ],
    specifications: [
      { label: 'Brand', value: 'Shiter Bazar Organic' },
      { label: 'Model / Variety', value: 'Chapainawabganj Red Mashkalai Dal' },
      { label: 'Product Type', value: 'Unpolished Organic Lentils (ডাল)' },
      { label: 'Net Weight', value: '1 Kg / 2 Kg / 5 Kg' },
      { label: 'Origin', value: 'Chapainawabganj, Rajshahi, Bangladesh' },
      { label: 'Preservatives', value: '100% Chemical & Polish Free' },
      { label: 'Shelf Life', value: '12 Months (Keep in dry container)' },
    ],
    description:
      'Our Organic Red Mashkalai Dal is sourced directly from the fertile lands of Chapainawabganj. Unlike commercial machine-polished lentils, this dal is sun-dried and processed using traditional methods to retain its natural aroma, creamy texture, and rich nutritional profile.',
    warrantyInfo:
      '7-Day Easy Replacement Guarantee: If you find any packaging damage, moisture issue, or quality discrepancy upon delivery, we provide a 100% free replacement or full refund.',
    rating: 4.9,
    reviewsCount: 142,
  },
  {
    id: 'prod-mustard-oil',
    name: 'Pure Cold Pressed Mustard Oil',
    bengaliSub: 'কাঠের ঘানিতে ভাঙানো ১০০% খাঁটি দেশি সরিষার তেল',
    slug: 'pure-cold-pressed-mustard-oil',
    artKey: 'mustard-oil',
    category: 'oils-spices',
    categoryLabel: 'Oils & Spices',
    categoriesList: 'Oils & Spices, Cold Pressed Oils, Kitchen Essentials',
    sku: 'SBO-OIL-002',
    priceDisplay: '230৳ – 1,480৳',
    basePrice: 230,
    originalPrice: 260,
    discountPercent: 12,
    isBestSelling: true,
    isOrganicCertified: true,
    inStock: true,
    shortBullets: [
      'First-press cold extracted in traditional wooden ghani (তেঁতুল কাঠের ঘানি)',
      'Made from 100% local Deshi Maghi mustard seeds',
      'Zero artificial pungency enhancers, chemicals, or argemone oil',
      'Useful for traditional cooking, bhorta, pickles, and winter skin care',
    ],
    variantGroups: [
      {
        name: 'Bottle Volume',
        options: [
          { label: '1 Liter', price: 310, originalPrice: 350 },
          { label: '2 Liter', price: 600, originalPrice: 680 },
          { label: '5 Liter', price: 1480, originalPrice: 1650 },
          { label: '500 ml', price: 230, originalPrice: 260 },
        ],
      },
    ],
    specifications: [
      { label: 'Brand', value: 'Shiter Bazar Organic' },
      { label: 'Model', value: 'Wooden Ghani Cold Pressed Mustard Oil' },
      { label: 'Product Type', value: '100% Virgin Cold-Pressed Edible Oil' },
      { label: 'Seed Variety', value: 'Deshi Red & Brown Mustard Seeds' },
      { label: 'Extraction Temp', value: 'Below 40°C (Cold Pressed)' },
      { label: 'Certification', value: 'BSTI Certified & Lab Tested' },
    ],
    description:
      'Extracted slowly in traditional tamarind-wood cold presses (কাঠের ঘানি), our Pure Mustard Oil preserves natural Omega-3 fatty acids, Vitamin E, and authentic natural aroma without harsh heat refining.',
    warrantyInfo:
      '100% Purity Guarantee: Lab-tested free from palm oil or synthetic essence. Money-back guarantee if purity test fails.',
    rating: 4.9,
    reviewsCount: 289,
  },
  {
    id: 'prod-moringa-powder',
    name: 'Pure Moringa Leaf Powder',
    bengaliSub: 'পুষ্টিগুণে ভরপুর ১০০% অর্গানিক সজনে পাতার গুঁড়া (সুপারফুড)',
    slug: 'pure-moringa-leaf-powder',
    artKey: 'moringa-powder',
    category: 'functional-food',
    categoryLabel: 'Functional Food',
    categoriesList: 'Functional Food, Organic Superfoods, Herbal Powders',
    sku: 'SBO-MOR-003',
    priceDisplay: '600৳ – 3,500৳',
    basePrice: 600,
    originalPrice: 625,
    discountPercent: 4,
    isBestSelling: true,
    isOrganicCertified: true,
    inStock: true,
    shortBullets: [
      'Shade-dried young Moringa Oleifera leaves to lock in chlorophyll & vitamins',
      'Contains 7x more Vitamin C than oranges and 15x more potassium than bananas',
      'Supports daily immunity, blood sugar balance, joint health, and energy',
      'Useful for smoothies, lukewarm water, tea, and daily nutrition',
    ],
    variantGroups: [
      {
        name: 'Weight',
        options: [
          { label: '250g Pouch', price: 600, originalPrice: 625 },
          { label: '500g Pouch', price: 1100, originalPrice: 1200 },
          { label: '1 Kg Value Pack', price: 2050, originalPrice: 2300 },
          { label: '2 Kg Family Combo', price: 3500, originalPrice: 4000 },
        ],
      },
      {
        name: 'Grade',
        options: [
          { label: 'Export Quality Ultra-Fine', price: 600 },
          { label: 'Standard Organic Leaf', price: 550 },
        ],
      },
    ],
    specifications: [
      { label: 'Brand', value: 'Shiter Bazar (আমার বাজার)' },
      { label: 'Model', value: 'Pure Moringa Oleifera Leaf Powder' },
      { label: 'Product Type', value: 'Functional Superfood Supplement' },
      { label: 'Processing', value: 'Low-Temperature Shade Dried & Micronized' },
      { label: 'Additives', value: 'Zero Sugar, Zero Stem Powder, 100% Pure Leaf' },
      { label: 'Shelf Life', value: '12 Months in Resealable Zip Pouch' },
    ],
    description:
      'Pure Moringa Leaf Powder is nature’s multivitamin powerhouse. Harvested from organic orchards, only tender green leaves are washed with purified water, shade-dried to preserve vibrant green nutrients, and finely milled into a smooth, easy-to-mix superfood powder.',
    warrantyInfo:
      '100% Pure Leaf Guarantee: Free from stem fillers, artificial green dye, or preservatives. Eligible for 7-day return if seal is intact or quality is unsatisfactory.',
    rating: 5.0,
    reviewsCount: 318,
  },
  {
    id: 'prod-mustard-honey',
    name: 'Pure Mustard Flower Honey',
    bengaliSub: 'সরিষা ফুলের প্রাকৃতিক খাঁটি মধু ও সুন্দরবনের মধু',
    slug: 'pure-mustard-flower-honey',
    artKey: 'mustard-honey',
    category: 'honey-ghee',
    categoryLabel: 'Honey & Ghee',
    categoriesList: 'Honey & Ghee, Raw Unprocessed Honey, Winter Specials',
    sku: 'SBO-HNY-004',
    priceDisplay: '550৳ – 2,350৳',
    basePrice: 550,
    originalPrice: 650,
    discountPercent: 15,
    isBestSelling: true,
    isOrganicCertified: true,
    inStock: true,
    shortBullets: [
      '100% raw, unheated, and unfiltered honey with natural pollen & enzymes intact',
      'Harvested directly from mustard fields in Sirajganj & Sundarban mangrove forests',
      'Naturally crystallizes in winter—a hallmark of genuine raw mustard flower honey',
      'Useful for cough relief, winter immunity, warm lemon water, and breakfast',
    ],
    variantGroups: [
      {
        name: 'Weight',
        options: [
          { label: '500g Bottle', price: 550, originalPrice: 650 },
          { label: '1 Kg Gift Box', price: 1050, originalPrice: 1250 },
          { label: '2.5 Kg Family Pack', price: 2350, originalPrice: 2800 },
        ],
      },
      {
        name: 'Honey Variety',
        options: [
          { label: 'Mustard Flower (সরিষা ফুল)', price: 550 },
          { label: 'Sundarban Khalsi (খলিশা ফুল)', price: 850 },
        ],
      },
    ],
    specifications: [
      { label: 'Brand', value: 'HoneyRaj / Shiter Bazar' },
      { label: 'Model', value: 'Raw Unprocessed Floral Honey' },
      { label: 'Product Type', value: '100% Natural Apiary & Forest Honey' },
      { label: 'Moisture Content', value: 'Below 19% (Export Grade)' },
      { label: 'Lab Test', value: 'BCSIR & C3/C4 Sugar Adulteration Tested' },
      { label: 'Packaging', value: 'Food-Grade Jar + Luxury Gift Box' },
    ],
    description:
      'Collected directly from bee boxes placed in blooming yellow mustard fields and the deep Sundarbans, our raw honey is strained only through a fine cloth so all natural bee pollen, royal jelly traces, and live enzymes remain completely intact.',
    warrantyInfo:
      'Lifetime Purity Assurance: Comes with lab test verification. Full refund if proven adulterated in any accredited laboratory test.',
    rating: 4.9,
    reviewsCount: 215,
  },
  {
    id: 'prod-gawa-ghee',
    name: 'Pabna Pure Grass-Fed Gawa Ghee',
    bengaliSub: 'পাবনার ঐতিহ্যবাহী দানাদার খাঁটি গাওয়া ঘি',
    slug: 'pabna-pure-grass-fed-gawa-ghee',
    artKey: 'gawa-ghee',
    category: 'honey-ghee',
    categoryLabel: 'Honey & Ghee',
    categoriesList: 'Honey & Ghee, Organic Certified, Traditional Dairy',
    sku: 'SBO-GHE-005',
    priceDisplay: '780৳ – 2,850৳',
    basePrice: 780,
    originalPrice: 890,
    discountPercent: 12,
    isBestSelling: false,
    isOrganicCertified: true,
    inStock: true,
    shortBullets: [
      'Crafted using the traditional Bilona curd-churning method from Pabna cow milk',
      'Rich granular (দানাদার) texture and unmistakable roasted nutty aroma',
      'Packed with vitamins A, D, E, K and healthy butyric acid',
      'Useful for hot rice, parathas, polao, halua, and children’s brain development',
    ],
    variantGroups: [
      {
        name: 'Jar Size',
        options: [
          { label: '400g Glass Jar', price: 780, originalPrice: 890 },
          { label: '800g Glass Jar', price: 1490, originalPrice: 1700 },
          { label: '1.5 Kg Tin', price: 2850, originalPrice: 3200 },
        ],
      },
    ],
    specifications: [
      { label: 'Brand', value: 'Shiter Bazar Organic' },
      { label: 'Model', value: 'Pabna Bilona Danadar Gawa Ghee' },
      { label: 'Product Type', value: '100% Pure Clarified Butter (ঘি)' },
      { label: 'Origin', value: 'Bera & Santhia, Pabna, Bangladesh' },
      { label: 'Ingredients', value: '100% Pure Cow Milk Fat (No Dalda or Oil)' },
    ],
    description:
      'Made in small batches by master artisans in Pabna using cultured butter churned from grass-fed cow milk. Slow-simmered over firewood to achieve the signature golden granular texture and rich aroma.',
    warrantyInfo:
      '100% Pure Dairy Guarantee: Zero vegetable fat, dalda, or artificial ghee essence.',
    rating: 4.9,
    reviewsCount: 176,
  },
  {
    id: 'prod-ajwa-dates',
    name: 'Premium Madinah Ajwa Dates 1 Kg',
    bengaliSub: 'মদিনার প্রিমিয়াম এ-গ্রেড আজওয়া ও মরিয়ম খেজুর',
    slug: 'premium-madinah-ajwa-dates',
    artKey: 'ajwa-dates',
    category: 'dates',
    categoryLabel: 'Dates',
    categoriesList: 'Dates, Imported Dry Fruits, Sunnah Foods',
    sku: 'SBO-DAT-006',
    priceDisplay: '1,350৳',
    oldPriceDisplay: '1,600৳',
    basePrice: 1350,
    originalPrice: 1600,
    discountPercent: 16,
    isBestSelling: false,
    isOrganicCertified: true,
    inStock: true,
    shortBullets: [
      'Directly imported Grade-A Jumbo Ajwa dates from Al-Madinah, Saudi Arabia',
      'Soft, fleshy texture with natural caramel sweetness and zero glucose syrup glaze',
      'Rich in antioxidants, magnesium, potassium, and heart-healthy nutrients',
      'Comes in an airtight food-grade luxury gift box',
    ],
    variantGroups: [
      {
        name: 'Weight',
        options: [
          { label: '1 Kg VIP Box', price: 1350, originalPrice: 1600 },
          { label: '500g Pack', price: 700, originalPrice: 820 },
          { label: '3 Kg Family Carton', price: 3850, originalPrice: 4800 },
        ],
      },
    ],
    specifications: [
      { label: 'Brand', value: 'Al-Madinah Royal / Shiter Bazar' },
      { label: 'Model', value: 'VIP Grade-A Jumbo Ajwa' },
      { label: 'Product Type', value: 'Natural Uncoated Whole Dates' },
      { label: 'Country of Origin', value: 'Madinah, Saudi Arabia' },
      { label: 'Storage', value: 'Cool dry place or normal refrigerator' },
    ],
    description:
      'Handpicked from the blessed orchards of Madinah, our VIP Ajwa dates are soft, fresh, and naturally sweet without any artificial sugar coating.',
    warrantyInfo:
      'Freshness Guarantee: Cold-chain stored to ensure zero insect damage or fermentation.',
    rating: 5.0,
    reviewsCount: 194,
  },
  {
    id: 'prod-winter-combo',
    name: '4-in-1 Winter Superfood Family Combo',
    bengaliSub: 'সুন্দরবন মধু + গাওয়া ঘি + সরিষার তেল + মরিঙ্গা পাউডার কম্বো',
    slug: '4-in-1-winter-superfood-combo',
    artKey: 'winter-combo',
    category: 'combos',
    categoryLabel: 'Combos',
    categoriesList: 'Combos, Organic Certified, Best Value Packs',
    sku: 'SBO-CMB-007',
    priceDisplay: '1,850৳',
    oldPriceDisplay: '2,250৳',
    basePrice: 1850,
    originalPrice: 2250,
    discountPercent: 18,
    isBestSelling: true,
    isOrganicCertified: true,
    inStock: true,
    shortBullets: [
      'Includes: 500g Sundarban Honey + 400g Pabna Gawa Ghee + 1L Mustard Oil + 250g Moringa Powder',
      'Complete winter nutrition & immunity package for the whole family',
      'Saves 400৳ compared to buying individual items separately',
      'Free Home Delivery nationwide included with this combo!',
    ],
    variantGroups: [
      {
        name: 'Combo Size',
        options: [
          { label: 'Standard 4-in-1 Pack', price: 1850, originalPrice: 2250 },
          { label: 'Jumbo Family 4-in-1 Pack', price: 3450, originalPrice: 4200 },
        ],
      },
    ],
    specifications: [
      { label: 'Brand', value: 'Shiter Bazar Exclusive' },
      { label: 'Model', value: '4-in-1 Winter Immunity Saver Pack' },
      { label: 'Product Type', value: 'Organic Superfood Bundle' },
      { label: 'Total Weight', value: 'Approx. 2.25 Kg' },
      { label: 'Delivery Offer', value: 'Eligible for Free Shipping' },
    ],
    description:
      'Our most popular winter family bundle brings together four bestselling organic essentials in one discounted box: Raw Sundarban Honey, Pabna Danadar Gawa Ghee, Wooden Ghani Mustard Oil, and Shade-Dried Moringa Leaf Powder.',
    warrantyInfo:
      '100% Satisfaction & Safe Packaging Guarantee with bubble-wrapped shockproof delivery box.',
    rating: 5.0,
    reviewsCount: 264,
  },
  {
    id: 'prod-chia-seeds',
    name: 'Organic Mexican Chia Seeds 500g',
    bengaliSub: 'উচ্চ ওমেগা-৩ ও ফাইবার সমৃদ্ধ অর্গানিক চিয়া সিড',
    slug: 'organic-mexican-chia-seeds',
    artKey: 'chia-seeds',
    category: 'functional-food',
    categoryLabel: 'Functional Food',
    categoriesList: 'Functional Food, Organic Certified, Seeds & Nuts',
    sku: 'SBO-CHA-008',
    priceDisplay: '420৳',
    oldPriceDisplay: '500৳',
    basePrice: 420,
    originalPrice: 500,
    discountPercent: 16,
    isBestSelling: false,
    isOrganicCertified: true,
    inStock: true,
    shortBullets: [
      '99.9% machine-cleaned dust-free premium black & white chia seeds',
      'High in Omega-3 fatty acids, soluble fiber, calcium, and antioxidants',
      'Supports healthy weight management, digestion, and sustained hydration',
      'Swells up to 12x in water, milk, pudding, or morning lemon detox drinks',
    ],
    variantGroups: [
      {
        name: 'Weight',
        options: [
          { label: '500g Stand-up Pouch', price: 420, originalPrice: 500 },
          { label: '1 Kg Value Pack', price: 780, originalPrice: 950 },
        ],
      },
    ],
    specifications: [
      { label: 'Brand', value: 'Shiter Bazar Organic' },
      { label: 'Model', value: 'Export Grade Chia Seeds (Salvia hispanica)' },
      { label: 'Product Type', value: 'Functional Superfood Seed' },
      { label: 'Purity Level', value: '99.9% Cleaned (Zero Sand/Dust)' },
    ],
    description:
      'Our Organic Chia Seeds are triple-cleaned to remove dust and immature seeds, delivering maximum gel-forming capability and rich Omega-3 nutrition in every spoonful.',
    warrantyInfo: '7-Day Easy Return & Replacement Guarantee.',
    rating: 4.8,
    reviewsCount: 98,
  },
  // Exact item from Screenshot 1 so user can also inspect the exact Color / Storage / GDB-TABS10-006 specification view!
  {
    id: 'prod-galaxy-tab-s10',
    name: 'Samsung Galaxy Tab S10 WiFi',
    bengaliSub: 'Official Flagship Tablet with S Pen included in box',
    slug: 'samsung-galaxy-tab-s10-wifi',
    artKey: 'galaxy-tab-s10',
    category: 'combos',
    categoryLabel: 'Featured Specials',
    categoriesList: 'Samsung Galaxy Tab, Screen Protectors, Tablets',
    sku: 'GDB-TABS10-006',
    priceDisplay: '84,990৳',
    oldPriceDisplay: '92,000৳',
    basePrice: 84990,
    originalPrice: 92000,
    discountPercent: 8,
    isBestSelling: false,
    isOrganicCertified: false,
    inStock: true,
    shortBullets: [
      'Dynamic AMOLED 2X anti-reflective display with Vision Booster',
      'IP68 water and dust resistant Armor Aluminum frame & S Pen',
      'Galaxy AI Note Assist, Drawing Assist, and split-screen multitasking',
      'Useful for streaming, study, and productivity',
    ],
    variantGroups: [
      {
        name: 'Color',
        options: [
          { label: 'Moonstone Gray', price: 84990, originalPrice: 92000 },
          { label: 'Silver', price: 84990, originalPrice: 92000 },
        ],
      },
      {
        name: 'Storage',
        options: [
          { label: '256GB', price: 84990, originalPrice: 92000 },
          { label: '512GB', price: 96500, originalPrice: 104000 },
        ],
      },
    ],
    specifications: [
      { label: 'Brand', value: 'Samsung' },
      { label: 'Model', value: 'Galaxy Tab S10 WiFi' },
      { label: 'Product Type', value: 'Tablet' },
      { label: 'Display', value: '12.4" Dynamic AMOLED 2X, 120Hz HDR10+' },
      { label: 'Memory & Storage', value: '12GB RAM | 256GB / 512GB Storage' },
      { label: 'Stylus', value: 'S Pen Included (Bluetooth, Magnetic Charge)' },
      { label: 'Protection', value: 'IP68 Water & Dust Resistant' },
    ],
    description:
      'The Samsung Galaxy Tab S10 WiFi combines flagship performance with an anti-reflective Dynamic AMOLED 2X canvas and the precision S Pen—engineered for seamless streaming, academic note-taking, creative illustration, and productivity.',
    warrantyInfo:
      '1 Year Official Brand Warranty + 10-Day Replacement Guarantee.',
    rating: 5.0,
    reviewsCount: 64,
  },
];
