import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Menu,
  Search,
  ShoppingCart,
  Home,
  LayoutGrid,
  User,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  ShieldCheck,
  Truck,
  Headphones,
  Award,
  PhoneCall,
  MapPin,
  Mail,
  Trash2,
  Plus,
  Minus,
  LayoutDashboard,
} from 'lucide-react';
import {
  CATEGORIES,
  PRODUCTS,
  Product,
  CategoryItem,
  HeroBanner,
  CouponItem,
  StoreSettings,
  DEFAULT_STORE_SETTINGS,
} from './data/products';
import { BrandLogo, HeroBannerArt, CategoryArt, ProductArt } from './components/ProductArt';
import { ProductCard } from './components/ProductCard';
import { ProductDetailView } from './components/ProductDetailView';
import { CartCheckoutView, CartItem, OrderRecord } from './components/CartCheckoutView';
import { BrowseCategoryView } from './components/BrowseCategoryView';
import { AccountView } from './components/AccountView';
import { AdminPanelView } from './components/AdminPanelView';
import { initDynamicPixel, trackPixelEvent } from './utils/pixelTracker';

type ActivePage = 'home' | 'browse' | 'product-detail' | 'cart' | 'account' | 'admin';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');

  // Dynamic Database State (Loaded from Turso DB via /api/bootstrap)
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<CategoryItem[]>(CATEGORIES);
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [integrationStatus, setIntegrationStatus] = useState({
    tursoConfigured: false,
    tursoDatabaseUrl: 'Local SQLite',
    cloudinaryConfigured: false,
  });

  const [selectedProductId, setSelectedProductId] = useState<string>(
    PRODUCTS[2]?.id || 'prod-moringa-powder'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyOrganicCertified, setOnlyOrganicCertified] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState<boolean>(false);
  const [heroSlide, setHeroSlide] = useState<number>(0);
  const [trackPhoneQuery, setTrackPhoneQuery] = useState<string>('01711223344');

  // Mobile Menu Drawer & Quick Cart Drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const fetchBootstrapData = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (!res.ok) return;
      const data = await res.json();
      if (data.settings) setStoreSettings(data.settings);
      if (data.categories) setCategories(data.categories);
      if (data.products && data.products.length > 0) setProducts(data.products);
      if (data.banners) setBanners(data.banners);
      if (data.coupons) setCoupons(data.coupons);
      if (data.integrationStatus) setIntegrationStatus(data.integrationStatus);
    } catch (e) {
      console.error('Failed to load bootstrap store data:', e);
    }
  }, []);

  useEffect(() => {
    fetchBootstrapData();
  }, [fetchBootstrapData]);

  // Dynamically initialize Meta/Facebook Pixel, TikTok Pixel, and GTM whenever StoreSettings updates
  useEffect(() => {
    initDynamicPixel({
      fbPixelId: storeSettings.fbPixelId || '',
      tiktokPixelId: storeSettings.tiktokPixelId || '',
      gtmId: storeSettings.gtmId || '',
      enablePixelEvents: storeSettings.enablePixelEvents !== false,
      trackPageView: storeSettings.trackPageView !== false,
      trackViewContent: storeSettings.trackViewContent !== false,
      trackAddToCart: storeSettings.trackAddToCart !== false,
      trackInitiateCheckout: storeSettings.trackInitiateCheckout !== false,
      trackPurchase: storeSettings.trackPurchase !== false,
    });
  }, [storeSettings]);

  // Fire PageView & InitiateCheckout when activePage changes
  useEffect(() => {
    if (activePage !== 'admin') {
      trackPixelEvent('PageView', {
        page_path: `/${activePage}`,
        page_title: `${storeSettings.storeNameEn} - ${activePage}`,
      });
    }
    if (activePage === 'cart' && cart.length > 0) {
      trackPixelEvent('InitiateCheckout', {
        content_ids: cart.map((c) => c.product.sku || c.product.id),
        content_type: 'product',
        num_items: cart.reduce((s, i) => s + i.quantity, 0),
        value: cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
        currency: 'BDT',
      });
    }
  }, [activePage, storeSettings.storeNameEn]);

  const selectedProduct =
    products.find((p) => p.id === selectedProductId) || products[0] || PRODUCTS[0];

  const activeBanners = banners.filter((b) => b.isActive);
  const bannerCount = activeBanners.length > 0 ? activeBanners.length : 3;

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleAddToCart = (
    product: Product,
    quantity: number,
    selectedVariants: Record<string, string>,
    unitPrice: number
  ) => {
    const variantKey = Object.entries(selectedVariants)
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    const itemId = `${product.id}__${variantKey}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          quantity,
          selectedVariants,
          unitPrice,
        },
      ];
    });

    trackPixelEvent('AddToCart', {
      content_name: product.name,
      content_ids: [product.sku || product.id],
      content_category: product.categoryLabel,
      content_type: 'product',
      value: unitPrice * quantity,
      currency: 'BDT',
    });
  };

  const handleBuyNow = (
    product: Product,
    quantity: number,
    selectedVariants: Record<string, string>,
    unitPrice: number
  ) => {
    handleAddToCart(product, quantity, selectedVariants, unitPrice);
    setActivePage('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handlePlaceOrderToDb = async (newOrder: OrderRecord) => {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      trackPixelEvent('Purchase', {
        order_id: newOrder.orderId,
        value: newOrder.total,
        currency: 'BDT',
        content_type: 'product',
        content_ids: newOrder.items.map((i) => i.productId || i.id),
        num_items: newOrder.items.reduce((s, i) => s + i.quantity, 0),
      });
      setTrackPhoneQuery(newOrder.phone);
      setCart([]);
    } catch (e) {
      console.error('Order submit error:', e);
    }
  };

  const handleOpenProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setActivePage('product-detail');
    setSearchDropdownOpen(false);
    trackPixelEvent('ViewContent', {
      content_name: product.name,
      content_ids: [product.sku || product.id],
      content_category: product.categoryLabel,
      content_type: 'product',
      value: product.basePrice,
      currency: 'BDT',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateCategory = (categoryId: string, organicOnly = false) => {
    setSelectedCategory(categoryId);
    setOnlyOrganicCertified(organicOnly);
    setActivePage('browse');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchDropdownOpen(false);
    if (searchQuery.trim()) {
      trackPixelEvent('Search', {
        search_string: searchQuery.trim(),
      });
    }
    setActivePage('browse');
  };

  const scrollCategories = (dir: 'left' | 'right') => {
    if (!categoryScrollRef.current) return;
    const offset = dir === 'left' ? -240 : 240;
    categoryScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.bengaliSub?.toLowerCase().includes(q) ||
          p.categoriesList.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [products, searchQuery]);

  // If user is in the WooCommerce Admin Panel, render full-screen AdminPanelView
  if (activePage === 'admin') {
    return (
      <AdminPanelView
        products={products}
        categories={categories}
        banners={banners}
        coupons={coupons}
        storeSettings={storeSettings}
        integrationStatus={integrationStatus}
        onRefreshStoreData={fetchBootstrapData}
        onBackToStore={() => {
          setActivePage('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  const isTeknovaPreview =
    activePage === 'product-detail' && selectedProduct?.id === 'prod-galaxy-tab-s10';

  const topSellingProducts = products.filter((p) => p.isBestSelling);
  const organicCertifiedProducts = products.filter((p) => p.isOrganicCertified);
  const winterSpecialProducts = products.filter(
    (p) => p.id !== 'prod-galaxy-tab-s10' && (!p.isBestSelling || p.category === 'combos')
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#111827] pb-16 md:pb-0">
      {/* Top Bar Announcement (Desktop & Tablet) */}
      <div className="hidden sm:block bg-[#111827] text-gray-200 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <p className="font-bengali truncate">{storeSettings.announcementText}</p>
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setActivePage('account')}
              className="text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              Track Order by Mobile
            </button>
            <button
              type="button"
              onClick={() => setActivePage('admin')}
              className="px-2.5 py-1 rounded bg-[#F58220] hover:bg-[#EA580C] text-white font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header: Adapts to Screenshot 1 dark TEKNOVA bar when viewing Tab S10, or Screenshot 2/3/4 Shiter Bazar white header */}
      {isTeknovaPreview ? (
        <header className="sticky top-0 z-30 bg-[#0B0F17] text-white border-b border-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="p-2 text-white hover:bg-gray-800 rounded-lg cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div
              onClick={() => setActivePage('home')}
              className="flex items-center gap-1.5 cursor-pointer select-none"
            >
              <div className="bg-white text-[#0B0F17] font-extrabold text-sm px-1.5 py-0.5 rounded-xs tracking-tighter flex items-center">
                <span>T</span>
                <span className="text-[#EA580C]">N</span>
              </div>
              <span className="text-lg sm:text-xl font-black tracking-wider text-white">
                TEKN<span className="text-[#EA580C]">OVA</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActivePage('browse')}
                aria-label="Search"
                className="p-2 text-white hover:text-[#EA580C] cursor-pointer"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                aria-label="Shopping Cart"
                className="relative p-2 text-white hover:text-[#EA580C] cursor-pointer"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#EA580C] text-white text-[10px] font-bold flex items-center justify-center px-1 font-mono-num">
                  {totalCartCount}
                </span>
              </button>
            </div>
          </div>
        </header>
      ) : (
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          {/* Primary Header Row */}
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-18 flex items-center justify-between gap-4">
            {/* Left: Hamburger Menu on Mobile / Brand Logo on Desktop */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open category menu"
                className="p-1.5 -ml-1 text-gray-900 hover:bg-gray-100 rounded-lg md:hidden cursor-pointer"
              >
                <Menu className="w-6 h-6 stroke-[2.2]" />
              </button>

              <div
                onClick={() => {
                  setActivePage('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hidden md:block cursor-pointer"
              >
                <BrandLogo
                  size="md"
                  storeNameBn={storeSettings.storeNameBn}
                  storeNameSubBn={storeSettings.storeNameSubBn}
                  logoUrl={storeSettings.logoUrl}
                />
              </div>
            </div>

            {/* Center on Mobile: Brand Logo matching Screenshot 2, 3, 4 */}
            <div
              onClick={() => {
                setActivePage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="md:hidden cursor-pointer"
            >
              <BrandLogo
                size="sm"
                storeNameBn={storeSettings.storeNameBn}
                storeNameSubBn={storeSettings.storeNameSubBn}
                logoUrl={storeSettings.logoUrl}
              />
            </div>

            {/* Center on Desktop: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4 relative">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setSearchDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchDropdownOpen(true);
                  }}
                  placeholder="Search for Products..."
                  className="w-full h-11 pl-4 pr-11 rounded-lg bg-[#F3F4F6] border border-transparent focus:bg-white focus:border-[#F58220] text-sm text-gray-800 placeholder-gray-500 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-[#F58220] cursor-pointer"
                >
                  <Search className="w-5 h-5 stroke-[2.2]" />
                </button>
              </form>

              {searchDropdownOpen && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-12 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden z-40 divide-y divide-gray-100">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleOpenProduct(item)}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-orange-50/50 text-left transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded border border-gray-100 p-1 bg-white shrink-0">
                        <ProductArt
                          artKey={item.artKey}
                          imageUrl={item.imageUrl}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                        <p className="text-[11px] text-[#F58220] font-bold font-mono-num">
                          {item.priceDisplay}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Desktop Nav Links + Admin Button + Cart Icon */}
            <div className="flex items-center gap-3 sm:gap-5">
              <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-gray-700">
                <button
                  type="button"
                  onClick={() => setActivePage('home')}
                  className={`hover:text-[#F58220] transition-colors cursor-pointer whitespace-nowrap ${
                    activePage === 'home' ? 'text-[#F58220]' : ''
                  }`}
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateCategory('all')}
                  className={`hover:text-[#F58220] transition-colors cursor-pointer whitespace-nowrap ${
                    activePage === 'browse' && !onlyOrganicCertified ? 'text-[#F58220]' : ''
                  }`}
                >
                  Categories
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('account')}
                  className={`hover:text-[#F58220] transition-colors cursor-pointer whitespace-nowrap ${
                    activePage === 'account' ? 'text-[#F58220]' : ''
                  }`}
                >
                  Track Order
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('admin')}
                  className="hover:text-[#F58220] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Admin
                </button>
              </nav>

              {/* Mobile Quick Admin Button */}
              <button
                type="button"
                onClick={() => setActivePage('admin')}
                className="sm:hidden px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <LayoutDashboard className="w-3 h-3 text-[#F58220]" />
                <span>Admin</span>
              </button>

              {/* Cart Button matching Screenshot 2, 3, 4 */}
              <button
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                aria-label="Open shopping cart"
                className="relative p-1.5 text-gray-900 hover:text-[#F58220] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 stroke-[2]" />
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] rounded-full bg-[#F59E0B] text-white text-[10px] font-bold flex items-center justify-center px-1 font-mono-num shadow-xs">
                    {totalCartCount}
                  </span>
                </div>
                <span className="hidden xl:inline-block text-xs font-bold text-gray-800 font-mono-num ml-1">
                  {totalCartPrice.toLocaleString()}৳
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar Row matching Screenshot 2 & 4 ("Search for Products...") */}
          <div className="md:hidden px-3 pb-2.5 pt-1 bg-white">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for Products..."
                className="w-full h-10 pl-3.5 pr-10 rounded-md bg-[#F3F4F6] text-[13.5px] text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#F58220]"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-800 cursor-pointer"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </div>
        </header>
      )}

      {/* MAIN PAGE VIEW ROUTER */}
      <main className="flex-1">
        {activePage === 'home' && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-7 sm:space-y-11">
            {/* 1. HERO BANNER SLIDER matching Screenshot 2 */}
            <section className="relative">
              <HeroBannerArt
                slideIndex={heroSlide}
                banner={activeBanners[heroSlide % Math.max(1, activeBanners.length)]}
                onCtaClick={() => handleNavigateCategory('all')}
              />

              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {Array.from({ length: bannerCount }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Slide ${idx + 1}`}
                    onClick={() => setHeroSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      heroSlide === idx
                        ? 'w-6 bg-white shadow-xs'
                        : 'w-2 bg-white/60 hover:bg-white/90'
                    }`}
                  />
                ))}
              </div>
            </section>

            {/* 2. FEATURED CATEGORIES SECTION matching Screenshot 2 */}
            <section>
              <h2 className="text-center text-[19px] sm:text-2xl font-extrabold text-[#111827] mb-4 sm:mb-6">
                {storeSettings.featuredCategoriesTitle}
              </h2>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => scrollCategories('left')}
                  aria-label="Previous categories"
                  className="absolute left-1 sm:-left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#F58220] hover:bg-[#EA580C] text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                </button>

                <div
                  ref={categoryScrollRef}
                  className="grid grid-flow-col auto-cols-[calc(33.333%-6px)] sm:auto-cols-[calc(25%-12px)] lg:auto-cols-[calc(16.666%-14px)] gap-2 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1"
                >
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => handleNavigateCategory(cat.id)}
                      className="bg-white rounded-lg border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-orange-200 transition-all p-2.5 sm:p-4 flex flex-col items-center justify-between cursor-pointer group"
                    >
                      <div className="w-full aspect-[4/3] flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                        <CategoryArt
                          categoryId={cat.artKey || cat.id}
                          imageUrl={cat.imageUrl}
                        />
                      </div>
                      <span className="mt-2 text-[12px] sm:text-[14px] font-bold text-[#111827] text-center leading-tight line-clamp-1">
                        {cat.name}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => scrollCategories('right')}
                  aria-label="Next categories"
                  className="absolute right-1 sm:-right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#F58220] hover:bg-[#EA580C] text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                </button>
              </div>
            </section>

            {/* 3. TOP SELLING PRODUCTS SECTION matching Screenshot 2 & 3 */}
            <section>
              <h2 className="text-center text-[19px] sm:text-2xl font-extrabold text-[#111827] mb-4 sm:mb-6">
                {storeSettings.topSellingTitle}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
                {topSellingProducts.slice(0, 8).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    badgeType="best-selling"
                    onSelectProduct={handleOpenProduct}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </section>

            {/* 4. ORGANIC CERTIFIED SECTION matching Screenshot 3 */}
            <section>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-[19px] sm:text-2xl font-extrabold text-[#111827]">
                  {storeSettings.organicCertifiedTitle}
                </h2>
                <button
                  type="button"
                  onClick={() => handleNavigateCategory('all', true)}
                  className="bg-[#F58220] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-md flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
                {organicCertifiedProducts.slice(0, 8).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    badgeType="discount"
                    onSelectProduct={handleOpenProduct}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </section>

            {/* 5. WINTER SPECIAL HONEY, GHEE & DATES COLLECTION */}
            {winterSpecialProducts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-[19px] sm:text-2xl font-extrabold text-[#111827]">
                      {storeSettings.winterSpecialTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-bengali">
                      {storeSettings.winterSpecialSubtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNavigateCategory('all')}
                    className="bg-[#F58220] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-md flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
                  {winterSpecialProducts.slice(0, 4).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      badgeType="discount"
                      onSelectProduct={handleOpenProduct}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 6. E-COMMERCE TRUST & VALUE GUARANTEES */}
            <section className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900">100% Organic & Pure</h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 font-bengali mt-0.5">
                      সরাসরি খামার ও বাগান থেকে সংগৃহীত কেমিক্যালমুক্ত পণ্য
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#F58220] flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900">Fast Cash on Delivery</h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 font-bengali mt-0.5">
                      পণ্য হাতে পেয়ে দেখে টাকা পরিশোধের সুবিধা
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900">BSTI & Lab Tested</h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 font-bengali mt-0.5">
                      প্রতিটি ব্যাচ মান নিয়ন্ত্রিত ও ল্যাব পরীক্ষিত
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900">Dedicated Support</h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 font-bengali mt-0.5">
                      সকাল ৯টা থেকে রাত ১১টা পর্যন্ত সরাসরি কাস্টমার কেয়ার
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activePage === 'browse' && (
          <BrowseCategoryView
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onlyOrganicCertified={onlyOrganicCertified}
            onSelectCategory={setSelectedCategory}
            onSearchChange={setSearchQuery}
            onToggleOrganicCertified={setOnlyOrganicCertified}
            onSelectProduct={handleOpenProduct}
            onAddToCart={handleAddToCart}
          />
        )}

        {activePage === 'product-detail' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            relatedProducts={products.filter((p) => p.id !== selectedProduct.id)}
            onBackHome={() => setActivePage('home')}
            onSelectCategory={(catId) => handleNavigateCategory(catId)}
            onSelectProduct={handleOpenProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        )}

        {activePage === 'cart' && (
          <CartCheckoutView
            cart={cart}
            coupons={coupons}
            storeSettings={storeSettings}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={() => setCart([])}
            onPlaceOrder={handlePlaceOrderToDb}
            onContinueShopping={() => setActivePage('home')}
            onSelectProduct={handleOpenProduct}
            onGoToTrackOrder={(phone) => {
              setTrackPhoneQuery(phone);
              setActivePage('account');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'account' && (
          <AccountView
            initialPhoneQuery={trackPhoneQuery}
            storeSettings={storeSettings}
            onBrowseProducts={() => handleNavigateCategory('all')}
            onOpenAdminPanel={() => setActivePage('admin')}
          />
        )}
      </main>

      {/* COMPLETE E-COMMERCE FOOTER */}
      <footer className="bg-[#111827] text-gray-300 mt-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="inline-block bg-white px-3 py-1.5 rounded-lg mb-3">
                <BrandLogo
                  size="sm"
                  storeNameBn={storeSettings.storeNameBn}
                  storeNameSubBn={storeSettings.storeNameSubBn}
                  logoUrl={storeSettings.logoUrl}
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-bengali leading-relaxed">
                {storeSettings.footerAbout}
              </p>
              <div className="mt-4 space-y-1.5 text-xs text-gray-400">
                <p className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-[#F58220]" /> Hotline:{' '}
                  {storeSettings.hotline}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#F58220]" /> {storeSettings.email}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#F58220]" /> {storeSettings.address}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                Featured Categories
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => handleNavigateCategory(cat.id)}
                      className="hover:text-[#F58220] transition-colors cursor-pointer"
                    >
                      {cat.name} ({cat.bengaliName})
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                Quick Navigation
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>
                  <button
                    type="button"
                    onClick={() => setActivePage('admin')}
                    className="text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    WooCommerce Admin Panel
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActivePage('account')}
                    className="hover:text-[#F58220] transition-colors cursor-pointer"
                  >
                    Track Order by Mobile Number
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActivePage('cart')}
                    className="hover:text-[#F58220] transition-colors cursor-pointer"
                  >
                    Shopping Cart & COD Checkout
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      const tab = products.find((p) => p.id === 'prod-galaxy-tab-s10');
                      if (tab) handleOpenProduct(tab);
                    }}
                    className="hover:text-[#F58220] transition-colors cursor-pointer"
                  >
                    Samsung Galaxy Tab S10 WiFi (Spec View)
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                Delivery & Payment
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">
                Nationwide Cash on Delivery via Steadfast, Pathao & RedX Courier. Inspect your organic products upon arrival before payment.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                <span className="px-2.5 py-1 rounded bg-gray-800 text-emerald-400 border border-gray-700">
                  CASH ON DELIVERY
                </span>
                <span className="px-2.5 py-1 rounded bg-gray-800 text-pink-400 border border-gray-700">
                  bKash
                </span>
                <span className="px-2.5 py-1 rounded bg-gray-800 text-amber-400 border border-gray-700">
                  Nagad
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
            <p>
              © {new Date().getFullYear()} {storeSettings.storeNameBn}{' '}
              {storeSettings.storeNameSubBn} ({storeSettings.storeNameEn}). All rights reserved.
            </p>
            <p>Dynamic Turso Database & Cloudinary Powered E-Commerce</p>
          </div>
        </div>
      </footer>

      {/* FIXED MOBILE BOTTOM NAVIGATION BAR matching Screenshots 1, 2, 3, 4 */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 h-15 grid grid-cols-4 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
      >
        <button
          type="button"
          onClick={() => {
            setActivePage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`relative flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            activePage === 'home' ? 'text-[#5B21B6]' : 'text-gray-600'
          }`}
        >
          {activePage === 'home' && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-[#6D28D9] rounded-b-full" />
          )}
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-semibold">Home</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActivePage('browse');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`relative flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            activePage === 'browse' || activePage === 'product-detail'
              ? 'text-[#5B21B6]'
              : 'text-gray-600'
          }`}
        >
          {(activePage === 'browse' || activePage === 'product-detail') && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-[#6D28D9] rounded-b-full" />
          )}
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[11px] font-semibold">Browse</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActivePage('cart');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`relative flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            activePage === 'cart' ? 'text-[#5B21B6]' : 'text-gray-600'
          }`}
        >
          {activePage === 'cart' && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-[#6D28D9] rounded-b-full" />
          )}
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] rounded-full bg-[#F58220] text-white text-[9px] font-bold flex items-center justify-center px-1 font-mono-num">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold">Cart</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActivePage('account');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`relative flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            activePage === 'account' ? 'text-[#5B21B6]' : 'text-gray-600'
          }`}
        >
          {activePage === 'account' && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-[#6D28D9] rounded-b-full" />
          )}
          <User className="w-5 h-5" />
          <span className="text-[11px] font-semibold">Account</span>
        </button>
      </nav>

      {/* SLIDE-OVER MOBILE NAVIGATION MENU DRAWER */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 flex"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-72 max-w-[82vw] bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto"
          >
            <div>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <BrandLogo
                  size="sm"
                  storeNameBn={storeSettings.storeNameBn}
                  storeNameSubBn={storeSettings.storeNameSubBn}
                  logoUrl={storeSettings.logoUrl}
                />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActivePage('admin');
                  }}
                  className="w-full mb-3 px-3.5 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-[#F58220]" />
                    <span>WooCommerce Admin Panel</span>
                  </span>
                  <span>→</span>
                </button>

                <p className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Shop by Category
                </p>
                <div className="space-y-1 mt-1">
                  <button
                    type="button"
                    onClick={() => handleNavigateCategory('all')}
                    className="w-full px-3 py-2.5 rounded-lg text-left text-sm font-semibold text-gray-800 hover:bg-orange-50 hover:text-[#F58220] flex items-center justify-between cursor-pointer"
                  >
                    <span>All Products</span>
                    <span className="text-xs text-gray-400 font-mono-num">{products.length}</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleNavigateCategory(cat.id)}
                      className="w-full px-3 py-2.5 rounded-lg text-left text-sm font-semibold text-gray-800 hover:bg-orange-50 hover:text-[#F58220] flex items-center justify-between cursor-pointer"
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-gray-500 font-bengali">{cat.bengaliName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-600">
              <p className="font-bold text-gray-900">Need Help Ordering?</p>
              <p className="mt-0.5">Call Hotline: {storeSettings.hotline}</p>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER QUICK CART DRAWER */}
      {cartDrawerOpen && (
        <div
          onClick={() => setCartDrawerOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 flex justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-96 max-w-[90vw] bg-white h-full shadow-2xl flex flex-col justify-between"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#F58220]" />
                <h2 className="text-base font-bold text-gray-900">
                  Shopping Cart ({totalCartCount})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCartDrawerOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-200 mb-3" />
                  <p className="text-sm font-bold text-gray-700">Your cart is empty</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Add your favorite organic products to get started.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg border border-gray-100 p-1 bg-gray-50 shrink-0">
                      <ProductArt
                        artKey={item.product.artKey}
                        imageUrl={item.product.imageUrl}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs font-bold text-[#F58220] font-mono-num mt-0.5">
                        {item.unitPrice.toLocaleString()}৳ × {item.quantity}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQuantity(item.id, -1)}
                          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold font-mono-num">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQuantity(item.id, 1)}
                          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCartItem(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
                <div className="flex items-center justify-between text-sm font-bold text-gray-900">
                  <span>Subtotal</span>
                  <span className="text-base text-[#F58220] font-mono-num">
                    {totalCartPrice.toLocaleString()}৳
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCartDrawerOpen(false);
                    setActivePage('cart');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-3 bg-[#D61F1F] hover:bg-[#B91C1C] text-white font-bold text-xs rounded-lg uppercase tracking-wider shadow-xs cursor-pointer"
                >
                  Proceed to Checkout ({totalCartPrice.toLocaleString()}৳)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
