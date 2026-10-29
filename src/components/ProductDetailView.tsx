import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Minus,
  Plus,
  Check,
  X,
  MessageCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { Product } from '../data/products';
import { ProductArt } from './ProductArt';
import { ProductCard } from './ProductCard';
import { trackPixelEvent } from '../utils/pixelTracker';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
  onBackHome: () => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedVariants: Record<string, string>,
    unitPrice: number
  ) => void;
  onBuyNow: (
    product: Product,
    quantity: number,
    selectedVariants: Record<string, string>,
    unitPrice: number
  ) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  relatedProducts,
  onBackHome,
  onSelectCategory,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
}) => {
  const [activeThumb, setActiveThumb] = useState<number>(0);
  const [zoomOpen, setZoomOpen] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'specification' | 'description' | 'warranty'>('specification');
  const [addedToast, setAddedToast] = useState<boolean>(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState<boolean>(false);

  // Initialize selected variants from product.variantGroups
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.variantGroups.forEach((group) => {
      if (group.options.length > 0) {
        initial[group.name] = group.options[0].label;
      }
    });
    return initial;
  });

  // Reset state when product changes
  useEffect(() => {
    setActiveThumb(0);
    setQuantity(1);
    setActiveTab('specification');
    const initial: Record<string, string> = {};
    product.variantGroups.forEach((group) => {
      if (group.options.length > 0) {
        initial[group.name] = group.options[0].label;
      }
    });
    setSelectedVariants(initial);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  const specsSectionRef = useRef<HTMLDivElement>(null);

  // Compute current price based on primary variant group selection
  const currentOption = React.useMemo(() => {
    if (product.variantGroups.length === 0) {
      return { price: product.basePrice, originalPrice: product.originalPrice };
    }
    const primaryGroup = product.variantGroups[0];
    const chosenLabel = selectedVariants[primaryGroup.name];
    const found = primaryGroup.options.find((o) => o.label === chosenLabel);
    return found || primaryGroup.options[0] || { price: product.basePrice, originalPrice: product.originalPrice };
  }, [product, selectedVariants]);

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedVariants, currentOption.price);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 1800);
  };

  const handleBuyNowClick = () => {
    onBuyNow(product, quantity, selectedVariants, currentOption.price);
  };

  const scrollToSpecs = () => {
    setActiveTab('specification');
    specsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
      {/* Breadcrumb Bar matching Screenshot 4 ("Home / Functional Food / Pure Moringa Leaf Powder") */}
      <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-5 flex items-center flex-wrap gap-1">
        <button
          type="button"
          onClick={onBackHome}
          className="hover:text-[#F58220] transition-colors cursor-pointer"
        >
          Home
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => onSelectCategory(product.category)}
          className="hover:text-[#F58220] transition-colors cursor-pointer"
        >
          {product.categoryLabel}
        </button>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate max-w-[220px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main PDP Grid: Stacked on Mobile (matching Screenshots 4 & 1), 2-Column Sticky on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Left Column: Product Gallery (Screenshot 4) */}
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 relative">
            {/* Top-left SAVE % Badge matching Screenshot 4 */}
            {product.discountPercent && (
              <div className="absolute top-4 left-4 z-10 bg-[#F58220] text-white text-xs font-bold px-3 py-1 rounded-[4px] shadow-xs">
                SAVE {product.discountPercent}%
              </div>
            )}

            {/* Top-right Zoom Magnifier Button matching Screenshot 4 */}
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              aria-label="Zoom Product Image"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-800 transition-colors cursor-pointer shadow-xs"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Main Studio SVG / Cloudinary Product Image */}
            <div
              onClick={() => setZoomOpen(true)}
              className="w-full aspect-square max-h-[380px] sm:max-h-[440px] mx-auto flex items-center justify-center cursor-zoom-in"
            >
              <ProductArt
                artKey={product.artKey}
                imageUrl={product.imageUrl}
                galleryUrls={product.galleryUrls}
                viewIndex={activeThumb}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Thumbnail Selector Row matching Screenshot 4 */}
          <div className="mt-3 flex items-center gap-3">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveThumb(idx)}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-white p-2 border transition-all cursor-pointer flex items-center justify-center ${
                  activeThumb === idx
                    ? 'border-[#D97706] ring-1 ring-[#D97706]/30 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 opacity-80 hover:opacity-100'
                }`}
              >
                <ProductArt
                  artKey={product.artKey}
                  imageUrl={product.imageUrl}
                  galleryUrls={product.galleryUrls}
                  viewIndex={idx}
                  className="w-full h-full"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module matching Screenshot 4 bottom + Screenshot 1 top */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_6px_rgba(0,0,0,0.03)] p-4 sm:p-6">
            {/* "In Stock" badge matching Screenshot 4 */}
            <div className="inline-block bg-[#FFF3E6] text-[#1F2937] text-xs font-semibold px-3 py-1 rounded-[4px] mb-3">
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </div>

            {/* Product Title matching Screenshot 4 */}
            <h1 className="text-xl sm:text-2xl md:text-[26px] font-bold text-[#111827] leading-snug">
              {product.name}
            </h1>
            {product.bengaliSub && (
              <p className="text-sm text-gray-500 font-bengali mt-1">
                {product.bengaliSub}
              </p>
            )}

            {/* Price Display */}
            <div className="mt-3 flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#F58220] font-mono-num">
                {currentOption.price.toLocaleString()}৳
              </span>
              {currentOption.originalPrice && (
                <span className="text-base sm:text-lg text-gray-400 line-through font-semibold font-mono-num">
                  {currentOption.originalPrice.toLocaleString()}৳
                </span>
              )}
              {product.priceDisplay.includes('–') && (
                <span className="text-xs text-gray-500 font-mono-num">
                  (Range: {product.priceDisplay})
                </span>
              )}
            </div>

            {/* Short Bullet Points + "View More Info" matching Screenshot 1 */}
            <ul className="mt-4 space-y-1.5 text-sm text-gray-700">
              {product.shortBullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-gray-900 font-bold leading-5">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={scrollToSpecs}
              className="mt-3 inline-block text-sm font-semibold text-[#111827] border-b border-[#111827] pb-0.5 hover:text-[#F58220] hover:border-[#F58220] transition-colors cursor-pointer"
            >
              View More Info
            </button>

            <hr className="my-5 border-gray-100" />

            {/* Variant Selectors matching Screenshot 1 ("Color: [Moonstone Gray] [Silver]", "Storage: [256GB] [512GB]") */}
            <div className="space-y-4">
              {product.variantGroups.map((group) => (
                <div key={group.name}>
                  <label className="block text-[15px] font-bold text-[#111827] mb-2">
                    {group.name}
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {group.options.map((option) => {
                      const isSelected = selectedVariants[group.name] === option.label;
                      return (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() =>
                            setSelectedVariants((prev) => ({
                              ...prev,
                              [group.name]: option.label,
                            }))
                          }
                          className={`px-3.5 py-2 rounded-[5px] text-sm font-medium border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                            isSelected
                              ? 'border-[#111827] bg-[#111827] text-white shadow-xs'
                              : 'border-gray-300 bg-white text-gray-800 hover:border-gray-400'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quantity Stepper + Black "ADD TO CART" Row matching Screenshot 1 */}
            <div className="mt-6 flex items-stretch gap-3">
              {/* [-  1  +] Box */}
              <div className="flex items-center border border-gray-200 rounded-[5px] bg-[#F9FAFB] overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-10 sm:w-11 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-11 sm:w-12 h-12 bg-white flex items-center justify-center text-base font-semibold text-gray-900 font-mono-num border-x border-gray-200">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-10 sm:w-11 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Black ADD TO CART Button */}
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 h-12 rounded-[5px] bg-[#0F1419] hover:bg-gray-800 text-white font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                {addedToast ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>ADDED TO CART</span>
                  </>
                ) : (
                  <span>ADD TO CART</span>
                )}
              </button>
            </div>

            {/* Full-Width Red "BUY NOW" Button matching Screenshot 1 */}
            <button
              type="button"
              onClick={handleBuyNowClick}
              className="mt-3 w-full h-12 rounded-[5px] bg-[#D61F1F] hover:bg-[#B91C1C] text-white font-bold text-sm tracking-wide uppercase flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            >
              BUY NOW
            </button>

            {/* Full-Width Green "WHATSAPP" Button matching Screenshot 1 */}
            <button
              type="button"
              onClick={() => {
                trackPixelEvent('Contact', {
                  content_name: product.name,
                  content_ids: [product.sku || product.id],
                  channel: 'WhatsApp',
                  value: currentOption.price * quantity,
                  currency: 'BDT',
                });
                setWhatsappModalOpen(true);
              }}
              className="mt-3 w-full h-12 rounded-[5px] bg-[#1FA818] hover:bg-[#15803D] text-white font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <MessageCircle className="w-5 h-5 fill-white/20" />
              <span>WHATSAPP</span>
            </button>

            {/* SKU & Category Info Blocks matching Screenshot 1 */}
            <div className="mt-5 space-y-2.5">
              <div className="inline-block bg-[#F3F4F6] text-[#111827] text-[13px] font-semibold px-4 py-2 rounded-full">
                Product SKU: {product.sku}
              </div>
              <div className="block">
                <div className="inline-block bg-[#F3F4F6] text-[#111827] text-[13px] font-semibold px-4 py-2 rounded-full">
                  Category: {product.categoriesList}
                </div>
              </div>
            </div>

            {/* Trust Assurances Strip */}
            <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50">
                <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
                <span className="text-[11px] font-semibold text-gray-700">100% Authentic</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50">
                <Truck className="w-5 h-5 text-[#F58220]" />
                <span className="text-[11px] font-semibold text-gray-700">Fast Cash on Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50">
                <RotateCcw className="w-5 h-5 text-blue-600" />
                <span className="text-[11px] font-semibold text-gray-700">7 Days Easy Return</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Specification / Description / Warranty Tabs Section matching Screenshot 1 */}
      <div
        ref={specsSectionRef}
        className="mt-8 bg-white rounded-xl border border-gray-100 shadow-[0_1px_6px_rgba(0,0,0,0.03)] p-4 sm:p-6"
      >
        {/* 3 Tab Buttons matching Screenshot 1 */}
        <div className="flex flex-wrap items-center gap-2.5 pb-4 border-b border-gray-100">
          <button
            type="button"
            onClick={() => setActiveTab('specification')}
            className={`px-4 py-2.5 rounded-[5px] text-sm font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'specification'
                ? 'bg-[#0F1419] border-[#0F1419] text-white'
                : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
            }`}
          >
            Specification
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`px-4 py-2.5 rounded-[5px] text-sm font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'description'
                ? 'bg-[#0F1419] border-[#0F1419] text-white'
                : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
            }`}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('warranty')}
            className={`px-4 py-2.5 rounded-[5px] text-sm font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'warranty'
                ? 'bg-[#0F1419] border-[#0F1419] text-white'
                : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
            }`}
          >
            Warranty
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-5">
          {activeTab === 'specification' && (
            <div className="rounded-lg overflow-hidden border border-gray-200">
              {/* Gray Header Bar "Basic Information" matching Screenshot 1 */}
              <div className="bg-[#E5E7EB]/70 px-4 py-3 border-b border-gray-200">
                <h3 className="text-[15px] font-bold text-[#111827]">Basic Information</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {product.specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 text-sm bg-white hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="col-span-5 sm:col-span-4 px-4 py-3.5 text-gray-600 font-medium border-r border-gray-100">
                      {spec.label}
                    </div>
                    <div className="col-span-7 sm:col-span-8 px-4 py-3.5 text-[#111827] font-semibold">
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'description' && (
            <div className="prose max-w-none text-gray-700 space-y-3 text-sm sm:text-base leading-relaxed">
              <h3 className="text-base font-bold text-gray-900">{product.name} — Detailed Overview</h3>
              <p>{product.description}</p>
              <ul className="list-disc pl-5 space-y-1">
                {product.shortBullets.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'warranty' && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-4 text-sm text-gray-800 space-y-2">
              <h4 className="font-bold text-emerald-950 text-base">
                Authenticity & Replacement Policy
              </h4>
              <p>{product.warrantyInfo}</p>
              <p className="text-xs text-gray-600">
                • You can inspect the parcel in front of the delivery rider before paying Cash on Delivery.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#111827]">Related Products</h2>
            <button
              type="button"
              onClick={() => onSelectCategory(product.category)}
              className="bg-[#F58220] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      )}

      {/* Full-Screen Zoom Modal */}
      {zoomOpen && (
        <div
          onClick={() => setZoomOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full aspect-square">
              <ProductArt
                artKey={product.artKey}
                imageUrl={product.imageUrl}
                galleryUrls={product.galleryUrls}
                viewIndex={activeThumb}
                className="w-full h-full"
              />
            </div>
            <p className="text-center font-bold text-gray-800 mt-2">{product.name}</p>
          </div>
        </div>
      )}

      {/* WhatsApp Direct Order Inquiry Modal */}
      {whatsappModalOpen && (
        <div
          onClick={() => setWhatsappModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-gray-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-[#1FA818] font-bold">
                <MessageCircle className="w-5 h-5" />
                <span>Order via WhatsApp</span>
              </div>
              <button
                type="button"
                onClick={() => setWhatsappModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-sm">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-gray-800">
                <p className="font-bold text-emerald-950">{product.name}</p>
                <p className="text-xs text-gray-600 mt-1">
                  SKU: {product.sku} • Qty: {quantity} • Unit Price: {currentOption.price.toLocaleString()}৳
                </p>
                <p className="text-xs font-semibold text-emerald-800 mt-1">
                  Total Payable: {(currentOption.price * quantity).toLocaleString()}৳ (Cash on Delivery Available)
                </p>
              </div>
              <p className="text-gray-600 text-xs">
                Our WhatsApp support representative is online (Hotline: +880 1700-000000). You can also confirm your order immediately using Cash on Delivery checkout.
              </p>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setWhatsappModalOpen(false);
                  handleBuyNowClick();
                }}
                className="flex-1 py-2.5 bg-[#1FA818] hover:bg-[#15803D] text-white font-bold text-xs rounded-lg uppercase cursor-pointer"
              >
                Proceed to Instant Order
              </button>
              <button
                type="button"
                onClick={() => setWhatsappModalOpen(false)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
