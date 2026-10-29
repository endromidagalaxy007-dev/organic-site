import React, { useState, useEffect } from 'react';
import {
  Package,
  MapPin,
  Phone,
  User,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  ShieldAlert,
  LayoutDashboard,
  RefreshCw,
} from 'lucide-react';
import { OrderRecord } from './CartCheckoutView';
import { StoreSettings, DEFAULT_STORE_SETTINGS } from '../data/products';

interface AccountViewProps {
  initialPhoneQuery?: string;
  storeSettings?: StoreSettings;
  onBrowseProducts: () => void;
  onOpenAdminPanel: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  initialPhoneQuery = '',
  storeSettings = DEFAULT_STORE_SETTINGS,
  onBrowseProducts,
  onOpenAdminPanel,
}) => {
  const [trackInput, setTrackInput] = useState(initialPhoneQuery || '01711223344');
  const [trackedOrders, setTrackedOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performTrackSearch = async (queryStr: string) => {
    const clean = queryStr.trim();
    if (!clean) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/track?query=${encodeURIComponent(clean)}`);
      const data = await res.json();
      setTrackedOrders(data.orders || []);
    } catch (e) {
      console.error('Track error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performTrackSearch(initialPhoneQuery || '01711223344');
  }, [initialPhoneQuery]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performTrackSearch(trackInput);
  };

  const getStepIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('cancel')) return -1;
    if (s.includes('deliver') && !s.includes('out')) return 4;
    if (s.includes('ship') || s.includes('courier') || s.includes('out for delivery')) return 3;
    if (s.includes('confirm') || s.includes('process') || s.includes('pack')) return 2;
    return 1;
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Top Customer + Admin Quick Access Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-100 text-[#F58220] flex items-center justify-center font-bold text-xl shrink-0">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#111827]">
              Live Order Tracking & Customer Account
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-bengali">
              মোবাইল নাম্বার অথবা অর্ডার আইডি দিয়ে অ্যাডমিনের সকল আপডেট ও কুরিয়ার স্ট্যাটাস লাইভ ট্র্যাক করুন
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAdminPanel}
          className="px-4 py-2.5 bg-[#111827] hover:bg-gray-800 text-white text-xs sm:text-sm font-bold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <LayoutDashboard className="w-4 h-4 text-[#F58220]" />
          <span>WooCommerce Admin Panel</span>
        </button>
      </div>

      {/* Mobile Number & Order ID Live Tracker */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Track Order by Mobile Number or Order ID
            </h2>
            <p className="text-xs text-gray-500 font-bengali">
              আপনার মোবাইল নাম্বার (যেমন: <span className="font-mono-num font-bold text-[#F58220]">01711223344</span>) অথবা অর্ডার আইডি (<span className="font-mono-num font-bold text-[#F58220]">SB-104289</span>) লিখে সার্চ করুন
            </p>
          </div>
          <button
            type="button"
            onClick={() => performTrackSearch(trackInput)}
            className="text-xs font-semibold text-[#F58220] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>

        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={trackInput}
              onChange={(e) => setTrackInput(e.target.value)}
              placeholder="Enter Mobile Number (e.g. 01711223344) or Order ID (SB-104289)..."
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#F58220] font-mono-num"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#F58220] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : 'Track Order Now'}</span>
          </button>
        </form>

        {/* Results */}
        <div className="mt-6 space-y-6">
          {hasSearched && trackedOrders.length === 0 && !loading && (
            <div className="p-8 rounded-xl bg-gray-50 border border-gray-200 text-center">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800">
                No orders found matching "{trackInput}"
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Try testing with sample phone number{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTrackInput('01711223344');
                    performTrackSearch('01711223344');
                  }}
                  className="text-[#F58220] font-mono-num font-bold underline cursor-pointer"
                >
                  01711223344
                </button>{' '}
                or place a new order from the store.
              </p>
            </div>
          )}

          {trackedOrders.map((order) => {
            const stepIdx = getStepIndex(order.status);
            return (
              <div
                key={order.orderId}
                className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-xs"
              >
                {/* Order Header */}
                <div className="bg-gray-900 text-white px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono-num text-base sm:text-lg font-extrabold text-[#F59E0B]">
                        #{order.orderId}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded bg-white/15 text-white font-semibold">
                        {order.status}
                      </span>
                      {order.trackingCode && (
                        <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono-num">
                          {order.courierName}: {order.trackingCode}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 mt-1">
                      Customer: <strong className="text-white">{order.customerName}</strong> • Phone:{' '}
                      <span className="font-mono-num text-amber-300">{order.phone}</span> • Address:{' '}
                      {order.address}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[11px] text-gray-400 uppercase">Total Payable</p>
                    <p className="text-xl font-extrabold text-[#F59E0B] font-mono-num">
                      {order.total.toLocaleString()}৳
                    </p>
                  </div>
                </div>

                {/* 4-Step Visual Progress Stepper */}
                <div className="px-4 sm:px-6 py-5 bg-orange-50/40 border-b border-gray-100">
                  {stepIdx === -1 ? (
                    <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                      <ShieldAlert className="w-5 h-5" />
                      <span>This order has been Cancelled by Admin.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { step: 1, label: 'Order Placed' },
                        { step: 2, label: 'Confirmed & Packed' },
                        { step: 3, label: 'Shipped / Courier' },
                        { step: 4, label: 'Delivered' },
                      ].map((s) => {
                        const active = stepIdx >= s.step;
                        return (
                          <div key={s.step} className="flex flex-col items-center text-center">
                            <div
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-colors ${
                                active
                                  ? 'bg-[#16A34A] text-white shadow-xs'
                                  : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              {active ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                            </div>
                            <span
                              className={`text-[11px] sm:text-xs font-semibold leading-tight ${
                                active ? 'text-gray-900' : 'text-gray-400'
                              }`}
                            >
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Two-Column Body: Left = Admin Activity Timeline, Right = Ordered Products */}
                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Chronological Admin Activities Log */}
                  <div className="lg:col-span-7">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#F58220]" />
                      <span>Live Admin Activity & Courier Log ({order.activities?.length || 0})</span>
                    </h3>

                    <div className="relative pl-5 border-l-2 border-orange-200 space-y-4">
                      {(order.activities || []).map((act, idx) => (
                        <div key={act.id} className="relative">
                          <span
                            className={`absolute -left-[25px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                              idx === 0 ? 'bg-[#16A34A] ring-2 ring-emerald-200' : 'bg-[#F58220]'
                            }`}
                          />
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-xs sm:text-sm font-bold text-gray-900">
                                {act.statusTitle}
                              </span>
                              <span className="text-[11px] text-gray-500 font-mono-num">
                                {new Date(act.createdAt).toLocaleString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 mt-1 leading-relaxed">{act.note}</p>
                            <p className="text-[10px] font-semibold text-[#F58220] mt-1">
                              Updated by: {act.actor}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ordered Items Summary */}
                  <div className="lg:col-span-5 bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-[#16A34A]" />
                        <span>Ordered Items ({order.items.length})</span>
                      </h3>
                      <div className="space-y-2.5 divide-y divide-gray-200/70">
                        {order.items.map((item, i) => (
                          <div key={i} className="pt-2 first:pt-0 flex justify-between text-xs sm:text-sm">
                            <div>
                              <p className="font-bold text-gray-900">
                                {item.name || item.product?.name || 'Product'}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                Qty: {item.quantity} × {Number(item.unitPrice).toLocaleString()}৳
                              </p>
                            </div>
                            <span className="font-bold text-gray-900 font-mono-num">
                              {(Number(item.unitPrice) * Number(item.quantity)).toLocaleString()}৳
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200 space-y-1 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-mono-num">{order.subtotal.toLocaleString()}৳</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount</span>
                          <span className="font-mono-num">-{order.discount.toLocaleString()}৳</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className="font-mono-num">
                          {order.shipping === 0 ? 'FREE' : `${order.shipping}৳`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200">
                        <span>Total</span>
                        <span className="text-[#F58220] font-mono-num">
                          {order.total.toLocaleString()}৳
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Store Contact Footer Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-semibold">
            <Phone className="w-4 h-4 text-[#F58220]" /> Hotline: {storeSettings.hotline}
          </span>
          <span className="flex items-center gap-1.5 font-semibold">
            <MapPin className="w-4 h-4 text-[#16A34A]" /> {storeSettings.address}
          </span>
        </div>
        <button
          type="button"
          onClick={onBrowseProducts}
          className="text-[#F58220] font-bold hover:underline cursor-pointer"
        >
          ← Back to Storefront
        </button>
      </div>
    </div>
  );
};
