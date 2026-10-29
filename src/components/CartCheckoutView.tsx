import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Tag,
} from 'lucide-react';
import {
  Product,
  CouponItem,
  StoreSettings,
  OrderActivity,
  DEFAULT_STORE_SETTINGS,
} from '../data/products';
import { ProductArt } from './ProductArt';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariants: Record<string, string>;
  unitPrice: number;
}

export interface OrderRecord {
  orderId: string;
  date?: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryZone: 'inside-dhaka' | 'outside-dhaka';
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  items: {
    id: string;
    productId?: string;
    name?: string;
    artKey?: string;
    imageUrl?: string;
    product?: Product;
    quantity: number;
    selectedVariants: Record<string, string>;
    unitPrice: number;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: string;
  courierName?: string;
  trackingCode?: string;
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
  activities?: OrderActivity[];
}

interface CartCheckoutViewProps {
  cart: CartItem[];
  coupons?: CouponItem[];
  storeSettings?: StoreSettings;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (order: OrderRecord) => Promise<void> | void;
  onContinueShopping: () => void;
  onSelectProduct: (product: Product) => void;
  onGoToTrackOrder?: (phone: string) => void;
}

export const CartCheckoutView: React.FC<CartCheckoutViewProps> = ({
  cart,
  coupons = [],
  storeSettings = DEFAULT_STORE_SETTINGS,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  onContinueShopping,
  onSelectProduct,
  onGoToTrackOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'inside-dhaka' | 'outside-dhaka'>('inside-dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponItem | null>(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  const discount = React.useMemo(() => {
    if (!appliedCoupon) return 0;
    if (subtotal < appliedCoupon.minOrderAmount) return 0;
    if (appliedCoupon.discountType === 'percent') {
      return Math.round((subtotal * appliedCoupon.discountValue) / 100);
    }
    return appliedCoupon.discountValue;
  }, [appliedCoupon, subtotal]);

  const shipping =
    subtotal >= storeSettings.freeShippingThreshold
      ? 0
      : deliveryZone === 'inside-dhaka'
      ? storeSettings.insideDhakaShipping
      : storeSettings.outsideDhakaShipping;

  const total = Math.max(0, subtotal - discount + shipping);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponInput.trim().toUpperCase();
    if (!clean) return;
    const found = coupons.find((c) => c.code.toUpperCase() === clean && c.isActive);
    if (!found) {
      setCouponMessage('Invalid or expired coupon code.');
      setAppliedCoupon(null);
      return;
    }
    if (subtotal < found.minOrderAmount) {
      setCouponMessage(`Minimum order of ${found.minOrderAmount}৳ required for ${found.code}.`);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(found);
    setCouponMessage(
      `Coupon ${found.code} applied! (${
        found.discountType === 'percent' ? `${found.discountValue}% OFF` : `${found.discountValue}৳ OFF`
      })`
    );
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setFormError(
        'অনুগ্রহ করে আপনার নাম, মোবাইল নাম্বার এবং সম্পূর্ণ ঠিকানা লিখুন (Please fill in Name, Phone & Address).'
      );
      return;
    }
    setFormError('');
    setSubmitting(true);

    const newOrder: OrderRecord = {
      orderId: `SB-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      deliveryZone,
      paymentMethod,
      items: cart.map((c) => ({
        id: c.id,
        productId: c.product.id,
        name: c.product.name,
        artKey: c.product.artKey,
        imageUrl: c.product.imageUrl || '',
        product: c.product,
        quantity: c.quantity,
        selectedVariants: c.selectedVariants,
        unitPrice: c.unitPrice,
      })),
      subtotal,
      discount,
      shipping,
      total,
      status: 'Pending',
      courierName: 'Steadfast Courier',
      trackingCode: '',
      createdAt: new Date().toISOString(),
    };

    try {
      await onPlaceOrder(newOrder);
      setConfirmedOrder(newOrder);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="inline-block bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-md mb-2">
            Order #{confirmedOrder.orderId} — Saved to Database
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-bengali">
            ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            আপনার মোবাইল নাম্বার (<span className="font-mono-num font-bold text-gray-900">{confirmedOrder.phone}</span>) দিয়ে যেকোনো সময় অর্ডারের লাইভ আপডেট ট্র্যাক করতে পারবেন।
          </p>

          <div className="mt-6 text-left bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200 space-y-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-500">Customer Details</p>
                <p className="font-bold text-gray-900">{confirmedOrder.customerName}</p>
                <p className="text-gray-700 font-mono-num">{confirmedOrder.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Delivery Address & Payment</p>
                <p className="font-medium text-gray-800">{confirmedOrder.address}</p>
                <p className="text-xs font-semibold text-[#F58220] uppercase mt-0.5">
                  Payment:{' '}
                  {confirmedOrder.paymentMethod === 'cod'
                    ? 'Cash on Delivery'
                    : confirmedOrder.paymentMethod.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase">Ordered Items</p>
              {confirmedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-800 font-medium">
                    {item.name || item.product?.name} × {item.quantity}
                  </span>
                  <span className="font-bold text-gray-900 font-mono-num">
                    {(item.unitPrice * item.quantity).toLocaleString()}৳
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-base font-bold text-gray-900">
              <span>Total Payable Amount</span>
              <span className="text-xl text-[#F58220] font-mono-num">
                {confirmedOrder.total.toLocaleString()}৳
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {onGoToTrackOrder && (
              <button
                type="button"
                onClick={() => onGoToTrackOrder(confirmedOrder.phone)}
                className="inline-flex items-center gap-2 bg-[#111827] hover:bg-gray-800 text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors cursor-pointer"
              >
                <Truck className="w-4 h-4 text-[#F58220]" />
                <span>Track Live Order Activities</span>
              </button>
            )}
            <button
              type="button"
              onClick={onContinueShopping}
              className="inline-flex items-center gap-2 bg-[#F58220] hover:bg-[#EA580C] text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-[#F58220] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your Shopping Cart is Empty</h2>
          <p className="text-sm text-gray-500 mt-1 font-bengali">
            আপনার কার্টে বর্তমানে কোনো পণ্য নেই। আমাদের খাঁটি অর্গানিক কালেকশন ঘুরে দেখুন!
          </p>
          <button
            type="button"
            onClick={onContinueShopping}
            className="mt-6 inline-flex items-center gap-2 bg-[#F58220] hover:bg-[#EA580C] text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors cursor-pointer"
          >
            <span>Browse Organic Products</span>
          </button>
        </div>
      </div>
    );
  }

  const activeCouponSample = coupons.find((c) => c.isActive)?.code || 'WINTER10';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
            Shopping Cart & Easy Checkout
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-bengali">
            {storeSettings.freeShippingThreshold.toLocaleString()}৳ বা তার বেশি অর্ডারে সারাদেশে ফ্রি হোম ডেলিভারি! (কুপন কোড:{' '}
            <span className="font-mono-num font-bold text-[#F58220]">{activeCouponSample}</span>)
          </p>
        </div>
        <button
          type="button"
          onClick={onContinueShopping}
          className="text-xs sm:text-sm font-semibold text-[#F58220] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {cart.map((item) => {
              const variantText = Object.entries(item.selectedVariants)
                .map(([k, v]) => `${k}: ${v}`)
                .join(' · ');
              return (
                <div key={item.id} className="p-4 flex items-center gap-3 sm:gap-4">
                  <div
                    onClick={() => onSelectProduct(item.product)}
                    className="w-20 h-20 rounded-lg border border-gray-100 p-1.5 bg-gray-50 shrink-0 cursor-pointer"
                  >
                    <ProductArt
                      artKey={item.product.artKey}
                      imageUrl={item.product.imageUrl}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => onSelectProduct(item.product)}
                      className="text-sm sm:text-base font-bold text-gray-900 hover:text-[#F58220] truncate cursor-pointer"
                    >
                      {item.product.name}
                    </h3>
                    {variantText && <p className="text-xs text-gray-500 mt-0.5">{variantText}</p>}
                    <p className="text-sm font-bold text-[#F58220] font-mono-num mt-1">
                      {item.unitPrice.toLocaleString()}৳ × {item.quantity} ={' '}
                      {(item.unitPrice * item.quantity).toLocaleString()}৳
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-200 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 h-8 bg-white flex items-center justify-center text-xs font-bold font-mono-num border-x border-gray-200">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-200 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label="Remove item"
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coupon Bar */}
          <form
            onSubmit={handleApplyCoupon}
            className="bg-white rounded-xl border border-gray-200 p-4 space-y-2"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Tag className="w-4 h-4 text-[#F58220]" />
                <span>
                  Promo Code (Available:{' '}
                  <span className="font-mono-num text-[#F58220]">{activeCouponSample}</span>)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={`Enter ${activeCouponSample}`}
                  className="flex-1 sm:w-44 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#F58220]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#111827] hover:bg-gray-800 text-white text-xs font-bold rounded-md uppercase cursor-pointer whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
            </div>
            {couponMessage && (
              <p
                className={`text-xs font-semibold ${
                  appliedCoupon ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {couponMessage}
              </p>
            )}
          </form>
        </div>

        {/* Right 5 Columns: Cash on Delivery Customer Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleConfirmOrder}
            className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-xs"
          >
            <h2 className="text-lg font-bold text-[#111827] pb-2 border-b border-gray-100 font-bengali">
              অর্ডার কনফার্ম করতে আপনার তথ্য দিন (Billing & Delivery)
            </h2>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                আপনার নাম (Full Name) *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="যেমন: মো: রাকিবুল হাসান"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#F58220]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                মোবাইল নাম্বার (Phone Number — For Live Order Tracking) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XX-XXXXXX"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#F58220] font-mono-num"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                সম্পূর্ণ ঠিকানা (Full Delivery Address) *
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="বাসা/রোড নং, এলাকা, থানা ও জেলা"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#F58220]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                ডেলিভারি এরিয়া (Delivery Zone)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeliveryZone('inside-dhaka')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    deliveryZone === 'inside-dhaka'
                      ? 'border-[#F58220] bg-orange-50/60 font-bold text-gray-900'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <div>ঢাকার ভেতরে (Inside Dhaka)</div>
                  <div className="text-[#F58220] font-mono-num mt-0.5">
                    {subtotal >= storeSettings.freeShippingThreshold
                      ? 'FREE'
                      : `${storeSettings.insideDhakaShipping}৳`}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryZone('outside-dhaka')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    deliveryZone === 'outside-dhaka'
                      ? 'border-[#F58220] bg-orange-50/60 font-bold text-gray-900'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <div>ঢাকার বাইরে (Outside Dhaka)</div>
                  <div className="text-[#F58220] font-mono-num mt-0.5">
                    {subtotal >= storeSettings.freeShippingThreshold
                      ? 'FREE'
                      : `${storeSettings.outsideDhakaShipping}৳`}
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                পেমেন্ট মাধ্যম (Payment Method)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cod', label: 'Cash on Delivery' },
                  { id: 'bkash', label: 'bKash' },
                  { id: 'nagad', label: 'Nagad' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as 'cod' | 'bkash' | 'nagad')}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      paymentMethod === pm.id
                        ? 'border-[#111827] bg-[#111827] text-white'
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3.5 space-y-2 text-sm border border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
                <span className="font-semibold font-mono-num">{subtotal.toLocaleString()}৳</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Promo Discount ({appliedCoupon?.code})</span>
                  <span className="font-mono-num">-{discount.toLocaleString()}৳</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span className="font-semibold font-mono-num">
                  {shipping === 0 ? 'FREE' : `${shipping}৳`}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-bold text-gray-900">
                <span>সর্বমোট (Total Payable)</span>
                <span className="text-lg text-[#F58220] font-mono-num">
                  {total.toLocaleString()}৳
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#D61F1F] hover:bg-[#B91C1C] disabled:opacity-50 text-white font-bold text-sm rounded-lg uppercase tracking-wide shadow-sm transition-colors cursor-pointer"
            >
              {submitting ? 'Saving Order...' : `Confirm Order (${total.toLocaleString()}৳)`}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Safe Checkout
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#F58220]" /> Pay on Delivery
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
