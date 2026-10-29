/**
 * Dynamic Meta (Facebook) Pixel, TikTok Pixel & Google Tag Manager Event Engine
 * Automatically initializes when Pixel IDs are saved in the Admin Panel and fires
 * standard e-commerce events (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, Search, Contact).
 */

export interface PixelConfig {
  fbPixelId: string;
  tiktokPixelId?: string;
  gtmId?: string;
  enablePixelEvents: boolean;
  trackPageView: boolean;
  trackViewContent: boolean;
  trackAddToCart: boolean;
  trackInitiateCheckout: boolean;
  trackPurchase: boolean;
}

export interface PixelEventLog {
  id: string;
  eventName: string;
  pixelIds: string[];
  payload: Record<string, any>;
  timestamp: string;
}

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    ttq?: any;
    dataLayer?: any[];
    __shiterBazarPixelId?: string;
    __shiterBazarPixelConfig?: PixelConfig;
  }
}

const PIXEL_LOG_KEY = 'sb_pixel_events_log';

export function getPixelEventsLog(): PixelEventLog[] {
  try {
    const raw = sessionStorage.getItem(PIXEL_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearPixelEventsLog(): void {
  try {
    sessionStorage.removeItem(PIXEL_LOG_KEY);
    window.dispatchEvent(new CustomEvent('pixel-event-fired'));
  } catch {
    // ignore
  }
}

function recordPixelEvent(ev: PixelEventLog) {
  try {
    const prev = getPixelEventsLog();
    const updated = [ev, ...prev].slice(0, 40);
    sessionStorage.setItem(PIXEL_LOG_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('pixel-event-fired', { detail: ev }));
  } catch {
    // ignore storage quota errors
  }
}

export function initDynamicPixel(config: PixelConfig) {
  if (typeof window === 'undefined') return;
  window.__shiterBazarPixelConfig = config;

  if (!config.enablePixelEvents) return;

  const cleanFbId = (config.fbPixelId || '').trim();
  const cleanGtmId = (config.gtmId || '').trim();

  if (cleanGtmId) {
    window.dataLayer = window.dataLayer || [];
  }

  if (cleanFbId) {
    if (!window.fbq) {
      const n: any = (window.fbq = function (...args: any[]) {
        if (n.callMethod) {
          n.callMethod.apply(n, args);
        } else {
          n.queue.push(args);
        }
      });
      if (!window._fbq) window._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];

      const scriptId = 'facebook-jssdk-pixel';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(script, firstScript);
        } else {
          document.head.appendChild(script);
        }
      }
    }

    if (window.__shiterBazarPixelId !== cleanFbId) {
      window.__shiterBazarPixelId = cleanFbId;
      window.fbq('init', cleanFbId);
    }
  }
}

export function trackPixelEvent(
  eventName:
    | 'PageView'
    | 'ViewContent'
    | 'AddToCart'
    | 'InitiateCheckout'
    | 'Purchase'
    | 'Search'
    | 'Contact',
  payload: Record<string, any> = {},
  forceFire = false
) {
  if (typeof window === 'undefined') return;
  const cfg = window.__shiterBazarPixelConfig;
  if (!cfg && !forceFire) return;

  const cleanFbId = (cfg?.fbPixelId || '').trim();
  const cleanTiktokId = (cfg?.tiktokPixelId || '').trim();
  const cleanGtmId = (cfg?.gtmId || '').trim();

  const activePixels: string[] = [];
  if (cleanFbId) activePixels.push(`FB:${cleanFbId}`);
  if (cleanTiktokId) activePixels.push(`TT:${cleanTiktokId}`);
  if (cleanGtmId) activePixels.push(`GTM:${cleanGtmId}`);

  if (activePixels.length === 0 && !forceFire) return;
  if (cfg && !cfg.enablePixelEvents && !forceFire) return;

  if (cfg && !forceFire) {
    if (eventName === 'PageView' && !cfg.trackPageView) return;
    if (eventName === 'ViewContent' && !cfg.trackViewContent) return;
    if (eventName === 'AddToCart' && !cfg.trackAddToCart) return;
    if (eventName === 'InitiateCheckout' && !cfg.trackInitiateCheckout) return;
    if (eventName === 'Purchase' && !cfg.trackPurchase) return;
  }

  if (cfg) {
    initDynamicPixel(cfg);
  }

  if (cleanFbId && window.fbq) {
    window.fbq('track', eventName, payload);
  }

  if (cleanTiktokId && window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track(eventName, payload);
  }

  if (cleanGtmId) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...payload,
    });
  }

  recordPixelEvent({
    id: `px-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    eventName,
    pixelIds: activePixels.length > 0 ? activePixels : ['Test Mode (No Pixel ID Saved Yet)'],
    payload,
    timestamp: new Date().toLocaleTimeString('en-GB'),
  });
}
