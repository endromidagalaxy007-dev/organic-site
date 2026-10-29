import { createClient, Client } from '@libsql/client/web';
import { CATEGORIES, PRODUCTS } from '../../src/data/products';

export interface Env {
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
}

async function sha1Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getTursoWebClient(env: Env): Client {
  const url = (env.TURSO_DATABASE_URL || '').trim();
  const authToken = (env.TURSO_AUTH_TOKEN || '').trim() || undefined;
  if (!url) {
    throw new Error(
      'TURSO_DATABASE_URL is not configured in Cloudflare Pages Environment Variables.'
    );
  }
  return createClient({ url, authToken });
}

let schemaInitialized = false;

async function ensureSchemaAndSeed(db: Client) {
  if (schemaInitialized) return;

  await db.execute(`
    CREATE TABLE IF NOT EXISTS store_settings (
      id TEXT PRIMARY KEY,
      store_name_bn TEXT NOT NULL,
      store_name_sub_bn TEXT NOT NULL,
      store_name_en TEXT NOT NULL,
      logo_url TEXT DEFAULT '',
      announcement_text TEXT NOT NULL,
      hotline TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      inside_dhaka_shipping REAL DEFAULT 60,
      outside_dhaka_shipping REAL DEFAULT 120,
      free_shipping_threshold REAL DEFAULT 1500,
      featured_categories_title TEXT DEFAULT 'Featured Categories',
      top_selling_title TEXT DEFAULT 'Top Selling Products',
      organic_certified_title TEXT DEFAULT 'Organic Certified',
      winter_special_title TEXT DEFAULT 'Winter Specials & Superfoods',
      winter_special_subtitle TEXT DEFAULT 'শীতের বিশেষ মধু, পাবনার গাওয়া ঘি, মদিনার আজওয়া খেজুর এবং কম্বো অফার',
      footer_about TEXT NOT NULL,
      fb_pixel_id TEXT DEFAULT '',
      tiktok_pixel_id TEXT DEFAULT '',
      gtm_id TEXT DEFAULT '',
      enable_pixel_events INTEGER DEFAULT 1,
      track_page_view INTEGER DEFAULT 1,
      track_view_content INTEGER DEFAULT 1,
      track_add_to_cart INTEGER DEFAULT 1,
      track_initiate_checkout INTEGER DEFAULT 1,
      track_purchase INTEGER DEFAULT 1
    )
  `);

  // Safe migrations for existing store_settings table
  const alterCols = [
    `ALTER TABLE store_settings ADD COLUMN fb_pixel_id TEXT DEFAULT ''`,
    `ALTER TABLE store_settings ADD COLUMN tiktok_pixel_id TEXT DEFAULT ''`,
    `ALTER TABLE store_settings ADD COLUMN gtm_id TEXT DEFAULT ''`,
    `ALTER TABLE store_settings ADD COLUMN enable_pixel_events INTEGER DEFAULT 1`,
    `ALTER TABLE store_settings ADD COLUMN track_page_view INTEGER DEFAULT 1`,
    `ALTER TABLE store_settings ADD COLUMN track_view_content INTEGER DEFAULT 1`,
    `ALTER TABLE store_settings ADD COLUMN track_add_to_cart INTEGER DEFAULT 1`,
    `ALTER TABLE store_settings ADD COLUMN track_initiate_checkout INTEGER DEFAULT 1`,
    `ALTER TABLE store_settings ADD COLUMN track_purchase INTEGER DEFAULT 1`,
  ];
  for (const sql of alterCols) {
    try {
      await db.execute(sql);
    } catch {
      // Column already exists
    }
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      bengali_name TEXT NOT NULL,
      image_url TEXT DEFAULT '',
      art_key TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      bengali_sub TEXT DEFAULT '',
      slug TEXT NOT NULL,
      art_key TEXT DEFAULT 'default',
      image_url TEXT DEFAULT '',
      gallery_urls_json TEXT DEFAULT '[]',
      category TEXT NOT NULL,
      category_label TEXT NOT NULL,
      categories_list TEXT NOT NULL,
      sku TEXT NOT NULL,
      price_display TEXT NOT NULL,
      old_price_display TEXT DEFAULT '',
      base_price REAL NOT NULL,
      original_price REAL DEFAULT 0,
      discount_percent INTEGER DEFAULT 0,
      is_best_selling INTEGER DEFAULT 0,
      is_organic_certified INTEGER DEFAULT 0,
      in_stock INTEGER DEFAULT 1,
      short_bullets_json TEXT DEFAULT '[]',
      variant_groups_json TEXT DEFAULT '[]',
      specifications_json TEXT DEFAULT '[]',
      description TEXT DEFAULT '',
      warranty_info TEXT DEFAULT '',
      rating REAL DEFAULT 5.0,
      reviews_count INTEGER DEFAULT 10,
      created_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS hero_banners (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      badge_text TEXT NOT NULL,
      cta_text TEXT NOT NULL,
      image_url TEXT DEFAULT '',
      slide_index INTEGER DEFAULT 0,
      bg_gradient TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS coupons (
      code TEXT PRIMARY KEY,
      discount_type TEXT NOT NULL,
      discount_value REAL NOT NULL,
      min_order_amount REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      delivery_zone TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      shipping REAL DEFAULT 0,
      total REAL NOT NULL,
      status TEXT NOT NULL,
      courier_name TEXT DEFAULT 'Steadfast Courier',
      tracking_code TEXT DEFAULT '',
      admin_notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS order_activities (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      status_title TEXT NOT NULL,
      note TEXT NOT NULL,
      actor TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  const settingsCheck = await db.execute(`SELECT COUNT(*) as cnt FROM store_settings`);
  if (Number(settingsCheck.rows[0].cnt) === 0) {
    await db.execute({
      sql: `INSERT INTO store_settings (
        id, store_name_bn, store_name_sub_bn, store_name_en, logo_url,
        announcement_text, hotline, whatsapp, email, address,
        inside_dhaka_shipping, outside_dhaka_shipping, free_shipping_threshold,
        featured_categories_title, top_selling_title, organic_certified_title,
        winter_special_title, winter_special_subtitle, footer_about,
        fb_pixel_id, tiktok_pixel_id, gtm_id, enable_pixel_events
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'default',
        'শিতের',
        'বাজার',
        'Shiter Bazar Organic',
        '',
        '🌿 ১০০% খাঁটি ও ল্যাব টেস্টেড অর্গানিক ফুড • ১,৫০০৳+ অর্ডারে সারাদেশে ফ্রি ডেলিভারি!',
        '+880 9613-800800',
        '+880 1700-000000',
        'support@shiterbazar.com',
        'Banani, Dhaka-1213, Bangladesh',
        60,
        120,
        1500,
        'Featured Categories',
        'Top Selling Products',
        'Organic Certified',
        'Winter Specials & Superfoods',
        'শীতের বিশেষ মধু, পাবনার গাওয়া ঘি, মদিনার আজওয়া খেজুর এবং কম্বো অফার',
        'শুদ্ধতার সাথে স্বাস্থ্যের মেলবন্ধন — আমরা সরাসরি কৃষক, মৌয়াল ও খামারিদের কাছ থেকে ১০০% খাঁটি ও অর্গানিক খাদ্যপণ্য আপনার ঘরে পৌঁছে দিচ্ছি।',
        '',
        '',
        '',
        1,
      ],
    });
  }

  const catCheck = await db.execute(`SELECT COUNT(*) as cnt FROM categories`);
  if (Number(catCheck.rows[0].cnt) === 0) {
    for (let i = 0; i < CATEGORIES.length; i++) {
      const c = CATEGORIES[i];
      await db.execute({
        sql: `INSERT INTO categories (id, name, bengali_name, image_url, art_key, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [c.id, c.name, c.bengaliName, '', c.id, i],
      });
    }
  }

  const prodCheck = await db.execute(`SELECT COUNT(*) as cnt FROM products`);
  if (Number(prodCheck.rows[0].cnt) === 0) {
    for (const p of PRODUCTS) {
      await db.execute({
        sql: `INSERT INTO products (
          id, name, bengali_sub, slug, art_key, image_url, gallery_urls_json,
          category, category_label, categories_list, sku, price_display, old_price_display,
          base_price, original_price, discount_percent, is_best_selling, is_organic_certified,
          in_stock, short_bullets_json, variant_groups_json, specifications_json,
          description, warranty_info, rating, reviews_count, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          p.id,
          p.name,
          p.bengaliSub || '',
          p.slug,
          p.artKey,
          '',
          '[]',
          p.category,
          p.categoryLabel,
          p.categoriesList,
          p.sku,
          p.priceDisplay,
          p.oldPriceDisplay || '',
          p.basePrice,
          p.originalPrice || 0,
          p.discountPercent || 0,
          p.isBestSelling ? 1 : 0,
          p.isOrganicCertified ? 1 : 0,
          p.inStock ? 1 : 0,
          JSON.stringify(p.shortBullets),
          JSON.stringify(p.variantGroups),
          JSON.stringify(p.specifications),
          p.description,
          p.warrantyInfo,
          p.rating,
          p.reviewsCount,
          new Date().toISOString(),
        ],
      });
    }
  }

  const bannerCheck = await db.execute(`SELECT COUNT(*) as cnt FROM hero_banners`);
  if (Number(bannerCheck.rows[0].cnt) === 0) {
    const defaultBanners = [
      {
        id: 'banner-1',
        title: 'প্রিমিয়াম সিলেকশন',
        subtitle: 'শুদ্ধতার সাথে স্বাস্থ্যের মেলবন্ধন',
        badge_text: 'প্রিমিয়াম সিলেকশন',
        cta_text: 'এখনই কিনুন',
        image_url: '',
        slide_index: 0,
        bg_gradient: 'radial-gradient(circle at 50% 42%, #FAF0D7 0%, #EAD09E 52%, #D7B06E 100%)',
        is_active: 1,
        sort_order: 0,
      },
      {
        id: 'banner-2',
        title: 'সুন্দরবনের প্রাকৃতিক চাকের মধু ও পাবনার খাঁটি গাওয়া ঘি',
        subtitle: 'শীতের সকালে রোগ প্রতিরোধ ক্ষমতা বাড়াতে ল্যাব টেস্টেড অর্গানিক সুপারফুড কম্বো',
        badge_text: '১০০% খাঁটি ও প্রাকৃতিক',
        cta_text: 'এখনই অর্ডার করুন',
        image_url: '',
        slide_index: 1,
        bg_gradient: 'linear-gradient(135deg, #2D1606 0%, #5C2D0C 48%, #8F4B14 100%)',
        is_active: 1,
        sort_order: 1,
      },
      {
        id: 'banner-3',
        title: 'মরিঙ্গা পাউডার, চিয়া সিড ও প্রিমিয়াম খেজুরের বিশেষ ছাড়',
        subtitle: 'সরাসরি বাগান ও খামার থেকে সংগৃহীত ১০০% কেমিক্যালমুক্ত সুপারফুড — সারাদেশে ক্যাশ অন ডেলিভারি',
        badge_text: 'অর্গানিক সার্টিফায়েড কালেকশন',
        cta_text: 'কালেকশন দেখুন',
        image_url: '',
        slide_index: 2,
        bg_gradient: 'linear-gradient(135deg, #064E3B 0%, #047857 52%, #10B981 100%)',
        is_active: 1,
        sort_order: 2,
      },
    ];
    for (const b of defaultBanners) {
      await db.execute({
        sql: `INSERT INTO hero_banners (id, title, subtitle, badge_text, cta_text, image_url, slide_index, bg_gradient, is_active, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          b.id,
          b.title,
          b.subtitle,
          b.badge_text,
          b.cta_text,
          b.image_url,
          b.slide_index,
          b.bg_gradient,
          b.is_active,
          b.sort_order,
        ],
      });
    }
  }

  const couponCheck = await db.execute(`SELECT COUNT(*) as cnt FROM coupons`);
  if (Number(couponCheck.rows[0].cnt) === 0) {
    await db.execute({
      sql: `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, is_active) VALUES (?, ?, ?, ?, ?)`,
      args: ['WINTER10', 'percent', 10, 500, 1],
    });
    await db.execute({
      sql: `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, is_active) VALUES (?, ?, ?, ?, ?)`,
      args: ['ORGANIC100', 'fixed', 100, 1000, 1],
    });
  }

  schemaInitialized = true;
}

function mapProductRow(row: Record<string, any>) {
  return {
    id: String(row.id),
    name: String(row.name),
    bengaliSub: String(row.bengali_sub || ''),
    slug: String(row.slug),
    artKey: String(row.art_key || 'default'),
    imageUrl: String(row.image_url || ''),
    galleryUrls: JSON.parse(String(row.gallery_urls_json || '[]')),
    category: String(row.category),
    categoryLabel: String(row.category_label),
    categoriesList: String(row.categories_list),
    sku: String(row.sku),
    priceDisplay: String(row.price_display),
    oldPriceDisplay: row.old_price_display ? String(row.old_price_display) : undefined,
    basePrice: Number(row.base_price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    discountPercent: row.discount_percent ? Number(row.discount_percent) : undefined,
    isBestSelling: Boolean(row.is_best_selling),
    isOrganicCertified: Boolean(row.is_organic_certified),
    inStock: Boolean(row.in_stock),
    shortBullets: JSON.parse(String(row.short_bullets_json || '[]')),
    variantGroups: JSON.parse(String(row.variant_groups_json || '[]')),
    specifications: JSON.parse(String(row.specifications_json || '[]')),
    description: String(row.description || ''),
    warrantyInfo: String(row.warranty_info || ''),
    rating: Number(row.rating || 5),
    reviewsCount: Number(row.reviews_count || 0),
  };
}

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Cache-Control': 'no-store',
    },
  });
}

export const onRequest = async (context: {
  request: Request;
  env: Env;
  params: { route?: string[] };
}): Promise<Response> => {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/^\/api\/?/, '');
  const segments = pathname.split('/').filter(Boolean);
  const method = request.method.toUpperCase();

  try {
    // Handle /api/upload first (uses Cloudinary or inline WebP fallback)
    if (segments[0] === 'upload' && method === 'POST') {
      const body: any = await request.json();
      const { imageBase64, folder = 'shiter_bazar' } = body;
      if (!imageBase64) {
        return jsonResponse({ error: 'No image data provided' }, 400);
      }

      const cloudName = env.CLOUDINARY_CLOUD_NAME?.trim();
      const apiKey = env.CLOUDINARY_API_KEY?.trim();
      const apiSecret = env.CLOUDINARY_API_SECRET?.trim();

      if (cloudName && apiKey && apiSecret) {
        const timestamp = Math.round(Date.now() / 1000);
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = await sha1Hex(paramsToSign);

        const formData = new URLSearchParams();
        formData.append('file', imageBase64);
        formData.append('api_key', apiKey);
        formData.append('timestamp', String(timestamp));
        formData.append('folder', folder);
        formData.append('signature', signature);

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
        const cloudData: any = await cloudRes.json();
        if (!cloudRes.ok) {
          throw new Error(cloudData?.error?.message || 'Cloudinary upload failed');
        }
        return jsonResponse({
          url: cloudData.secure_url,
          provider: 'cloudinary',
        });
      }

      return jsonResponse({
        url: imageBase64,
        provider: 'inline-data-url',
      });
    }

    const db = getTursoWebClient(env);
    await ensureSchemaAndSeed(db);

    // 1. GET /api/bootstrap
    if (segments[0] === 'bootstrap' && method === 'GET') {
      const [settingsRes, catRes, prodRes, bannerRes, couponRes] = await Promise.all([
        db.execute(`SELECT * FROM store_settings WHERE id = 'default' LIMIT 1`),
        db.execute(`SELECT * FROM categories ORDER BY sort_order ASC`),
        db.execute(`SELECT * FROM products ORDER BY created_at ASC`),
        db.execute(`SELECT * FROM hero_banners ORDER BY sort_order ASC`),
        db.execute(`SELECT * FROM coupons`),
      ]);

      const sRow = settingsRes.rows[0] || {};
      const settings = {
        storeNameBn: String(sRow.store_name_bn || 'শিতের'),
        storeNameSubBn: String(sRow.store_name_sub_bn || 'বাজার'),
        storeNameEn: String(sRow.store_name_en || 'Shiter Bazar Organic'),
        logoUrl: String(sRow.logo_url || ''),
        announcementText: String(sRow.announcement_text || ''),
        hotline: String(sRow.hotline || '+880 9613-800800'),
        whatsapp: String(sRow.whatsapp || '+880 1700-000000'),
        email: String(sRow.email || 'support@shiterbazar.com'),
        address: String(sRow.address || 'Banani, Dhaka-1213, Bangladesh'),
        insideDhakaShipping: Number(sRow.inside_dhaka_shipping ?? 60),
        outsideDhakaShipping: Number(sRow.outside_dhaka_shipping ?? 120),
        freeShippingThreshold: Number(sRow.free_shipping_threshold ?? 1500),
        featuredCategoriesTitle: String(sRow.featured_categories_title || 'Featured Categories'),
        topSellingTitle: String(sRow.top_selling_title || 'Top Selling Products'),
        organicCertifiedTitle: String(sRow.organic_certified_title || 'Organic Certified'),
        winterSpecialTitle: String(sRow.winter_special_title || 'Winter Specials & Superfoods'),
        winterSpecialSubtitle: String(sRow.winter_special_subtitle || ''),
        footerAbout: String(sRow.footer_about || ''),
        fbPixelId: String(sRow.fb_pixel_id || ''),
        tiktokPixelId: String(sRow.tiktok_pixel_id || ''),
        gtmId: String(sRow.gtm_id || ''),
        enablePixelEvents: Boolean(sRow.enable_pixel_events ?? 1),
        trackPageView: Boolean(sRow.track_page_view ?? 1),
        trackViewContent: Boolean(sRow.track_view_content ?? 1),
        trackAddToCart: Boolean(sRow.track_add_to_cart ?? 1),
        trackInitiateCheckout: Boolean(sRow.track_initiate_checkout ?? 1),
        trackPurchase: Boolean(sRow.track_purchase ?? 1),
      };

      const categories = catRes.rows.map((r) => ({
        id: String(r.id),
        name: String(r.name),
        bengaliName: String(r.bengali_name),
        imageUrl: String(r.image_url || ''),
        artKey: String(r.art_key || r.id),
        sortOrder: Number(r.sort_order || 0),
        itemCount: 0,
      }));

      const products = prodRes.rows.map(mapProductRow);
      categories.forEach((c) => {
        c.itemCount = products.filter((p) => p.category === c.id).length;
      });

      const banners = bannerRes.rows.map((b) => ({
        id: String(b.id),
        title: String(b.title),
        subtitle: String(b.subtitle),
        badgeText: String(b.badge_text),
        ctaText: String(b.cta_text),
        imageUrl: String(b.image_url || ''),
        slideIndex: Number(b.slide_index || 0),
        bgGradient: String(b.bg_gradient || ''),
        isActive: Boolean(b.is_active),
        sortOrder: Number(b.sort_order || 0),
      }));

      const coupons = couponRes.rows.map((c) => ({
        code: String(c.code),
        discountType: String(c.discount_type) as 'percent' | 'fixed',
        discountValue: Number(c.discount_value),
        minOrderAmount: Number(c.min_order_amount || 0),
        isActive: Boolean(c.is_active),
      }));

      return jsonResponse({
        settings,
        categories,
        products,
        banners,
        coupons,
        integrationStatus: {
          tursoConfigured: true,
          tursoDatabaseUrl: 'Connected to Remote Turso DB (Cloudflare Pages)',
          cloudinaryConfigured: Boolean(
            env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
          ),
        },
      });
    }

    // 2. PUT /api/settings
    if (segments[0] === 'settings' && method === 'PUT') {
      const s: any = await request.json();
      await db.execute({
        sql: `UPDATE store_settings SET
          store_name_bn = ?, store_name_sub_bn = ?, store_name_en = ?, logo_url = ?,
          announcement_text = ?, hotline = ?, whatsapp = ?, email = ?, address = ?,
          inside_dhaka_shipping = ?, outside_dhaka_shipping = ?, free_shipping_threshold = ?,
          featured_categories_title = ?, top_selling_title = ?, organic_certified_title = ?,
          winter_special_title = ?, winter_special_subtitle = ?, footer_about = ?,
          fb_pixel_id = ?, tiktok_pixel_id = ?, gtm_id = ?,
          enable_pixel_events = ?, track_page_view = ?, track_view_content = ?,
          track_add_to_cart = ?, track_initiate_checkout = ?, track_purchase = ?
          WHERE id = 'default'`,
        args: [
          s.storeNameBn || 'শিতের',
          s.storeNameSubBn || 'বাজার',
          s.storeNameEn || 'Shiter Bazar Organic',
          s.logoUrl || '',
          s.announcementText || '',
          s.hotline || '',
          s.whatsapp || '',
          s.email || '',
          s.address || '',
          Number(s.insideDhakaShipping ?? 60),
          Number(s.outsideDhakaShipping ?? 120),
          Number(s.freeShippingThreshold ?? 1500),
          s.featuredCategoriesTitle || 'Featured Categories',
          s.topSellingTitle || 'Top Selling Products',
          s.organicCertifiedTitle || 'Organic Certified',
          s.winterSpecialTitle || 'Winter Specials & Superfoods',
          s.winterSpecialSubtitle || '',
          s.footerAbout || '',
          s.fbPixelId || '',
          s.tiktokPixelId || '',
          s.gtmId || '',
          s.enablePixelEvents !== false ? 1 : 0,
          s.trackPageView !== false ? 1 : 0,
          s.trackViewContent !== false ? 1 : 0,
          s.trackAddToCart !== false ? 1 : 0,
          s.trackInitiateCheckout !== false ? 1 : 0,
          s.trackPurchase !== false ? 1 : 0,
        ],
      });
      return jsonResponse({ success: true });
    }

    // 3. CATEGORIES CRUD
    if (segments[0] === 'categories') {
      if (method === 'POST') {
        const { id, name, bengaliName, imageUrl, artKey, sortOrder }: any = await request.json();
        const slugId =
          id ||
          name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') +
            '-' +
            Date.now().toString().slice(-3);
        await db.execute({
          sql: `INSERT INTO categories (id, name, bengali_name, image_url, art_key, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
          args: [
            slugId,
            name,
            bengaliName || name,
            imageUrl || '',
            artKey || 'combos',
            Number(sortOrder || 0),
          ],
        });
        return jsonResponse({ success: true, id: slugId });
      }
      if (method === 'PUT' && segments[1]) {
        const { name, bengaliName, imageUrl, artKey, sortOrder }: any = await request.json();
        await db.execute({
          sql: `UPDATE categories SET name = ?, bengali_name = ?, image_url = ?, art_key = ?, sort_order = ? WHERE id = ?`,
          args: [
            name,
            bengaliName || name,
            imageUrl || '',
            artKey || 'combos',
            Number(sortOrder || 0),
            segments[1],
          ],
        });
        return jsonResponse({ success: true });
      }
      if (method === 'DELETE' && segments[1]) {
        await db.execute({ sql: `DELETE FROM categories WHERE id = ?`, args: [segments[1]] });
        return jsonResponse({ success: true });
      }
    }

    // 4. PRODUCTS CRUD
    if (segments[0] === 'products') {
      if (method === 'POST') {
        const p: any = await request.json();
        const id = p.id || `prod-${Date.now()}`;
        const slug =
          p.slug ||
          p.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        await db.execute({
          sql: `INSERT INTO products (
            id, name, bengali_sub, slug, art_key, image_url, gallery_urls_json,
            category, category_label, categories_list, sku, price_display, old_price_display,
            base_price, original_price, discount_percent, is_best_selling, is_organic_certified,
            in_stock, short_bullets_json, variant_groups_json, specifications_json,
            description, warranty_info, rating, reviews_count, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            id,
            p.name,
            p.bengaliSub || '',
            slug,
            p.artKey || 'default',
            p.imageUrl || '',
            JSON.stringify(p.galleryUrls || []),
            p.category || 'combos',
            p.categoryLabel || 'Combos',
            p.categoriesList || p.categoryLabel || 'Organic',
            p.sku || `SBO-${Math.floor(100 + Math.random() * 900)}`,
            p.priceDisplay || `${p.basePrice}৳`,
            p.oldPriceDisplay || '',
            Number(p.basePrice || 0),
            Number(p.originalPrice || 0),
            Number(p.discountPercent || 0),
            p.isBestSelling ? 1 : 0,
            p.isOrganicCertified ? 1 : 0,
            p.inStock !== false ? 1 : 0,
            JSON.stringify(p.shortBullets || []),
            JSON.stringify(p.variantGroups || []),
            JSON.stringify(p.specifications || []),
            p.description || '',
            p.warrantyInfo || '',
            Number(p.rating || 5.0),
            Number(p.reviewsCount || 1),
            new Date().toISOString(),
          ],
        });
        return jsonResponse({ success: true, id });
      }
      if (method === 'PUT' && segments[1]) {
        const p: any = await request.json();
        await db.execute({
          sql: `UPDATE products SET
            name = ?, bengali_sub = ?, slug = ?, art_key = ?, image_url = ?, gallery_urls_json = ?,
            category = ?, category_label = ?, categories_list = ?, sku = ?, price_display = ?, old_price_display = ?,
            base_price = ?, original_price = ?, discount_percent = ?, is_best_selling = ?, is_organic_certified = ?,
            in_stock = ?, short_bullets_json = ?, variant_groups_json = ?, specifications_json = ?,
            description = ?, warranty_info = ?
            WHERE id = ?`,
          args: [
            p.name,
            p.bengaliSub || '',
            p.slug || p.id,
            p.artKey || 'default',
            p.imageUrl || '',
            JSON.stringify(p.galleryUrls || []),
            p.category,
            p.categoryLabel || p.category,
            p.categoriesList || p.categoryLabel || p.category,
            p.sku || '',
            p.priceDisplay || `${p.basePrice}৳`,
            p.oldPriceDisplay || '',
            Number(p.basePrice || 0),
            Number(p.originalPrice || 0),
            Number(p.discountPercent || 0),
            p.isBestSelling ? 1 : 0,
            p.isOrganicCertified ? 1 : 0,
            p.inStock ? 1 : 0,
            JSON.stringify(p.shortBullets || []),
            JSON.stringify(p.variantGroups || []),
            JSON.stringify(p.specifications || []),
            p.description || '',
            p.warrantyInfo || '',
            segments[1],
          ],
        });
        return jsonResponse({ success: true });
      }
      if (method === 'DELETE' && segments[1]) {
        await db.execute({ sql: `DELETE FROM products WHERE id = ?`, args: [segments[1]] });
        return jsonResponse({ success: true });
      }
    }

    // 5. BANNERS CRUD
    if (segments[0] === 'banners') {
      if (method === 'POST') {
        const b: any = await request.json();
        const id = b.id || `banner-${Date.now()}`;
        await db.execute({
          sql: `INSERT INTO hero_banners (id, title, subtitle, badge_text, cta_text, image_url, slide_index, bg_gradient, is_active, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            id,
            b.title || '',
            b.subtitle || '',
            b.badgeText || '',
            b.ctaText || 'এখনই কিনুন',
            b.imageUrl || '',
            Number(b.slideIndex ?? 0),
            b.bgGradient || '',
            b.isActive !== false ? 1 : 0,
            Number(b.sortOrder ?? 0),
          ],
        });
        return jsonResponse({ success: true, id });
      }
      if (method === 'PUT' && segments[1]) {
        const b: any = await request.json();
        await db.execute({
          sql: `UPDATE hero_banners SET
            title = ?, subtitle = ?, badge_text = ?, cta_text = ?, image_url = ?,
            slide_index = ?, bg_gradient = ?, is_active = ?, sort_order = ?
            WHERE id = ?`,
          args: [
            b.title || '',
            b.subtitle || '',
            b.badgeText || '',
            b.ctaText || '',
            b.imageUrl || '',
            Number(b.slideIndex ?? 0),
            b.bgGradient || '',
            b.isActive ? 1 : 0,
            Number(b.sortOrder ?? 0),
            segments[1],
          ],
        });
        return jsonResponse({ success: true });
      }
      if (method === 'DELETE' && segments[1]) {
        await db.execute({ sql: `DELETE FROM hero_banners WHERE id = ?`, args: [segments[1]] });
        return jsonResponse({ success: true });
      }
    }

    // 6. COUPONS CRUD
    if (segments[0] === 'coupons') {
      if (method === 'POST') {
        const { code, discountType, discountValue, minOrderAmount, isActive }: any =
          await request.json();
        const cleanCode = String(code).trim().toUpperCase();
        await db.execute({
          sql: `INSERT OR REPLACE INTO coupons (code, discount_type, discount_value, min_order_amount, is_active) VALUES (?, ?, ?, ?, ?)`,
          args: [
            cleanCode,
            discountType || 'percent',
            Number(discountValue || 10),
            Number(minOrderAmount || 0),
            isActive !== false ? 1 : 0,
          ],
        });
        return jsonResponse({ success: true });
      }
      if (method === 'DELETE' && segments[1]) {
        await db.execute({
          sql: `DELETE FROM coupons WHERE code = ?`,
          args: [segments[1].toUpperCase()],
        });
        return jsonResponse({ success: true });
      }
    }

    // 7. ORDERS & ADMIN ACTIVITIES
    if (segments[0] === 'orders') {
      if (method === 'GET' && !segments[1]) {
        const [ordersRes, actsRes] = await Promise.all([
          db.execute(`SELECT * FROM orders ORDER BY created_at DESC`),
          db.execute(`SELECT * FROM order_activities ORDER BY created_at DESC`),
        ]);
        const activitiesByOrder: Record<string, any[]> = {};
        for (const a of actsRes.rows) {
          const oid = String(a.order_id);
          if (!activitiesByOrder[oid]) activitiesByOrder[oid] = [];
          activitiesByOrder[oid].push({
            id: String(a.id),
            orderId: oid,
            statusTitle: String(a.status_title),
            note: String(a.note),
            actor: String(a.actor),
            createdAt: String(a.created_at),
          });
        }
        const orders = ordersRes.rows.map((o) => {
          const oid = String(o.order_id);
          return {
            orderId: oid,
            customerName: String(o.customer_name),
            phone: String(o.phone),
            address: String(o.address),
            deliveryZone: String(o.delivery_zone),
            paymentMethod: String(o.payment_method),
            items: JSON.parse(String(o.items_json || '[]')),
            subtotal: Number(o.subtotal),
            discount: Number(o.discount || 0),
            shipping: Number(o.shipping || 0),
            total: Number(o.total),
            status: String(o.status),
            courierName: String(o.courier_name || 'Steadfast Courier'),
            trackingCode: String(o.tracking_code || ''),
            adminNotes: String(o.admin_notes || ''),
            createdAt: String(o.created_at),
            updatedAt: String(o.updated_at),
            activities: activitiesByOrder[oid] || [],
          };
        });
        return jsonResponse({ orders });
      }

      if (method === 'POST' && !segments[1]) {
        const o: any = await request.json();
        const orderId = o.orderId || `SB-${Math.floor(100000 + Math.random() * 900000)}`;
        const now = new Date().toISOString();
        await db.execute({
          sql: `INSERT INTO orders (
            order_id, customer_name, phone, address, delivery_zone, payment_method,
            items_json, subtotal, discount, shipping, total, status,
            courier_name, tracking_code, admin_notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            orderId,
            o.customerName,
            o.phone,
            o.address,
            o.deliveryZone || 'inside-dhaka',
            o.paymentMethod || 'cod',
            JSON.stringify(o.items || []),
            Number(o.subtotal || 0),
            Number(o.discount || 0),
            Number(o.shipping || 0),
            Number(o.total || 0),
            o.status || 'Pending',
            o.courierName || 'Steadfast Courier',
            o.trackingCode || '',
            o.adminNotes || '',
            now,
            now,
          ],
        });
        await db.execute({
          sql: `INSERT INTO order_activities (id, order_id, status_title, note, actor, created_at)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [
            `act-${Date.now()}`,
            orderId,
            o.createdByAdmin ? 'Order Created by Admin' : 'Order Placed by Customer',
            o.createdByAdmin
              ? `Manual order created in Admin Panel for ${o.customerName} (${o.phone}).`
              : `Order received via ${String(o.paymentMethod || 'COD').toUpperCase()}. Waiting for admin confirmation.`,
            o.createdByAdmin ? 'Admin' : 'Customer',
            now,
          ],
        });
        return jsonResponse({ success: true, orderId });
      }

      if (segments[1] && segments[2] === 'activities' && method === 'POST') {
        const orderId = decodeURIComponent(segments[1]);
        const { statusTitle, note, actor, newStatus }: any = await request.json();
        const now = new Date().toISOString();
        await db.execute({
          sql: `INSERT INTO order_activities (id, order_id, status_title, note, actor, created_at)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [
            `act-${Date.now()}`,
            orderId,
            statusTitle || 'Admin Activity Update',
            note || '',
            actor || 'Admin',
            now,
          ],
        });
        if (newStatus) {
          await db.execute({
            sql: `UPDATE orders SET status = ?, updated_at = ? WHERE order_id = ?`,
            args: [newStatus, now, orderId],
          });
        }
        return jsonResponse({ success: true });
      }

      if (segments[1] && method === 'PUT') {
        const orderId = decodeURIComponent(segments[1]);
        const u: any = await request.json();
        const now = new Date().toISOString();
        const existingRes = await db.execute({
          sql: `SELECT * FROM orders WHERE order_id = ?`,
          args: [orderId],
        });
        if (existingRes.rows.length === 0) {
          return jsonResponse({ error: 'Order not found' }, 404);
        }
        const prev = existingRes.rows[0];
        await db.execute({
          sql: `UPDATE orders SET
            customer_name = ?, phone = ?, address = ?, delivery_zone = ?, payment_method = ?,
            items_json = ?, subtotal = ?, discount = ?, shipping = ?, total = ?,
            status = ?, courier_name = ?, tracking_code = ?, admin_notes = ?, updated_at = ?
            WHERE order_id = ?`,
          args: [
            u.customerName ?? prev.customer_name,
            u.phone ?? prev.phone,
            u.address ?? prev.address,
            u.deliveryZone ?? prev.delivery_zone,
            u.paymentMethod ?? prev.payment_method,
            u.items ? JSON.stringify(u.items) : prev.items_json,
            Number(u.subtotal ?? prev.subtotal),
            Number(u.discount ?? prev.discount),
            Number(u.shipping ?? prev.shipping),
            Number(u.total ?? prev.total),
            u.status ?? prev.status,
            u.courierName ?? prev.courier_name,
            u.trackingCode ?? prev.tracking_code,
            u.adminNotes ?? prev.admin_notes,
            now,
            orderId,
          ],
        });
        if (u.activityNote || (u.status && u.status !== prev.status)) {
          const statusTitle =
            u.activityTitle ||
            (u.status !== prev.status ? `Status Updated to "${u.status}"` : 'Admin Updated Order');
          const noteText =
            u.activityNote ||
            `Order status changed from ${prev.status} to ${u.status}` +
              (u.trackingCode
                ? ` (Courier: ${u.courierName || prev.courier_name}, Tracking: ${u.trackingCode})`
                : '.');
          await db.execute({
            sql: `INSERT INTO order_activities (id, order_id, status_title, note, actor, created_at)
                  VALUES (?, ?, ?, ?, ?, ?)`,
            args: [`act-${Date.now()}`, orderId, statusTitle, noteText, u.actor || 'Admin', now],
          });
        }
        return jsonResponse({ success: true });
      }

      if (segments[1] && method === 'DELETE') {
        const orderId = decodeURIComponent(segments[1]);
        await db.execute({
          sql: `DELETE FROM order_activities WHERE order_id = ?`,
          args: [orderId],
        });
        await db.execute({ sql: `DELETE FROM orders WHERE order_id = ?`, args: [orderId] });
        return jsonResponse({ success: true });
      }
    }

    // 8. TRACK ORDER BY MOBILE NUMBER OR ORDER ID
    if (segments[0] === 'track' && method === 'GET') {
      const rawQuery = (url.searchParams.get('query') || '').trim();
      if (!rawQuery) return jsonResponse({ orders: [] });
      const digitsOnly = rawQuery.replace(/[^0-9]/g, '');
      const ordersRes = await db.execute(`SELECT * FROM orders ORDER BY created_at DESC`);
      const matchedRows = ordersRes.rows.filter((r) => {
        const oid = String(r.order_id).toLowerCase();
        const phone = String(r.phone);
        const phoneDigits = phone.replace(/[^0-9]/g, '');
        if (oid.includes(rawQuery.toLowerCase())) return true;
        if (digitsOnly.length >= 4 && phoneDigits.includes(digitsOnly)) return true;
        return false;
      });

      const results = [];
      for (const o of matchedRows) {
        const oid = String(o.order_id);
        const actsRes = await db.execute({
          sql: `SELECT * FROM order_activities WHERE order_id = ? ORDER BY created_at DESC`,
          args: [oid],
        });
        results.push({
          orderId: oid,
          customerName: String(o.customer_name),
          phone: String(o.phone),
          address: String(o.address),
          deliveryZone: String(o.delivery_zone),
          paymentMethod: String(o.payment_method),
          items: JSON.parse(String(o.items_json || '[]')),
          subtotal: Number(o.subtotal),
          discount: Number(o.discount || 0),
          shipping: Number(o.shipping || 0),
          total: Number(o.total),
          status: String(o.status),
          courierName: String(o.courier_name || 'Steadfast Courier'),
          trackingCode: String(o.tracking_code || ''),
          adminNotes: String(o.admin_notes || ''),
          createdAt: String(o.created_at),
          updatedAt: String(o.updated_at),
          activities: actsRes.rows.map((a) => ({
            id: String(a.id),
            orderId: oid,
            statusTitle: String(a.status_title),
            note: String(a.note),
            actor: String(a.actor),
            createdAt: String(a.created_at),
          })),
        });
      }
      return jsonResponse({ orders: results });
    }

    return jsonResponse({ error: `Unknown API route: /api/${pathname}` }, 404);
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Internal Server Error' }, 500);
  }
};
