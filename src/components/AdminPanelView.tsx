import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderTree,
  Image as ImageIcon,
  TicketPercent,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Eye,
  X,
  Upload,
  Check,
  Search,
  RefreshCw,
  ArrowLeft,
  Clock,
  Truck,
  Phone,
  MapPin,
  Database,
  Cloud,
  Sparkles,
  Activity,
} from 'lucide-react';
import {
  Product,
  CategoryItem,
  HeroBanner,
  CouponItem,
  StoreSettings,
  ProductVariantGroup,
  ProductSpec,
} from '../data/products';
import { OrderRecord } from './CartCheckoutView';
import { ProductArt, CategoryArt } from './ProductArt';
import { compressImageUnder50KB } from '../utils/imageOptimizer';
import {
  trackPixelEvent,
  getPixelEventsLog,
  clearPixelEventsLog,
  PixelEventLog,
} from '../utils/pixelTracker';

type AdminSection =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'categories'
  | 'banners'
  | 'coupons'
  | 'pixel'
  | 'settings';

interface AdminPanelViewProps {
  products: Product[];
  categories: CategoryItem[];
  banners: HeroBanner[];
  coupons: CouponItem[];
  storeSettings: StoreSettings;
  integrationStatus: {
    tursoConfigured: boolean;
    tursoDatabaseUrl: string;
    cloudinaryConfigured: boolean;
  };
  onRefreshStoreData: () => Promise<void>;
  onBackToStore: () => void;
}

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const ART_PRESETS = [
  { key: 'moringa-powder', label: 'Moringa Green Pouch' },
  { key: 'mashkalai-dal', label: 'Mashkalai Dal Packet' },
  { key: 'mustard-oil', label: 'Mustard Oil Bottle' },
  { key: 'mustard-honey', label: 'Honey Bottle + Box' },
  { key: 'gawa-ghee', label: 'Gawa Ghee Jar' },
  { key: 'ajwa-dates', label: 'Ajwa Dates Box' },
  { key: 'chia-seeds', label: 'Chia Seeds Pouch' },
  { key: 'winter-combo', label: '4-in-1 Winter Combo' },
  { key: 'galaxy-tab-s10', label: 'Galaxy Tab S10' },
];

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  products,
  categories,
  banners,
  coupons,
  storeSettings,
  integrationStatus,
  onRefreshStoreData,
  onBackToStore,
}) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  // Orders Filter & Popup State
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [selectedOrderModal, setSelectedOrderModal] = useState<OrderRecord | null>(null);
  const [newActivityTitle, setNewActivityTitle] = useState<string>('');
  const [newActivityNote, setNewActivityNote] = useState<string>('');
  const [manualOrderModalOpen, setManualOrderModalOpen] = useState<boolean>(false);
  const [manualOrderForm, setManualOrderForm] = useState({
    customerName: '',
    phone: '',
    address: '',
    deliveryZone: 'inside-dhaka' as 'inside-dhaka' | 'outside-dhaka',
    paymentMethod: 'cod' as 'cod' | 'bkash' | 'nagad',
    productId: products[0]?.id || '',
    quantity: 1,
    status: 'Confirmed',
  });

  // Product Add/Edit Modal State
  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Banner Modal State
  const [bannerModalOpen, setBannerModalOpen] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  // Coupon Form State
  const [newCoupon, setNewCoupon] = useState<CouponItem>({
    code: '',
    discountType: 'percent',
    discountValue: 10,
    minOrderAmount: 500,
    isActive: true,
  });

  // Store Settings & Pixel Setup Form State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(storeSettings);
  const [pixelLogs, setPixelLogs] = useState<PixelEventLog[]>(() => getPixelEventsLog());
  const [lastUploadStats, setLastUploadStats] = useState<{
    originalKB: number;
    compressedKB: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    setSettingsForm(storeSettings);
  }, [storeSettings]);

  useEffect(() => {
    const refreshLogs = () => setPixelLogs(getPixelEventsLog());
    window.addEventListener('pixel-event-fired', refreshLogs);
    return () => window.removeEventListener('pixel-event-fired', refreshLogs);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data.orders || []);
      if (selectedOrderModal) {
        const updated = (data.orders || []).find(
          (o: OrderRecord) => o.orderId === selectedOrderModal.orderId
        );
        if (updated) setSelectedOrderModal(updated);
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Helper to compress any uploaded image to < 50KB (WebP high-sharpness) and upload to Cloudinary via /api/upload
  const handleFileUpload = async (file: File, folder = 'shiter_bazar'): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const optimized = await compressImageUnder50KB(file, 48);
      setLastUploadStats({
        originalKB: optimized.originalSizeKB,
        compressedKB: optimized.sizeKB,
        width: optimized.width,
        height: optimized.height,
      });

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: optimized.dataUrl, folder }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      showToast(
        `Optimized (${optimized.originalSizeKB}KB → ${optimized.sizeKB}KB < 50KB) & uploaded${
          data.provider === 'cloudinary' ? ' to Cloudinary!' : '!'
        }`
      );
      return data.url;
    } catch (e: any) {
      showToast(`Upload error: ${e.message}`);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // --- ORDER HANDLERS ---
  const handleUpdateOrderDetails = async (order: OrderRecord, activityNote?: string) => {
    try {
      const res = await fetch(`/api/orders/${order.orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...order,
          activityNote,
        }),
      });
      if (res.ok) {
        showToast(`Order #${order.orderId} updated!`);
        await fetchOrders();
      }
    } catch (e: any) {
      showToast(e.message);
    }
  };

  const handleAddOrderActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderModal || (!newActivityTitle.trim() && !newActivityNote.trim())) return;
    try {
      const res = await fetch(`/api/orders/${selectedOrderModal.orderId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statusTitle: newActivityTitle.trim() || `Order ${selectedOrderModal.status}`,
          note: newActivityNote.trim(),
          actor: 'Admin',
        }),
      });
      if (res.ok) {
        setNewActivityTitle('');
        setNewActivityNote('');
        showToast('Tracking activity added to order timeline!');
        await fetchOrders();
      }
    } catch (e: any) {
      showToast(e.message);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedOrderModal?.orderId === orderId) {
          setSelectedOrderModal(null);
        }
        showToast(`Order #${orderId} deleted.`);
        await fetchOrders();
      }
    } catch (e: any) {
      showToast(e.message);
    }
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const chosenProd = products.find((p) => p.id === manualOrderForm.productId) || products[0];
    if (!chosenProd || !manualOrderForm.customerName.trim() || !manualOrderForm.phone.trim()) return;

    const sub = chosenProd.basePrice * manualOrderForm.quantity;
    const ship =
      sub >= storeSettings.freeShippingThreshold
        ? 0
        : manualOrderForm.deliveryZone === 'inside-dhaka'
        ? storeSettings.insideDhakaShipping
        : storeSettings.outsideDhakaShipping;

    const payload = {
      customerName: manualOrderForm.customerName.trim(),
      phone: manualOrderForm.phone.trim(),
      address: manualOrderForm.address.trim() || 'Dhaka, Bangladesh',
      deliveryZone: manualOrderForm.deliveryZone,
      paymentMethod: manualOrderForm.paymentMethod,
      status: manualOrderForm.status,
      subtotal: sub,
      discount: 0,
      shipping: ship,
      total: sub + ship,
      createdByAdmin: true,
      items: [
        {
          id: `${chosenProd.id}__manual`,
          productId: chosenProd.id,
          name: chosenProd.name,
          artKey: chosenProd.artKey,
          imageUrl: chosenProd.imageUrl || '',
          quantity: manualOrderForm.quantity,
          selectedVariants: {},
          unitPrice: chosenProd.basePrice,
        },
      ],
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setManualOrderModalOpen(false);
      setManualOrderForm({
        customerName: '',
        phone: '',
        address: '',
        deliveryZone: 'inside-dhaka',
        paymentMethod: 'cod',
        productId: products[0]?.id || '',
        quantity: 1,
        status: 'Confirmed',
      });
      showToast('Manual order created in Turso DB!');
      await fetchOrders();
    }
  };

  // --- PRODUCT HANDLERS ---
  const openNewProductModal = () => {
    const defaultCat = categories[0] || { id: 'combos', name: 'Combos' };
    setEditingProduct({
      id: '',
      name: '',
      bengaliSub: '',
      slug: '',
      artKey: 'moringa-powder',
      imageUrl: '',
      galleryUrls: [],
      category: defaultCat.id,
      categoryLabel: defaultCat.name,
      categoriesList: `${defaultCat.name}, Organic Certified`,
      sku: `SBO-${Math.floor(100 + Math.random() * 900)}`,
      priceDisplay: '500৳',
      oldPriceDisplay: '600৳',
      basePrice: 500,
      originalPrice: 600,
      discountPercent: 16,
      isBestSelling: true,
      isOrganicCertified: true,
      inStock: true,
      shortBullets: [
        '100% Pure & Organic Certified product',
        'Directly sourced from farmers and lab-tested',
      ],
      variantGroups: [
        {
          name: 'Weight',
          options: [
            { label: '500g Pack', price: 500, originalPrice: 600 },
            { label: '1 Kg Value Pack', price: 950, originalPrice: 1150 },
          ],
        },
      ],
      specifications: [
        { label: 'Brand', value: storeSettings.storeNameEn },
        { label: 'Product Type', value: 'Organic Food' },
        { label: 'Shelf Life', value: '12 Months' },
      ],
      description: 'Premium quality 100% chemical-free organic product.',
      warrantyInfo: '7-Day Easy Replacement Guarantee.',
      rating: 5.0,
      reviewsCount: 12,
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name.trim()) return;

    const isUpdate = Boolean(editingProduct.id);
    const url = isUpdate ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = isUpdate ? 'PUT' : 'POST';

    const matchedCat = categories.find((c) => c.id === editingProduct.category);
    const payload: Product = {
      ...editingProduct,
      categoryLabel: matchedCat ? matchedCat.name : editingProduct.categoryLabel,
      priceDisplay: editingProduct.priceDisplay || `${editingProduct.basePrice}৳`,
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setProductModalOpen(false);
      setEditingProduct(null);
      showToast(isUpdate ? 'Product updated in Turso DB!' : 'New product added to Turso DB!');
      await onRefreshStoreData();
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Product deleted from database.');
      await onRefreshStoreData();
    }
  };

  // --- CATEGORY HANDLERS ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;
    const isExisting = categories.some((c) => c.id === editingCategory.id);
    const url = isExisting ? `/api/categories/${editingCategory.id}` : '/api/categories';
    const method = isExisting ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingCategory),
    });
    if (res.ok) {
      setCategoryModalOpen(false);
      setEditingCategory(null);
      showToast('Category saved!');
      await onRefreshStoreData();
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    const res = await fetch(`/api/categories/${catId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Category deleted.');
      await onRefreshStoreData();
    }
  };

  // --- BANNER HANDLERS ---
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    const isExisting = banners.some((b) => b.id === editingBanner.id);
    const url = isExisting ? `/api/banners/${editingBanner.id}` : '/api/banners';
    const method = isExisting ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingBanner),
    });
    if (res.ok) {
      setBannerModalOpen(false);
      setEditingBanner(null);
      showToast('Hero Banner saved!');
      await onRefreshStoreData();
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    const res = await fetch(`/api/banners/${bannerId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Banner deleted.');
      await onRefreshStoreData();
    }
  };

  // --- COUPON HANDLERS ---
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return;
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCoupon),
    });
    if (res.ok) {
      setNewCoupon({
        code: '',
        discountType: 'percent',
        discountValue: 10,
        minOrderAmount: 500,
        isActive: true,
      });
      showToast('Coupon saved!');
      await onRefreshStoreData();
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    const res = await fetch(`/api/coupons/${code}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Coupon deleted.');
      await onRefreshStoreData();
    }
  };

  // --- SETTINGS HANDLER ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsForm),
    });
    if (res.ok) {
      showToast('Store settings saved to Turso DB!');
      await onRefreshStoreData();
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'All' && o.status !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q)
    );
  });

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col md:flex-row text-[#0F172A]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-xl border border-gray-700 flex items-center gap-2 text-xs sm:text-sm font-semibold">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* LEFT SIDEBAR NAVIGATION (WooCommerce Style) */}
      <aside className="w-full md:w-64 bg-[#1E293B] text-white shrink-0 flex flex-col justify-between md:min-h-screen md:sticky md:top-0">
        <div>
          {/* Top Brand Header */}
          <div className="p-4 sm:p-5 border-b border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#F58220] text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                W
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-wide text-white leading-none">
                  SHITER BAZAR
                </h1>
                <span className="text-[11px] text-amber-400 font-semibold">
                  WooCommerce Admin
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onBackToStore}
              className="md:hidden px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-md text-amber-400 cursor-pointer"
            >
              ← Store
            </button>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="p-2.5 flex md:flex-col gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              {
                id: 'orders',
                label: 'Orders',
                icon: ShoppingBag,
                badge: orders.length,
              },
              {
                id: 'products',
                label: 'Products',
                icon: Package,
                badge: products.length,
              },
              {
                id: 'categories',
                label: 'Categories',
                icon: FolderTree,
                badge: categories.length,
              },
              {
                id: 'banners',
                label: 'Hero Banners',
                icon: ImageIcon,
                badge: banners.length,
              },
              {
                id: 'coupons',
                label: 'Coupons',
                icon: TicketPercent,
                badge: coupons.length,
              },
              {
                id: 'pixel',
                label: 'Pixel & Tracking',
                icon: Activity,
                badge: settingsForm.fbPixelId || settingsForm.tiktokPixelId || settingsForm.gtmId ? 'ON' : undefined,
              },
              { id: 'settings', label: 'Store Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id as AdminSection)}
                  className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#F58220] text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] font-mono-num px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Store Link & DB Status */}
        <div className="hidden md:block p-4 border-t border-slate-700/80 space-y-3">
          <div className="bg-slate-800/90 rounded-lg p-3 text-[11px] space-y-1.5 border border-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <Database className="w-3.5 h-3.5" />
              <span>
                {integrationStatus.tursoConfigured ? 'Turso Cloud Connected' : 'Turso LibSQL Ready'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-sky-400">
              <Cloud className="w-3.5 h-3.5" />
              <span>
                {integrationStatus.cloudinaryConfigured
                  ? 'Cloudinary Active'
                  : 'Image Upload Active'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToStore}
            className="w-full py-2.5 px-4 rounded-lg bg-white text-slate-900 hover:bg-amber-50 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View Live Storefront</span>
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN WORKSPACE */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Bar inside Workspace */}
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 capitalize">
              {activeSection === 'dashboard'
                ? 'Store Overview & Analytics'
                : activeSection === 'orders'
                ? 'Order Management & Activity Tracking'
                : activeSection === 'products'
                ? 'Products Catalog Management'
                : activeSection === 'categories'
                ? 'Categories Management'
                : activeSection === 'banners'
                ? 'Homepage Hero Banners'
                : activeSection === 'coupons'
                ? 'Promo Codes & Coupons'
                : activeSection === 'pixel'
                ? 'Meta / TikTok Pixel & Event Tracking Setup'
                : 'Dynamic Store Settings'}
            </h2>
            <p className="text-xs text-slate-500">
              All changes sync directly with the database and update the live storefront immediately.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={async () => {
                await Promise.all([onRefreshStoreData(), fetchOrders()]);
                showToast('Synced latest data from database!');
              }}
              className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync DB</span>
            </button>
            <button
              type="button"
              onClick={() => {
                openNewProductModal();
                setActiveSection('products');
              }}
              className="px-3.5 py-2 rounded-lg bg-[#F58220] hover:bg-[#EA580C] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* 1. DASHBOARD SECTION */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-bold text-slate-500 uppercase">Total Revenue</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#F58220] font-mono-num mt-1">
                  {totalRevenue.toLocaleString()}৳
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Across {orders.filter((o) => o.status !== 'Cancelled').length} active orders
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-bold text-slate-500 uppercase">Total Orders</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono-num mt-1">
                  {orders.length}
                </p>
                <p className="text-[11px] text-amber-600 font-semibold mt-1">
                  {orders.filter((o) => o.status === 'Pending').length} Pending confirmation
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-bold text-slate-500 uppercase">Live Products</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono-num mt-1">
                  {products.length}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  In {categories.length} dynamic categories
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-bold text-slate-500 uppercase">Active Coupons</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 font-mono-num mt-1">
                  {coupons.filter((c) => c.isActive).length}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Free delivery ≥ {storeSettings.freeShippingThreshold}৳
                </p>
              </div>
            </div>

            {/* Recent Orders Quick Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Recent Customer Orders (Click "Details" to Manage & Add Tracking Activity)
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSection('orders')}
                  className="text-xs font-bold text-[#F58220] hover:underline cursor-pointer"
                >
                  View All Orders →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[11px]">
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer & Mobile</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.orderId} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono-num font-bold text-slate-900">
                          #{o.orderId}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{o.customerName}</div>
                          <div className="text-xs text-slate-500 font-mono-num">{o.phone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono-num font-bold text-[#F58220]">
                          {o.total.toLocaleString()}৳
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderModal(o)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. ORDERS MANAGEMENT SECTION */}
        {activeSection === 'orders' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                {['All', ...ORDER_STATUSES].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      orderStatusFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search Order ID, Phone, Name..."
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#F58220]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setManualOrderModalOpen(true)}
                  className="px-3.5 py-2 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Order</span>
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {loadingOrders ? (
                <div className="p-8 text-center text-sm text-slate-500">Loading orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-10 text-center text-sm text-slate-500">
                  No orders match the current filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[11px]">
                        <th className="py-3.5 px-4">Order ID</th>
                        <th className="py-3.5 px-4">Customer & Phone</th>
                        <th className="py-3.5 px-4">Items</th>
                        <th className="py-3.5 px-4">Quick Status</th>
                        <th className="py-3.5 px-4">Courier / Tracking</th>
                        <th className="py-3.5 px-4">Total</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((order) => (
                        <tr key={order.orderId} className="hover:bg-slate-50/70">
                          <td className="py-3.5 px-4 font-mono-num font-bold text-slate-900">
                            #{order.orderId}
                            <div className="text-[11px] text-slate-400 font-normal">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString('en-GB')
                                : ''}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{order.customerName}</div>
                            <div className="text-xs text-[#F58220] font-mono-num font-semibold">
                              {order.phone}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                              {order.address}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-700">
                              {order.items.length} item(s)
                            </span>
                            <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                              {order.items.map((i) => i.name || i.product?.name).join(', ')}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleUpdateOrderDetails(
                                  { ...order, status: e.target.value },
                                  `Order status changed to "${e.target.value}" by Admin.`
                                )
                              }
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-800 focus:outline-none focus:border-[#F58220] cursor-pointer"
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-xs font-semibold text-slate-800">
                              {order.courierName || 'Steadfast Courier'}
                            </div>
                            <div className="text-[11px] font-mono-num text-emerald-600">
                              {order.trackingCode || 'No tracking code'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono-num font-extrabold text-[#F58220]">
                            {order.total.toLocaleString()}৳
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedOrderModal(order)}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Popup Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order.orderId)}
                              aria-label="Delete order"
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 inline-flex items-center justify-center cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. PRODUCTS MANAGEMENT SECTION */}
        {activeSection === 'products' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by Name, SKU, or Category..."
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#F58220]"
                />
              </div>
              <button
                type="button"
                onClick={openNewProductModal}
                className="px-4 py-2.5 bg-[#F58220] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[11px]">
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">SKU</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Badges & Stock</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg border border-slate-200 p-1 bg-white shrink-0">
                              <ProductArt
                                artKey={p.artKey}
                                imageUrl={p.imageUrl}
                                className="w-full h-full"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate max-w-[220px]">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-slate-500 font-bengali truncate max-w-[220px]">
                                {p.bengaliSub}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono-num text-xs font-semibold text-slate-600">
                          {p.sku}
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                          {p.categoryLabel}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono-num font-bold text-[#F58220]">
                            {p.priceDisplay}
                          </div>
                          {p.oldPriceDisplay && (
                            <div className="text-[11px] text-slate-400 line-through font-mono-num">
                              {p.oldPriceDisplay}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 space-x-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.inStock
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {p.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                          {p.isBestSelling && (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600">
                              Best Selling
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(JSON.parse(JSON.stringify(p)));
                              setProductModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 inline-flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. CATEGORIES MANAGEMENT SECTION */}
        {activeSection === 'categories' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditingCategory({
                    id: '',
                    name: '',
                    bengaliName: '',
                    imageUrl: '',
                    artKey: 'combos',
                    sortOrder: categories.length,
                    itemCount: 0,
                  });
                  setCategoryModalOpen(true);
                }}
                className="px-4 py-2.5 bg-[#F58220] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-bold rounded-lg flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-14 rounded-lg border border-slate-100 p-1 bg-slate-50 shrink-0">
                      <CategoryArt
                        categoryId={cat.artKey || cat.id}
                        imageUrl={cat.imageUrl}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                      <p className="text-xs text-slate-500 font-bengali">{cat.bengaliName}</p>
                      <span className="text-[11px] text-[#F58220] font-semibold">
                        {cat.itemCount} products
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory({ ...cat });
                        setCategoryModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. HERO BANNERS MANAGEMENT SECTION */}
        {activeSection === 'banners' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditingBanner({
                    id: '',
                    title: 'প্রিমিয়াম অর্গানিক অফার',
                    subtitle: 'শুদ্ধতার সাথে স্বাস্থ্যের মেলবন্ধন',
                    badgeText: 'স্পেশাল ডিসকাউন্ট',
                    ctaText: 'এখনই কিনুন',
                    imageUrl: '',
                    slideIndex: 0,
                    bgGradient:
                      'radial-gradient(circle at 50% 42%, #FAF0D7 0%, #EAD09E 52%, #D7B06E 100%)',
                    isActive: true,
                    sortOrder: banners.length,
                  });
                  setBannerModalOpen(true);
                }}
                className="px-4 py-2.5 bg-[#F58220] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-bold rounded-lg flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hero Slide</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {banners.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-xs font-bold font-bengali">
                        {b.badgeText}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          b.isActive ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        {b.isActive ? '● Active' : '○ Hidden'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 font-bengali">{b.title}</h3>
                    <p className="text-xs text-slate-500 font-bengali">{b.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBanner({ ...b });
                        setBannerModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Banner</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(b.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. COUPONS SECTION */}
        {activeSection === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form
              onSubmit={handleSaveCoupon}
              className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4"
            >
              <h3 className="text-base font-bold text-slate-900">Create / Update Coupon</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. WINTER20"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        discountType: e.target.value as 'percent' | 'fixed',
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Value</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.discountValue}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Minimum Order Amount (৳)
                </label>
                <input
                  type="number"
                  value={newCoupon.minOrderAmount}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#F58220] hover:bg-[#EA580C] text-white font-bold text-xs rounded-lg uppercase cursor-pointer"
              >
                Save Coupon
              </button>
            </form>

            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[11px]">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Min Spend</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map((c) => (
                    <tr key={c.code}>
                      <td className="py-3 px-4 font-mono-num font-bold text-[#F58220]">
                        {c.code}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        {c.discountType === 'percent'
                          ? `${c.discountValue}% OFF`
                          : `${c.discountValue}৳ OFF`}
                      </td>
                      <td className="py-3 px-4 font-mono-num">{c.minOrderAmount}৳</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c.code)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. DYNAMIC STORE SETTINGS SECTION */}
        {activeSection === 'settings' && (
          <form
            onSubmit={handleSaveSettings}
            className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brand First Line (Bengali)
                </label>
                <input
                  type="text"
                  value={settingsForm.storeNameBn}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, storeNameBn: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bengali"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brand Second Line (Orange)
                </label>
                <input
                  type="text"
                  value={settingsForm.storeNameSubBn}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, storeNameSubBn: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bengali"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  English Brand Name
                </label>
                <input
                  type="text"
                  value={settingsForm.storeNameEn}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, storeNameEn: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Custom Logo Upload via Cloudinary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Custom Store Logo (Optional — Uploads to Cloudinary)
                </label>
                <p className="text-xs text-slate-500">
                  Leave empty to use the signature speeding orange shopping cart icon.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Logo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await handleFileUpload(file, 'store_logo');
                      if (url) setSettingsForm({ ...settingsForm, logoUrl: url });
                    }}
                  />
                </label>
                {settingsForm.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setSettingsForm({ ...settingsForm, logoUrl: '' })}
                    className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Reset Default Icon
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Top Announcement Bar Text
              </label>
              <input
                type="text"
                value={settingsForm.announcementText}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, announcementText: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bengali"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Inside Dhaka Delivery (৳)
                </label>
                <input
                  type="number"
                  value={settingsForm.insideDhakaShipping}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      insideDhakaShipping: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Outside Dhaka Delivery (৳)
                </label>
                <input
                  type="number"
                  value={settingsForm.outsideDhakaShipping}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      outsideDhakaShipping: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Free Shipping Threshold (৳)
                </label>
                <input
                  type="number"
                  value={settingsForm.freeShippingThreshold}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      freeShippingThreshold: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hotline Number
                </label>
                <input
                  type="text"
                  value={settingsForm.hotline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hotline: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  value={settingsForm.whatsapp}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Address</label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Section 1 Title (Featured Categories)
                </label>
                <input
                  type="text"
                  value={settingsForm.featuredCategoriesTitle}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      featuredCategoriesTitle: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Section 2 Title (Top Selling Products)
                </label>
                <input
                  type="text"
                  value={settingsForm.topSellingTitle}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, topSellingTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Section 3 Title (Organic Certified)
                </label>
                <input
                  type="text"
                  value={settingsForm.organicCertifiedTitle}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, organicCertifiedTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Section 4 Title (Winter Specials)
                </label>
                <input
                  type="text"
                  value={settingsForm.winterSpecialTitle}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, winterSpecialTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-[#F58220] hover:bg-[#EA580C] text-white font-bold text-sm rounded-lg shadow-xs cursor-pointer"
            >
              Save All Store Settings
            </button>
          </form>
        )}

        {/* 8. PIXEL & CONVERSION TRACKING SETUP SECTION */}
        {activeSection === 'pixel' && (
          <div className="space-y-6">
            <form
              onSubmit={handleSaveSettings}
              className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#F58220]" />
                    <span>Dynamic Pixel Setup (Meta / Facebook Pixel, TikTok Pixel & GTM)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-bengali">
                    আপনার Pixel ID নিচে বসিয়ে Save করলেই সাথে সাথে স্টোরে অটোমেটিক ইভেন্ট ফায়ার শুরু হবে (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase)।
                  </p>
                </div>
                <label className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settingsForm.enablePixelEvents !== false}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        enablePixelEvents: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span className="text-xs font-extrabold text-emerald-900">
                    Enable Live Pixel Event Firing
                  </span>
                </label>
              </div>

              {/* Pixel IDs Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-slate-800">
                      Facebook / Meta Pixel ID
                    </label>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        settingsForm.fbPixelId?.trim()
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {settingsForm.fbPixelId?.trim() ? 'Active' : 'Not Set'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={settingsForm.fbPixelId || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, fbPixelId: e.target.value })
                    }
                    placeholder="e.g. 123456789012345"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-mono-num font-bold text-slate-900 focus:outline-none focus:border-[#F58220]"
                  />
                  <p className="text-[11px] text-slate-500">
                    Fires standard <code className="font-mono">fbq('track', ...)</code> events with BDT currency & product SKUs.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-slate-800">
                      TikTok Pixel ID (Optional)
                    </label>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        settingsForm.tiktokPixelId?.trim()
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {settingsForm.tiktokPixelId?.trim() ? 'Active' : 'Optional'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={settingsForm.tiktokPixelId || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, tiktokPixelId: e.target.value })
                    }
                    placeholder="e.g. C9ABCDEF123456"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-mono-num font-bold text-slate-900 focus:outline-none focus:border-[#F58220]"
                  />
                  <p className="text-[11px] text-slate-500">
                    Fires <code className="font-mono">ttq.track(...)</code> e-commerce conversion events.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-slate-800">
                      Google Tag Manager ID (Optional)
                    </label>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        settingsForm.gtmId?.trim()
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {settingsForm.gtmId?.trim() ? 'Active' : 'Optional'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={settingsForm.gtmId || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, gtmId: e.target.value })
                    }
                    placeholder="e.g. GTM-XXXXXXX"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-mono-num font-bold text-slate-900 focus:outline-none focus:border-[#F58220]"
                  />
                  <p className="text-[11px] text-slate-500">
                    Pushes all conversion payloads to <code className="font-mono">window.dataLayer</code>.
                  </p>
                </div>
              </div>

              {/* Granular Event Triggers Checkboxes */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Select Which E-Commerce Events to Fire Automatically
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.trackPageView !== false}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, trackPageView: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#F58220]"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">PageView</div>
                      <div className="text-[10px] text-slate-500">Every page / route visit</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.trackViewContent !== false}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, trackViewContent: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#F58220]"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">ViewContent</div>
                      <div className="text-[10px] text-slate-500">Product details view</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.trackAddToCart !== false}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, trackAddToCart: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#F58220]"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">AddToCart</div>
                      <div className="text-[10px] text-slate-500">Add to cart / Buy now</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.trackInitiateCheckout !== false}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          trackInitiateCheckout: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-[#F58220]"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">InitiateCheckout</div>
                      <div className="text-[10px] text-slate-500">Opening checkout page</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.trackPurchase !== false}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, trackPurchase: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#F58220]"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Purchase</div>
                      <div className="text-[10px] text-slate-500">Confirmed order + value</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#F58220] hover:bg-[#EA580C] text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs cursor-pointer"
                >
                  Save Pixel Configuration & Activate Now
                </button>

                <button
                  type="button"
                  onClick={() => {
                    trackPixelEvent(
                      'Purchase',
                      {
                        content_name: 'Test Order Verification (Admin Panel)',
                        content_ids: ['SBO-MORINGA-003'],
                        content_type: 'product',
                        value: 1100,
                        currency: 'BDT',
                        order_id: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
                      },
                      true
                    );
                    setPixelLogs(getPixelEventsLog());
                    showToast('Test Purchase Pixel Event fired! Check the live event log below.');
                  }}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Fire Test Pixel Event</span>
                </button>
              </div>
            </form>

            {/* Real-time Fired Pixel Events Inspector */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Live Fired Pixel Events Log ({pixelLogs.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Every event fired on your storefront appears here in real time with its exact payload.
                  </p>
                </div>
                {pixelLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      clearPixelEventsLog();
                      setPixelLogs([]);
                    }}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Clear Log
                  </button>
                )}
              </div>

              {pixelLogs.length === 0 ? (
                <div className="p-8 text-center text-xs sm:text-sm text-slate-500">
                  No pixel events recorded in this session yet. Click "Fire Test Pixel Event" above or browse the store!
                </div>
              ) : (
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[11px]">
                        <th className="py-2.5 px-4">Time</th>
                        <th className="py-2.5 px-4">Event Name</th>
                        <th className="py-2.5 px-4">Active Pixels</th>
                        <th className="py-2.5 px-4">Payload Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pixelLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-mono-num text-slate-500 whitespace-nowrap">
                            {log.timestamp}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                              {log.eventName}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono-num text-slate-700">
                            {log.pixelIds.join(' • ')}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600 max-w-md truncate">
                            {JSON.stringify(log.payload)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          POPUP MODAL 1: DETAILED ORDER DETAILS & ADMIN TRACKING ACTIVITY LOG
         ===================================================================== */}
      {selectedOrderModal && (
        <div
          onClick={() => setSelectedOrderModal(null)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono-num text-lg font-extrabold text-[#F59E0B]">
                    Order #{selectedOrderModal.orderId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-white/15 text-xs font-bold">
                    {selectedOrderModal.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Placed on{' '}
                  {selectedOrderModal.createdAt
                    ? new Date(selectedOrderModal.createdAt).toLocaleString('en-GB')
                    : selectedOrderModal.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteOrder(selectedOrderModal.orderId)}
                  className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Order</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderModal(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 6 Cols: Customer Info, Status, Courier & Items */}
              <div className="lg:col-span-6 space-y-5">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Customer & Shipping Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        value={selectedOrderModal.customerName}
                        onChange={(e) =>
                          setSelectedOrderModal({
                            ...selectedOrderModal,
                            customerName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Mobile Number (Tracking Key)
                      </label>
                      <input
                        type="text"
                        value={selectedOrderModal.phone}
                        onChange={(e) =>
                          setSelectedOrderModal({
                            ...selectedOrderModal,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-mono-num font-bold text-[#F58220]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      rows={2}
                      value={selectedOrderModal.address}
                      onChange={(e) =>
                        setSelectedOrderModal({
                          ...selectedOrderModal,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                </div>

                {/* Order Status & Courier Dispatch Controls */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Order Status & Courier Dispatch
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Order Status
                      </label>
                      <select
                        value={selectedOrderModal.status}
                        onChange={(e) =>
                          setSelectedOrderModal({
                            ...selectedOrderModal,
                            status: e.target.value,
                          })
                        }
                        className="w-full px-2.5 py-2 text-xs font-bold border border-slate-300 rounded-md bg-white"
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Courier Service
                      </label>
                      <input
                        type="text"
                        value={selectedOrderModal.courierName || 'Steadfast Courier'}
                        onChange={(e) =>
                          setSelectedOrderModal({
                            ...selectedOrderModal,
                            courierName: e.target.value,
                          })
                        }
                        className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-md bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Tracking Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SF-BD-9921"
                        value={selectedOrderModal.trackingCode || ''}
                        onChange={(e) =>
                          setSelectedOrderModal({
                            ...selectedOrderModal,
                            trackingCode: e.target.value,
                          })
                        }
                        className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-md bg-white font-mono-num"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderDetails(selectedOrderModal)}
                    className="w-full py-2.5 bg-[#F58220] hover:bg-[#EA580C] text-white font-bold text-xs rounded-lg uppercase cursor-pointer shadow-xs"
                  >
                    Save Order Changes & Log Status Activity
                  </button>
                </div>

                {/* Ordered Items Breakdown */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Ordered Products ({selectedOrderModal.items.length})
                  </h3>
                  <div className="divide-y divide-slate-200/70">
                    {selectedOrderModal.items.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">
                            {item.name || item.product?.name || 'Product'}
                          </p>
                          <p className="text-slate-500">
                            Qty: {item.quantity} × {Number(item.unitPrice).toLocaleString()}৳
                          </p>
                        </div>
                        <span className="font-mono-num font-bold text-slate-900">
                          {(Number(item.unitPrice) * Number(item.quantity)).toLocaleString()}৳
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                    <span>Total Amount</span>
                    <span className="text-[#F58220] font-mono-num">
                      {selectedOrderModal.total.toLocaleString()}৳
                    </span>
                  </div>
                </div>
              </div>

              {/* Right 6 Cols: Real-Time Admin Activity Log (Visible when Customer Tracks by Mobile Number!) */}
              <div className="lg:col-span-6 flex flex-col justify-between bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#F58220]" />
                    <span>Customer-Visible Admin Activity & Tracking Log</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-4 font-bengali">
                    কাস্টমার তার মোবাইল নাম্বার ({selectedOrderModal.phone}) দিয়ে ট্র্যাক করলে নিচের প্রতিটি অ্যাক্টিভিটি দেখতে পাবে:
                  </p>

                  {/* Add New Admin Activity Form */}
                  <form
                    onSubmit={handleAddOrderActivity}
                    className="bg-white rounded-xl p-3.5 border border-slate-200 mb-4 space-y-2.5 shadow-2xs"
                  >
                    <p className="text-xs font-bold text-slate-800">
                      + Post Live Tracking Update / Admin Activity
                    </p>
                    <input
                      type="text"
                      value={newActivityTitle}
                      onChange={(e) => setNewActivityTitle(e.target.value)}
                      placeholder="Activity Headline (e.g. Parcel Packed at Warehouse)"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                    <textarea
                      rows={2}
                      required
                      value={newActivityNote}
                      onChange={(e) => setNewActivityNote(e.target.value)}
                      placeholder="Detailed tracking note (e.g. Handed over to Steadfast Rider Kamal, Phone: 01800-000000)..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Add Activity to Tracking Timeline
                    </button>
                  </form>

                  {/* Timeline List */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {(selectedOrderModal.activities || []).map((act) => (
                      <div
                        key={act.id}
                        className="bg-white rounded-lg p-3 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{act.statusTitle}</span>
                          <span className="text-[10px] font-mono-num text-slate-400">
                            {new Date(act.createdAt).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">{act.note}</p>
                        <span className="inline-block text-[10px] text-[#F58220] font-semibold mt-1">
                          By: {act.actor}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          POPUP MODAL 2: ADD / EDIT PRODUCT (With Cloudinary Upload)
         ===================================================================== */}
      {productModalOpen && editingProduct && (
        <div
          onClick={() => setProductModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveProduct}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col"
          >
            <div className="sticky top-0 z-10 bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold">
                {editingProduct.id ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
              </h3>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
              {/* Image Upload (Cloudinary) + Art Preset Row */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-3 flex flex-col items-center">
                  <div className="w-28 h-28 rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-center">
                    <ProductArt
                      artKey={editingProduct.artKey}
                      imageUrl={editingProduct.imageUrl}
                      className="w-full h-full"
                    />
                  </div>
                </div>
                <div className="md:col-span-9 space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <label className="px-4 py-2 bg-[#F58220] hover:bg-[#EA580C] text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow-xs">
                      <Upload className="w-4 h-4" />
                      <span>
                        {uploadingImage
                          ? 'Compressing <50KB & Uploading...'
                          : 'Upload Product Image (Auto <50KB)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const uploadedUrl = await handleFileUpload(file, 'products');
                          if (uploadedUrl) {
                            setEditingProduct({ ...editingProduct, imageUrl: uploadedUrl });
                          }
                        }}
                      />
                    </label>

                    <label className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Gallery Thumbnail</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const uploadedUrl = await handleFileUpload(file, 'products_gallery');
                          if (uploadedUrl) {
                            setEditingProduct({
                              ...editingProduct,
                              galleryUrls: [...(editingProduct.galleryUrls || []), uploadedUrl],
                            });
                          }
                        }}
                      />
                    </label>

                    {editingProduct.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, imageUrl: '' })}
                        className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                      >
                        Use SVG Code Illustration Instead
                      </button>
                    )}
                    {lastUploadStats && (
                      <span className="text-[11px] font-mono-num bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md font-bold">
                        Last Upload: {lastUploadStats.originalKB}KB → {lastUploadStats.compressedKB}KB WebP ({lastUploadStats.width}×{lastUploadStats.height}px)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Direct Image URL (or auto-filled by Cloudinary)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.imageUrl || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, imageUrl: e.target.value })
                        }
                        placeholder="https://res.cloudinary.com/..."
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Fallback Code Illustration Preset
                      </label>
                      <select
                        value={editingProduct.artKey}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, artKey: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold"
                      >
                        {ART_PRESETS.map((ap) => (
                          <option key={ap.key} value={ap.key}>
                            {ap.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Product Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bengali Subtitle
                  </label>
                  <input
                    type="text"
                    value={editingProduct.bengaliSub || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, bengaliSub: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bengali"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, sku: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Base Price (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.basePrice}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingProduct({
                        ...editingProduct,
                        basePrice: val,
                        priceDisplay: `${val}৳`,
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-num font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Price Text
                  </label>
                  <input
                    type="text"
                    value={editingProduct.priceDisplay}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, priceDisplay: e.target.value })
                    }
                    placeholder="e.g. 600৳ – 3,500৳"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-num"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Old Price Text
                  </label>
                  <input
                    type="text"
                    value={editingProduct.oldPriceDisplay || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, oldPriceDisplay: e.target.value })
                    }
                    placeholder="e.g. 299৳"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    value={editingProduct.discountPercent || 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        discountPercent: Number(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-mono-num"
                  />
                </div>
                <label className="flex items-center gap-2 font-bold text-xs cursor-pointer pt-4">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, inStock: e.target.checked })
                    }
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span>In Stock</span>
                </label>
                <label className="flex items-center gap-2 font-bold text-xs cursor-pointer pt-4">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.isBestSelling)}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isBestSelling: e.target.checked })
                    }
                    className="w-4 h-4 accent-red-600"
                  />
                  <span>Best Selling</span>
                </label>
                <label className="flex items-center gap-2 font-bold text-xs cursor-pointer pt-4">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.isOrganicCertified)}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        isOrganicCertified: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span>Organic Certified</span>
                </label>
              </div>

              {/* Bullet Points Editor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Key Feature Bullet Points (One per line)
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.shortBullets.join('\n')}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      shortBullets: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Description & Warranty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Warranty / Guarantee Info
                  </label>
                  <textarea
                    rows={3}
                    value={editingProduct.warrantyInfo}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, warrantyInfo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#F58220] hover:bg-[#EA580C] text-white font-bold text-xs uppercase cursor-pointer shadow-xs"
                >
                  Save Product to Database
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          POPUP MODAL 3: ADD / EDIT CATEGORY
         ===================================================================== */}
      {categoryModalOpen && editingCategory && (
        <div
          onClick={() => setCategoryModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveCategory}
            className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingCategory.id ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category Name (English) *
              </label>
              <input
                type="text"
                required
                value={editingCategory.name}
                onChange={(e) =>
                  setEditingCategory({ ...editingCategory, name: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bengali Subtitle
              </label>
              <input
                type="text"
                value={editingCategory.bengaliName}
                onChange={(e) =>
                  setEditingCategory({ ...editingCategory, bengaliName: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bengali"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category Image (Upload to Cloudinary)
              </label>
              <div className="flex items-center gap-2">
                <label className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await handleFileUpload(file, 'categories');
                      if (url) setEditingCategory({ ...editingCategory, imageUrl: url });
                    }}
                  />
                </label>
                <input
                  type="text"
                  value={editingCategory.imageUrl || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, imageUrl: e.target.value })
                  }
                  placeholder="Or paste Image URL..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#F58220] hover:bg-[#EA580C] text-white font-bold text-xs rounded-lg uppercase cursor-pointer"
            >
              Save Category
            </button>
          </form>
        </div>
      )}

      {/* =====================================================================
          POPUP MODAL 4: ADD / EDIT HERO BANNER
         ===================================================================== */}
      {bannerModalOpen && editingBanner && (
        <div
          onClick={() => setBannerModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveBanner}
            className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit Hero Banner Slide</h3>
              <button
                type="button"
                onClick={() => setBannerModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Main Headline (Bengali / English)
              </label>
              <input
                type="text"
                required
                value={editingBanner.title}
                onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bengali"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={editingBanner.subtitle}
                onChange={(e) =>
                  setEditingBanner({ ...editingBanner, subtitle: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bengali"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={editingBanner.badgeText}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, badgeText: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bengali"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Visual Preset (0, 1, or 2)
                </label>
                <select
                  value={editingBanner.slideIndex}
                  onChange={(e) =>
                    setEditingBanner({
                      ...editingBanner,
                      slideIndex: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value={0}>Slide 0: Golden Premium Selection</option>
                  <option value={1}>Slide 1: Dark Honey & Gawa Ghee</option>
                  <option value={2}>Slide 2: Emerald Moringa & Dates</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Custom Banner Image (Optional — Uploads to Cloudinary)
              </label>
              <div className="flex items-center gap-2">
                <label className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Banner'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await handleFileUpload(file, 'banners');
                      if (url) setEditingBanner({ ...editingBanner, imageUrl: url });
                    }}
                  />
                </label>
                <input
                  type="text"
                  value={editingBanner.imageUrl || ''}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, imageUrl: e.target.value })
                  }
                  placeholder="Leave empty for built-in Studio SVG Banner"
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#F58220] hover:bg-[#EA580C] text-white font-bold text-xs rounded-lg uppercase cursor-pointer"
            >
              Save Hero Banner
            </button>
          </form>
        </div>
      )}

      {/* =====================================================================
          POPUP MODAL 5: CREATE MANUAL ORDER
         ===================================================================== */}
      {manualOrderModalOpen && (
        <div
          onClick={() => setManualOrderModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreateManualOrder}
            className="bg-white rounded-2xl max-w-md w-full p-5 space-y-3.5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Create Manual Order</h3>
              <button
                type="button"
                onClick={() => setManualOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={manualOrderForm.customerName}
                onChange={(e) =>
                  setManualOrderForm({ ...manualOrderForm, customerName: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Customer Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={manualOrderForm.phone}
                onChange={(e) =>
                  setManualOrderForm({ ...manualOrderForm, phone: e.target.value })
                }
                placeholder="017XX-XXXXXX"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Address *</label>
              <input
                type="text"
                required
                value={manualOrderForm.address}
                onChange={(e) =>
                  setManualOrderForm({ ...manualOrderForm, address: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product</label>
                <select
                  value={manualOrderForm.productId}
                  onChange={(e) =>
                    setManualOrderForm({ ...manualOrderForm, productId: e.target.value })
                  }
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.basePrice}৳)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={manualOrderForm.quantity}
                  onChange={(e) =>
                    setManualOrderForm({
                      ...manualOrderForm,
                      quantity: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs rounded-lg uppercase cursor-pointer"
            >
              Create Order in Database
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
