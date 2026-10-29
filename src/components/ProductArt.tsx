import React, { useState } from 'react';
import { HeroBanner } from '../data/products';
import { getFastImageUrl } from '../utils/imageOptimizer';

export const BrandLogo: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  storeNameBn?: string;
  storeNameSubBn?: string;
  logoUrl?: string;
}> = ({
  className = '',
  size = 'md',
  storeNameBn = 'শিতের',
  storeNameSubBn = 'বাজার',
  logoUrl = '',
}) => {
  const [imgErr, setImgErr] = useState(false);
  const scale = size === 'sm' ? 'scale-90' : size === 'lg' ? 'scale-110' : 'scale-100';

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${scale} ${className}`}>
      {logoUrl && !imgErr ? (
        <img
          src={getFastImageUrl(logoUrl, 240)}
          alt={`${storeNameBn} ${storeNameSubBn}`}
          referrerPolicy="no-referrer"
          decoding="async"
          onError={() => setImgErr(true)}
          className="h-9 w-auto object-contain shrink-0"
        />
      ) : (
        <svg width="42" height="34" viewBox="0 0 48 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
          <line x1="2" y1="12" x2="11" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="18" x2="9" y2="18" stroke="#F58220" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="4" y1="24" x2="12" y2="24" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M10 7H15.5L19.5 25.5H39.5L43.5 11.5H17" fill="#F58220" />
          <path
            d="M10 7H15.5L19.5 25.5H39.5L43.5 11.5H17"
            stroke="#EA580C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="22" y="6" width="6" height="6" rx="1" fill="#FBBF24" />
          <rect x="30" y="5" width="7" height="7" rx="1.5" fill="#EA580C" />
          <circle cx="22.5" cy="31.5" r="3.5" fill="#EA580C" />
          <circle cx="22.5" cy="31.5" r="1.4" fill="#FFF" />
          <circle cx="36" cy="31.5" r="3.5" fill="#EA580C" />
          <circle cx="36" cy="31.5" r="1.4" fill="#FFF" />
        </svg>
      )}
      <div className="flex flex-col leading-none font-bengali">
        <span className="text-[19px] font-bold tracking-tight text-[#1F2937]">{storeNameBn}</span>
        <span className="text-[16px] font-bold tracking-tight text-[#F58220] -mt-0.5">{storeNameSubBn}</span>
      </div>
    </div>
  );
};

export const HeroBannerArt: React.FC<{
  slideIndex: number;
  banner?: HeroBanner;
  onCtaClick?: () => void;
}> = ({ slideIndex, banner, onCtaClick }) => {
  const [imgErr, setImgErr] = useState(false);

  // If the admin uploaded a custom Cloudinary banner image
  if (banner?.imageUrl && !imgErr) {
    return (
      <div
        onClick={onCtaClick}
        className="relative w-full overflow-hidden rounded-xl cursor-pointer select-none bg-[#FAF0D7]"
      >
        <img
          src={getFastImageUrl(banner.imageUrl, 1200)}
          alt={banner.title || 'Promotional Banner'}
          referrerPolicy="no-referrer"
          decoding="async"
          onError={() => setImgErr(true)}
          className="w-full h-[210px] sm:h-[290px] md:h-[340px] object-cover"
        />
        {(banner.title || banner.subtitle) && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent flex flex-col justify-center px-6 md:px-12">
            {banner.badgeText && (
              <span className="inline-block w-fit bg-[#F58220] text-white text-xs font-bengali font-bold px-3 py-1 rounded-md mb-2">
                {banner.badgeText}
              </span>
            )}
            <h2 className="font-bengali text-xl sm:text-3xl md:text-4xl font-bold text-white max-w-lg leading-tight">
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p className="text-gray-100 text-xs sm:text-sm font-bengali mt-1.5 max-w-md">
                {banner.subtitle}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  const effectiveIndex = banner ? banner.slideIndex % 3 : slideIndex % 3;

  if (effectiveIndex === 1) {
    return (
      <div
        onClick={onCtaClick}
        className="relative w-full overflow-hidden rounded-xl cursor-pointer select-none"
        style={{
          background:
            banner?.bgGradient ||
            'linear-gradient(135deg, #2D1606 0%, #5C2D0C 48%, #8F4B14 100%)',
        }}
      >
        <div className="px-5 py-6 md:px-12 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left z-10 max-w-lg">
            <span className="inline-block bg-[#F58220] text-white text-xs md:text-sm font-bengali font-semibold px-3 py-1 rounded-md mb-2.5">
              {banner?.badgeText || '১০০% খাঁটি ও প্রাকৃতিক'}
            </span>
            <h2 className="font-bengali text-2xl md:text-4xl font-bold text-[#FEF3C7] leading-tight">
              {banner?.title || 'সুন্দরবনের প্রাকৃতিক চাকের মধু ও পাবনার খাঁটি গাওয়া ঘি'}
            </h2>
            <p className="text-amber-100/90 text-xs md:text-sm mt-2 font-bengali">
              {banner?.subtitle ||
                'শীতের সকালে রোগ প্রতিরোধ ক্ষমতা বাড়াতে ল্যাব টেস্টেড অর্গানিক সুপারফুড কম্বো'}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-[#F58220] hover:bg-[#EA580C] text-white font-semibold text-xs md:text-sm px-4 py-2 rounded-lg shadow-md transition-transform active:scale-95">
              <span>{banner?.ctaText || 'এখনই অর্ডার করুন'}</span>
              <span>→</span>
            </div>
          </div>
          <div className="w-full max-w-[280px] md:max-w-[360px] shrink-0">
            <svg viewBox="0 0 360 190" className="w-full h-auto drop-shadow-xl">
              <ellipse cx="180" cy="172" rx="145" ry="12" fill="rgba(0,0,0,0.35)" />
              <g opacity="0.2" fill="#FBBF24">
                <polygon points="60,30 75,22 90,30 90,48 75,56 60,48" />
                <polygon points="92,30 107,22 122,30 122,48 107,56 92,48" />
                <polygon points="76,58 91,50 106,58 106,76 91,84 76,76" />
              </g>
              <rect x="45" y="34" width="88" height="132" rx="4" fill="#18181B" stroke="#D97706" strokeWidth="1.5" />
              <rect x="53" y="44" width="72" height="45" rx="2" fill="#27272A" />
              <text x="89" y="65" textAnchor="middle" fill="#FBBF24" fontSize="9" fontWeight="bold">SUNDARBAN</text>
              <text x="89" y="77" textAnchor="middle" fill="#FDE68A" fontSize="8" fontWeight="bold">RAW HONEY</text>
              <circle cx="89" cy="115" r="18" fill="#D97706" opacity="0.3" />
              <text x="89" y="118" textAnchor="middle" fill="#FBBF24" fontSize="8" fontWeight="bold">100% PURE</text>
              <rect x="155" y="42" width="76" height="124" rx="18" fill="#D97706" stroke="#F59E0B" strokeWidth="2" />
              <rect x="167" y="28" width="52" height="15" rx="4" fill="#1F2937" />
              <rect x="161" y="74" width="64" height="58" rx="4" fill="#FFFBEB" />
              <text x="193" y="95" textAnchor="middle" fill="#78350F" fontSize="10" fontWeight="bold">খাঁটি</text>
              <text x="193" y="109" textAnchor="middle" fill="#92400E" fontSize="10" fontWeight="bold">সুন্দরবন মধু</text>
              <path d="M212 112 C216 118, 208 124, 212 126 C216 124, 214 116, 212 112 Z" fill="#F59E0B" />
              <rect x="246" y="64" width="68" height="102" rx="14" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" />
              <rect x="256" y="51" width="48" height="14" rx="3" fill="#B45309" />
              <rect x="252" y="92" width="56" height="48" rx="4" fill="#FFFBEB" />
              <text x="280" y="112" textAnchor="middle" fill="#78350F" fontSize="9.5" fontWeight="bold">পাবনার খাঁটি</text>
              <text x="280" y="126" textAnchor="middle" fill="#B45309" fontSize="10.5" fontWeight="bold">গাওয়া ঘি</text>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (effectiveIndex === 2) {
    return (
      <div
        onClick={onCtaClick}
        className="relative w-full overflow-hidden rounded-xl cursor-pointer select-none"
        style={{
          background:
            banner?.bgGradient ||
            'linear-gradient(135deg, #064E3B 0%, #047857 52%, #10B981 100%)',
        }}
      >
        <div className="px-5 py-6 md:px-12 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left z-10 max-w-lg">
            <span className="inline-block bg-amber-400 text-emerald-950 text-xs md:text-sm font-bengali font-bold px-3 py-1 rounded-md mb-2.5">
              {banner?.badgeText || 'অর্গানিক সার্টিফায়েড কালেকশন'}
            </span>
            <h2 className="font-bengali text-2xl md:text-4xl font-bold text-white leading-tight">
              {banner?.title || 'মরিঙ্গা পাউডার, চিয়া সিড ও প্রিমিয়াম খেজুরের বিশেষ ছাড়'}
            </h2>
            <p className="text-emerald-100 text-xs md:text-sm mt-2 font-bengali">
              {banner?.subtitle ||
                'সরাসরি বাগান ও খামার থেকে সংগৃহীত ১০০% কেমিক্যালমুক্ত সুপারফুড — সারাদেশে ক্যাশ অন ডেলিভারি'}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-white text-emerald-900 font-semibold text-xs md:text-sm px-4 py-2 rounded-lg shadow-md">
              <span>{banner?.ctaText || 'কালেকশন দেখুন'}</span>
              <span>→</span>
            </div>
          </div>
          <div className="w-full max-w-[280px] md:max-w-[360px] shrink-0">
            <svg viewBox="0 0 360 190" className="w-full h-auto drop-shadow-xl">
              <ellipse cx="180" cy="172" rx="140" ry="12" fill="rgba(0,0,0,0.3)" />
              <rect x="55" y="25" width="96" height="142" rx="8" fill="#059669" stroke="#34D399" strokeWidth="2" />
              <rect x="65" y="45" width="76" height="95" rx="38" fill="#ECFDF5" />
              <text x="103" y="75" textAnchor="middle" fill="#D97706" fontSize="10" fontWeight="bold">মরিঙ্গা পাউডার</text>
              <text x="103" y="88" textAnchor="middle" fill="#064E3B" fontSize="7.5" fontWeight="bold">MORINGA POWDER</text>
              <ellipse cx="103" cy="112" rx="24" ry="12" fill="#10B981" />
              <path d="M180 112 Q180 165 245 165 Q310 165 310 112 Z" fill="#78350F" stroke="#451A03" strokeWidth="2" />
              <ellipse cx="220" cy="108" rx="16" ry="9" fill="#451A03" />
              <ellipse cx="245" cy="102" rx="18" ry="10" fill="#5C2D0C" />
              <ellipse cx="272" cy="108" rx="16" ry="9" fill="#451A03" />
              <ellipse cx="234" cy="114" rx="17" ry="9" fill="#3B1504" />
              <ellipse cx="260" cy="114" rx="17" ry="9" fill="#5C2D0C" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onCtaClick}
      className="relative w-full overflow-hidden rounded-xl cursor-pointer select-none"
      style={{
        background:
          banner?.bgGradient ||
          'radial-gradient(circle at 50% 42%, #FAF0D7 0%, #EAD09E 52%, #D7B06E 100%)',
      }}
    >
      <div className="px-4 pt-4 pb-6 md:px-10 md:py-9 flex flex-col items-center">
        <p className="font-bengali text-[#4A2C11] text-sm sm:text-base md:text-2xl font-bold tracking-tight text-center">
          {banner?.subtitle || 'শুদ্ধতার সাথে স্বাস্থ্যের মেলবন্ধন'}
        </p>
        <div className="mt-1 bg-[#5A381E] text-white font-bengali font-bold text-sm sm:text-base md:text-2xl px-4 py-1 rounded-md shadow-sm border border-[#7C5332]">
          {banner?.title || 'প্রিমিয়াম সিলেকশন'}
        </div>


        {/* Center Studio Product Composition matching Screenshot 2 */}
        <div className="w-full max-w-[340px] sm:max-w-[440px] md:max-w-[600px] mt-2 md:mt-4">
          <svg viewBox="0 0 500 200" className="w-full h-auto overflow-visible">
            {/* Soft studio floor shadow */}
            <ellipse cx="255" cy="178" rx="195" ry="14" fill="rgba(74, 44, 17, 0.24)" />
            <ellipse cx="145" cy="180" rx="95" ry="9" fill="rgba(74, 44, 17, 0.22)" />
            <ellipse cx="350" cy="180" rx="95" ry="9" fill="rgba(74, 44, 17, 0.22)" />

            {/* Left: Green Tea Box (প্রিমিয়াম গ্রিন টি) */}
            <g transform="translate(48, 52)">
              {/* Side 3D panel */}
              <polygon points="0,8 22,0 22,114 0,124" fill="#14532D" />
              {/* Main Front Box */}
              <rect x="22" y="0" width="185" height="124" rx="3" fill="#166534" stroke="#14532D" strokeWidth="1.5" />
              {/* Decorative golden/cream curves on right side of box */}
              <path d="M128 0 L207 0 L207 124 L105 124 Q142 62 128 0 Z" fill="#ECFCCB" />
              <path d="M122 0 Q138 62 98 124 L112 124 Q148 62 132 0 Z" fill="#D97706" opacity="0.65" />
              {/* Tea leaves graphic */}
              <ellipse cx="105" cy="86" rx="22" ry="11" transform="rotate(-25 105 86)" fill="#4ADE80" opacity="0.85" />
              <ellipse cx="122" cy="95" rx="18" ry="9" transform="rotate(15 122 95)" fill="#22C55E" />
              {/* Cup of green tea on right side of box */}
              <ellipse cx="155" cy="94" rx="22" ry="12" fill="#84CC16" stroke="#FFFFFF" strokeWidth="2.5" />
              <path d="M133 94 Q155 116 177 94" fill="#65A30D" />
              {/* Box Text */}
              <text x="64" y="46" textAnchor="middle" fill="#FDE68A" fontSize="15" fontWeight="bold" className="font-bengali">
                প্রিমিয়াম
              </text>
              <text x="64" y="66" textAnchor="middle" fill="#FEF08A" fontSize="16" fontWeight="bold" className="font-bengali">
                গ্রিন টি
              </text>
              <text x="64" y="84" textAnchor="middle" fill="#BBF7D0" fontSize="8">
                100% ORGANIC LEAF
              </text>
              {/* Brand emblem on white side */}
              <rect x="155" y="18" width="28" height="28" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
              <text x="169" y="36" textAnchor="middle" fill="#166534" fontSize="11" fontWeight="bold">খাঁটি</text>
            </g>

            {/* Right Rear: Tall Jar of Sundarban Honey (খাঁটি সুন্দরবন মধু) */}
            <g transform="translate(310, 14)">
              {/* Gold Lid */}
              <rect x="16" y="0" width="66" height="16" rx="4" fill="#78350F" stroke="#F59E0B" strokeWidth="1.5" />
              <rect x="20" y="15" width="58" height="7" fill="#D97706" />
              {/* Glass Shoulder & Honey Body */}
              <rect x="6" y="21" width="86" height="142" rx="18" fill="#B45309" stroke="#D97706" strokeWidth="2" />
              {/* Gloss Highlight */}
              <rect x="14" y="28" width="12" height="124" rx="6" fill="#F59E0B" opacity="0.45" />
              {/* White & Gold Label */}
              <rect x="9" y="55" width="80" height="72" rx="4" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1" />
              <text x="36" y="75" fill="#1F2937" fontSize="10.5" fontWeight="bold" className="font-bengali">খাঁটি</text>
              <text x="45" y="90" textAnchor="middle" fill="#111827" fontSize="12" fontWeight="bold" className="font-bengali">সুন্দরবন</text>
              <text x="38" y="105" fill="#92400E" fontSize="12" fontWeight="bold" className="font-bengali">মধু</text>
              {/* Honey Drop Graphic */}
              <path d="M72 78 C78 88, 64 98, 72 104 C80 98, 78 86, 72 78 Z" fill="#F59E0B" />
              <circle cx="72" cy="96" r="5" fill="#D97706" />
            </g>

            {/* Far Right: Smaller Jar of Gawa Ghee (খাঁটি গাওয়া ঘি) */}
            <g transform="translate(398, 60)">
              {/* Gold Lid */}
              <rect x="10" y="0" width="52" height="13" rx="3" fill="#B45309" stroke="#FDE68A" strokeWidth="1.2" />
              {/* Golden Ghee Jar Body */}
              <rect x="2" y="13" width="68" height="104" rx="14" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
              <rect x="6" y="38" width="60" height="54" rx="4" fill="#FFFBEB" stroke="#FBBF24" strokeWidth="1" />
              <text x="36" y="56" textAnchor="middle" fill="#78350F" fontSize="9.5" fontWeight="bold" className="font-bengali">খাঁটি</text>
              <text x="36" y="71" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="bold" className="font-bengali">গাওয়া ঘি</text>
              <text x="36" y="84" textAnchor="middle" fill="#B45309" fontSize="7.5" fontWeight="bold">100% PURE</text>
            </g>

            {/* Front Center: Glass Bowl of Mixed Nuts (Cashews, Almonds, Pistachios, Walnuts) */}
            <g transform="translate(245, 110)">
              {/* Nuts piled inside */}
              <ellipse cx="42" cy="24" rx="44" ry="18" fill="#92400E" />
              <ellipse cx="24" cy="20" rx="11" ry="6" transform="rotate(-15 24 20)" fill="#FDE68A" />
              <ellipse cx="42" cy="15" rx="12" ry="7" transform="rotate(10 42 15)" fill="#B45309" />
              <ellipse cx="60" cy="21" rx="11" ry="6" transform="rotate(20 60 21)" fill="#FDE68A" />
              <ellipse cx="32" cy="28" rx="10" ry="6" fill="#78350F" />
              <ellipse cx="50" cy="27" rx="12" ry="6" fill="#FCD34D" />
              <ellipse cx="18" cy="29" rx="9" ry="5" fill="#B45309" />
              <ellipse cx="66" cy="29" rx="9" ry="5" fill="#92400E" />
              {/* Translucent Glass Bowl */}
              <path
                d="M-4 24 Q-2 68 42 68 Q86 68 88 24 Z"
                fill="rgba(255, 255, 255, 0.42)"
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
              <ellipse cx="42" cy="24" rx="46" ry="9" fill="none" stroke="#FFFFFF" strokeWidth="2" />
              <ellipse cx="42" cy="67" rx="22" ry="4" fill="rgba(255,255,255,0.65)" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export const CategoryArt: React.FC<{ categoryId: string; imageUrl?: string }> = ({
  categoryId,
  imageUrl,
}) => {
  const [imgErr, setImgErr] = useState(false);
  if (imageUrl && !imgErr) {
    return (
      <img
        src={getFastImageUrl(imageUrl, 300)}
        alt={categoryId}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        onError={() => setImgErr(true)}
        className="w-full h-full object-contain"
      />
    );
  }
  switch (categoryId) {
    case 'combos':
      // 5 jars lined up matching Screenshot 2 "Combos"
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full">
          <ellipse cx="80" cy="104" rx="68" ry="7" fill="rgba(0,0,0,0.12)" />
          {/* Leftmost Red Jar */}
          <rect x="10" y="42" width="26" height="56" rx="4" fill="#DC2626" />
          <rect x="13" y="35" width="20" height="7" rx="2" fill="#F59E0B" />
          <rect x="12" y="56" width="22" height="26" rx="2" fill="#FEF2F2" />
          {/* Second Orange Jar */}
          <rect x="33" y="38" width="28" height="62" rx="5" fill="#EA580C" />
          <rect x="36" y="31" width="22" height="7" rx="2" fill="#FBBF24" />
          <rect x="35" y="54" width="24" height="28" rx="2" fill="#FFFBEB" />
          {/* Third Tall Center Golden Jar */}
          <rect x="97" y="36" width="28" height="64" rx="5" fill="#D97706" />
          <rect x="100" y="29" width="22" height="7" rx="2" fill="#E5E7EB" />
          <rect x="99" y="52" width="24" height="30" rx="2" fill="#FFFBEB" />
          {/* Far Right Brown Jar */}
          <rect x="122" y="42" width="26" height="56" rx="4" fill="#92400E" />
          <rect x="125" y="35" width="20" height="7" rx="2" fill="#D97706" />
          <rect x="124" y="56" width="22" height="26" rx="2" fill="#FFFBEB" />
          {/* Center Hero Jar */}
          <rect x="61" y="28" width="36" height="74" rx="6" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
          <rect x="65" y="20" width="28" height="9" rx="2" fill="#FBBF24" />
          <rect x="64" y="48" width="30" height="36" rx="2" fill="#FFFFFF" />
          <circle cx="79" cy="66" r="8" fill="#92400E" />
        </svg>
      );

    case 'dates':
      // Wooden bowl filled with glossy dates matching Screenshot 2 "Dates"
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full">
          <ellipse cx="80" cy="104" rx="48" ry="8" fill="rgba(0,0,0,0.15)" />
          {/* Dates mound */}
          <ellipse cx="52" cy="52" rx="16" ry="10" transform="rotate(-18 52 52)" fill="#451A03" />
          <ellipse cx="78" cy="44" rx="18" ry="11" fill="#5C2409" />
          <ellipse cx="105" cy="52" rx="16" ry="10" transform="rotate(18 105 52)" fill="#451A03" />
          <ellipse cx="64" cy="48" rx="15" ry="9" fill="#7C2D12" />
          <ellipse cx="94" cy="48" rx="15" ry="9" fill="#3B1504" />
          <ellipse cx="45" cy="60" rx="15" ry="9" fill="#5C2409" />
          <ellipse cx="68" cy="58" rx="17" ry="10" fill="#451A03" />
          <ellipse cx="92" cy="58" rx="17" ry="10" fill="#7C2D12" />
          <ellipse cx="114" cy="60" rx="15" ry="9" fill="#5C2409" />
          {/* Gloss highlights on dates */}
          <ellipse cx="76" cy="41" rx="7" ry="2" fill="#D97706" opacity="0.55" />
          <ellipse cx="66" cy="55" rx="7" ry="2" fill="#D97706" opacity="0.55" />
          <ellipse cx="94" cy="55" rx="6" ry="2" fill="#D97706" opacity="0.55" />
          {/* Wooden Bowl */}
          <path d="M26 60 Q28 104 80 104 Q132 104 134 60 Z" fill="#854D0E" stroke="#713F12" strokeWidth="2" />
          <path d="M32 68 Q80 82 128 68" stroke="#A16207" strokeWidth="3" fill="none" opacity="0.6" />
        </svg>
      );

    case 'flours-lentils':
      // Terracotta bowl with white flour on top of golden lentils matching Screenshot 2 "Flours & Lentils"
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full">
          {/* Pile of golden lentils at the base */}
          <ellipse cx="80" cy="92" rx="58" ry="16" fill="#D97706" />
          <ellipse cx="80" cy="90" rx="52" ry="13" fill="#F59E0B" />
          {/* Lentil texture dots */}
          <circle cx="42" cy="92" r="2.2" fill="#B45309" />
          <circle cx="55" cy="96" r="2.2" fill="#FEF3C7" />
          <circle cx="70" cy="98" r="2.2" fill="#B45309" />
          <circle cx="88" cy="97" r="2.2" fill="#FEF3C7" />
          <circle cx="106" cy="95" r="2.2" fill="#B45309" />
          <circle cx="118" cy="90" r="2.2" fill="#FEF3C7" />
          <circle cx="62" cy="92" r="2" fill="#92400E" />
          <circle cx="98" cy="92" r="2" fill="#92400E" />
          {/* Terracotta patterned bowl */}
          <path d="M34 50 Q36 88 80 88 Q124 88 126 50 Z" fill="#C2410C" stroke="#9A3412" strokeWidth="2" />
          {/* White traditional motifs on bowl */}
          <circle cx="54" cy="68" r="2.5" fill="#FED7AA" />
          <circle cx="80" cy="71" r="2.5" fill="#FED7AA" />
          <circle cx="106" cy="68" r="2.5" fill="#FED7AA" />
          {/* White flour mound in bowl */}
          <path d="M36 50 Q80 28 124 50 Q80 58 36 50 Z" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1.5" />
        </svg>
      );

    case 'honey-ghee':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full">
          <ellipse cx="80" cy="104" rx="52" ry="7" fill="rgba(0,0,0,0.12)" />
          <rect x="38" y="28" width="46" height="74" rx="10" fill="#D97706" stroke="#B45309" strokeWidth="1.5" />
          <rect x="45" y="18" width="32" height="10" rx="3" fill="#1F2937" />
          <rect x="42" y="48" width="38" height="36" rx="3" fill="#FFFBEB" />
          <text x="61" y="69" textAnchor="middle" fill="#92400E" fontSize="9" fontWeight="bold">HONEY</text>
          <rect x="82" y="40" width="42" height="62" rx="9" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
          <rect x="88" y="31" width="30" height="9" rx="2" fill="#B45309" />
          <rect x="86" y="58" width="34" height="28" rx="3" fill="#FFFBEB" />
          <text x="103" y="75" textAnchor="middle" fill="#78350F" fontSize="9" fontWeight="bold">GHEE</text>
        </svg>
      );

    case 'functional-food':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full">
          <ellipse cx="80" cy="104" rx="48" ry="7" fill="rgba(0,0,0,0.12)" />
          <rect x="48" y="18" width="64" height="84" rx="6" fill="#059669" />
          <rect x="55" y="32" width="50" height="54" rx="22" fill="#ECFDF5" />
          <ellipse cx="80" cy="68" rx="16" ry="8" fill="#10B981" />
          <text x="80" y="52" textAnchor="middle" fill="#065F46" fontSize="8" fontWeight="bold">MORINGA</text>
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full">
          <ellipse cx="80" cy="104" rx="48" ry="7" fill="rgba(0,0,0,0.12)" />
          <rect x="52" y="24" width="56" height="78" rx="12" fill="#F59E0B" />
          <rect x="66" y="14" width="28" height="10" rx="3" fill="#1F2937" />
          <rect x="57" y="46" width="46" height="38" rx="4" fill="#FFFBEB" />
          <text x="80" y="68" textAnchor="middle" fill="#92400E" fontSize="9" fontWeight="bold">PURE OIL</text>
        </svg>
      );
  }
};

export const ProductArt: React.FC<{
  artKey: string;
  imageUrl?: string;
  galleryUrls?: string[];
  viewIndex?: number;
  className?: string;
}> = ({ artKey, imageUrl, galleryUrls = [], viewIndex = 0, className = '' }) => {
  const [imgErr, setImgErr] = useState(false);

  // Determine if there is an uploaded image for this viewIndex
  const allUploadedUrls = [
    ...(imageUrl ? [imageUrl] : []),
    ...galleryUrls.filter((u) => Boolean(u) && u !== imageUrl),
  ];
  const candidateUrl = allUploadedUrls[viewIndex] || (viewIndex === 0 ? imageUrl : undefined);

  if (candidateUrl && !imgErr) {
    return (
      <img
        src={getFastImageUrl(candidateUrl, 600)}
        alt={artKey}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        onError={() => setImgErr(true)}
        className={`w-full h-full object-contain ${className}`}
      />
    );
  }

  // Second thumbnail view: Bowl / Texture close-up (exact match to Screenshot 4 thumbnail #2!)
  if (viewIndex === 1 && artKey !== 'galaxy-tab-s10') {
    const powderColor =
      artKey === 'moringa-powder'
        ? '#65A30D'
        : artKey === 'mashkalai-dal'
        ? '#D97706'
        : artKey === 'chia-seeds'
        ? '#374151'
        : artKey === 'pink-salt'
        ? '#FB7185'
        : '#F59E0B';
    const powderLight =
      artKey === 'moringa-powder'
        ? '#84CC16'
        : artKey === 'mashkalai-dal'
        ? '#FBBF24'
        : artKey === 'chia-seeds'
        ? '#6B7280'
        : artKey === 'pink-salt'
        ? '#FDA4AF'
        : '#FDE68A';

    return (
      <svg viewBox="0 0 240 240" className={`w-full h-full ${className}`}>
        <ellipse cx="120" cy="192" rx="68" ry="12" fill="rgba(0,0,0,0.12)" />
        {/* Conical heap inside bowl */}
        <path
          d="M56 122 Q120 55 184 122 Z"
          fill={powderColor}
        />
        <path
          d="M66 122 Q120 68 164 122 Z"
          fill={powderLight}
          opacity="0.7"
        />
        {/* Translucent glass bowl matching Screenshot 4 thumbnail 2 */}
        <path
          d="M46 120 Q52 188 120 188 Q188 188 194 120 Z"
          fill="rgba(255,255,255,0.48)"
          stroke="#D1D5DB"
          strokeWidth="3"
        />
        <ellipse cx="120" cy="120" rx="74" ry="12" fill="none" stroke="#E5E7EB" strokeWidth="2.5" />
        <ellipse cx="120" cy="187" rx="36" ry="5" fill="#E5E7EB" />
      </svg>
    );
  }

  // Third thumbnail view: Quality Seal & Nutrition Facts
  if (viewIndex === 2) {
    return (
      <svg viewBox="0 0 240 240" className={`w-full h-full ${className}`}>
        <rect x="36" y="24" width="168" height="192" rx="12" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="2" />
        <circle cx="120" cy="78" r="32" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" strokeDasharray="4 2" />
        <path d="M106 78 L116 88 L136 68" stroke="#059669" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="120" y="132" textAnchor="middle" fill="#111827" fontSize="13" fontWeight="bold">100% LAB TESTED</text>
        <text x="120" y="150" textAnchor="middle" fill="#059669" fontSize="11" fontWeight="bold">BSTI & ORGANIC CERTIFIED</text>
        <line x1="60" y1="165" x2="180" y2="165" stroke="#FDE68A" strokeWidth="1.5" />
        <text x="120" y="184" textAnchor="middle" fill="#78350F" fontSize="10" className="font-bengali">কোনো কৃত্রিম রঙ বা প্রিজারভেটিভ নেই</text>
        <text x="120" y="200" textAnchor="middle" fill="#92400E" fontSize="9">Direct Farm-to-Table Sourcing</text>
      </svg>
    );
  }

  switch (artKey) {
    case 'mashkalai-dal':
      // Exact match to Screenshot 2 & 3: "Organic Red Mashkalai Dal 1 Kg" clear packet with speckled lentils and cream/yellow label
      return (
        <svg viewBox="0 0 240 240" className={`w-full h-full ${className}`}>
          {/* Soft drop shadow */}
          <ellipse cx="120" cy="212" rx="72" ry="12" fill="rgba(0,0,0,0.16)" />
          {/* Clear plastic pouch outer sheen */}
          <rect x="52" y="28" width="136" height="180" rx="8" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="2" />
          {/* Speckled Mashkalai Dal filling inside packet */}
          <rect x="56" y="34" width="128" height="168" rx="6" fill="#C69C6D" />
          {/* Lentil grain pattern */}
          <g fill="#78350F" opacity="0.65">
            <circle cx="68" cy="48" r="3" /><circle cx="82" cy="44" r="2.5" /><circle cx="98" cy="50" r="3" />
            <circle cx="115" cy="45" r="2.5" /><circle cx="135" cy="48" r="3" /><circle cx="152" cy="44" r="2.5" />
            <circle cx="170" cy="50" r="3" /><circle cx="74" cy="60" r="2.5" /><circle cx="164" cy="64" r="3" />
            <circle cx="66" cy="95" r="3" /><circle cx="174" cy="98" r="3" /><circle cx="64" cy="128" r="2.5" />
            <circle cx="172" cy="134" r="3" /><circle cx="68" cy="168" r="3" /><circle cx="170" cy="172" r="2.5" />
            <circle cx="84" cy="186" r="3" /><circle cx="104" cy="190" r="2.5" /><circle cx="126" cy="188" r="3" />
            <circle cx="148" cy="192" r="2.5" /><circle cx="164" cy="188" r="3" />
          </g>
          <g fill="#FEF3C7" opacity="0.75">
            <circle cx="75" cy="52" r="2.5" /><circle cx="90" cy="47" r="2.5" /><circle cx="108" cy="52" r="2.5" />
            <circle cx="125" cy="46" r="2.5" /><circle cx="144" cy="51" r="2.5" /><circle cx="160" cy="47" r="2.5" />
            <circle cx="68" cy="112" r="2.5" /><circle cx="172" cy="115" r="2.5" /><circle cx="66" cy="150" r="2.5" />
            <circle cx="174" cy="154" r="2.5" /><circle cx="76" cy="192" r="2.5" /><circle cx="94" cy="185" r="2.5" />
            <circle cx="116" cy="193" r="2.5" /><circle cx="138" cy="186" r="2.5" /><circle cx="156" cy="192" r="2.5" />
          </g>
          {/* Center Cream & Yellow Product Label matching Screenshot 2 */}
          <rect x="74" y="64" width="92" height="114" rx="3" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1.5" />
          <path d="M74 64 L166 64 L166 96 Q120 108 74 96 Z" fill="#FDE68A" />
          {/* Green Organic Crest */}
          <circle cx="120" cy="78" r="9" fill="#15803D" />
          <path d="M116 78 L119 81 L125 75" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
          {/* Bengali Title on Label */}
          <text x="120" y="109" textAnchor="middle" fill="#B45309" fontSize="11" fontWeight="bold" className="font-bengali">
            মাসকলাই ডাল
          </text>
          {/* Circular window graphic on label */}
          <circle cx="120" cy="134" r="18" fill="#D97706" stroke="#F59E0B" strokeWidth="2" />
          <circle cx="114" cy="130" r="2" fill="#FEF3C7" />
          <circle cx="124" cy="136" r="2" fill="#78350F" />
          <circle cx="120" cy="126" r="2" fill="#78350F" />
          <circle cx="116" cy="139" r="2" fill="#FEF3C7" />
          {/* Barcode & Weight at bottom of label */}
          <rect x="82" y="160" width="26" height="10" fill="#1F2937" opacity="0.8" />
          <text x="144" y="168" textAnchor="middle" fill="#374151" fontSize="7.5" fontWeight="bold">1 KG</text>
          {/* Plastic bag glossy reflection lines */}
          <path d="M58 34 L68 202" stroke="rgba(255,255,255,0.45)" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'mustard-oil':
      // Exact match to Screenshot 2: "Pure Cold Pressed Mustard Oil" 5L bottle with black handle & golden oil
      return (
        <svg viewBox="0 0 240 240" className={`w-full h-full ${className}`}>
          <ellipse cx="122" cy="212" rx="58" ry="11" fill="rgba(0,0,0,0.18)" />
          {/* Black Carry Handle & Cap */}
          <path d="M88 32 L114 32" stroke="#1F2937" strokeWidth="4" strokeLinecap="round" />
          <rect x="110" y="22" width="24" height="16" rx="3" fill="#111827" />
          <rect x="108" y="36" width="28" height="6" rx="2" fill="#374151" />
          {/* Bottle Neck */}
          <path d="M104 42 L140 42 L156 66 L88 66 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
          {/* Main Golden Oil Bottle Body */}
          <rect x="78" y="64" width="88" height="144" rx="16" fill="#D97706" stroke="#B45309" strokeWidth="2" />
          {/* Inner Golden Glow */}
          <rect x="84" y="70" width="76" height="132" rx="12" fill="#F59E0B" />
          {/* Molded Ribs top & bottom */}
          <line x1="80" y1="84" x2="164" y2="84" stroke="#B45309" strokeWidth="2" />
          <line x1="80" y1="184" x2="164" y2="184" stroke="#B45309" strokeWidth="2" />
          {/* Front Label matching Screenshot 2 ("সরিষার তেল") */}
          <rect x="84" y="96" width="76" height="78" rx="4" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1.5" />
          {/* Yellow oil splash & mustard flower graphic on right of label */}
          <path d="M132 96 L160 96 L160 174 L124 174 Q142 135 132 96 Z" fill="#FACC15" />
          <path d="M144 122 C152 134, 136 146, 144 154 C152 146, 150 132, 144 122 Z" fill="#EA580C" />
          <text x="98" y="114" fill="#15803D" fontSize="9" fontWeight="bold" className="font-bengali">খাঁটি</text>
          <text x="112" y="134" textAnchor="middle" fill="#1F2937" fontSize="13.5" fontWeight="bold" className="font-bengali">
            সরিষার
          </text>
          <text x="106" y="150" textAnchor="middle" fill="#1F2937" fontSize="13.5" fontWeight="bold" className="font-bengali">
            তেল
          </text>
          <text x="106" y="165" textAnchor="middle" fill="#92400E" fontSize="6.5" fontWeight="bold">
            COLD PRESSED
          </text>
          {/* Gloss reflection */}
          <rect x="86" y="70" width="8" height="128" rx="4" fill="rgba(255,255,255,0.35)" />
        </svg>
      );

    case 'moringa-powder':
      // Exact match to Screenshot 3 & Screenshot 4: "Pure Moringa Leaf Powder" green stand-up pouch
      return (
        <svg viewBox="0 0 240 240" className={`w-full h-full ${className}`}>
          <ellipse cx="120" cy="214" rx="68" ry="10" fill="rgba(0,0,0,0.18)" />
          {/* Stand-up Green Pouch Body */}
          <path
            d="M54 22 L186 22 L182 208 Q120 214 58 208 Z"
            fill="#008744"
            stroke="#006B35"
            strokeWidth="2"
          />
          {/* Top Ziplock Seal Notch & Line */}
          <line x1="55" y1="34" x2="185" y2="34" stroke="#005A2B" strokeWidth="1.5" strokeDasharray="3 2" />
          {/* White / Cream Arch Center Label */}
          <path
            d="M68 68 Q68 42 120 42 Q172 42 172 68 L170 186 Q120 192 70 186 Z"
            fill="#F4FBF7"
          />
          {/* Top Orange Brand Badge ("আমার বাজার") */}
          <rect x="104" y="34" width="32" height="38" rx="2" fill="#F58220" />
          <path d="M114 44 Q120 38 126 44 Q120 50 114 44 Z" fill="#FFF" />
          <text x="120" y="57" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold" className="font-bengali">আমার</text>
          <text x="120" y="66" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold" className="font-bengali">বাজার</text>

          {/* Bengali & English Title */}
          <text x="120" y="90" textAnchor="middle" fill="#D97706" fontSize="16" fontWeight="bold" className="font-bengali">
            মরিঙ্গা পাউডার
          </text>
          <text x="120" y="103" textAnchor="middle" fill="#1F2937" fontSize="9.5" fontWeight="bold" letterSpacing="0.4">
            MORINGA POWDER
          </text>
          <text x="120" y="113" textAnchor="middle" fill="#374151" fontSize="6.5" fontWeight="bold" className="font-bengali">
            নিট ওজন : ৫০০ গ্রাম
          </text>

          {/* Green Powder Mound & White Ceramic Bowl */}
          <path d="M84 142 Q120 105 156 142 Z" fill="#15803D" />
          <path d="M90 142 Q120 112 148 142 Z" fill="#22C55E" opacity="0.75" />
          <path d="M82 140 Q86 168 120 168 Q154 168 158 140 Z" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1.5" />

          {/* Moringa Leaves Sprig at bottom right of bowl */}
          <g fill="#047857">
            <ellipse cx="132" cy="168" rx="6" ry="3.5" transform="rotate(-25 132 168)" />
            <ellipse cx="144" cy="164" rx="6" ry="3.5" transform="rotate(-25 144 164)" />
            <ellipse cx="154" cy="158" rx="6" ry="3.5" transform="rotate(-25 154 158)" />
            <ellipse cx="138" cy="174" rx="6" ry="3.5" transform="rotate(15 138 174)" />
            <ellipse cx="150" cy="169" rx="6" ry="3.5" transform="rotate(15 150 169)" />
          </g>

          {/* Bottom Banner Strip */}
          <path d="M60 182 Q120 188 180 182 L179 194 Q120 200 61 194 Z" fill="#ECFDF5" />
          <text x="120" y="191" textAnchor="middle" fill="#064E3B" fontSize="6.5" fontWeight="bold" className="font-bengali">
            সুপারফুড | পুষ্টিদায়ক | সুস্বাস্থ্যের সহায়ক
          </text>
        </svg>
      );

    case 'mustard-honey':
      // Exact match to Screenshot 3: "Pure Mustard Flower Honey" ribbed honey bottle + black box SUNDARBAN'S HONEY
      return (
        <svg viewBox="0 0 240 240" className={`w-full h-full ${className}`}>
          <ellipse cx="125" cy="208" rx="82" ry="12" fill="rgba(0,0,0,0.18)" />
          {/* Right: Luxury Black & Gold Box */}
          <g transform="translate(116, 36)">
            <polygon points="0,4 74,0 74,162 0,168" fill="#18181B" stroke="#27272A" strokeWidth="1" />
            <polygon points="74,0 94,10 94,164 74,162" fill="#27272A" />
            {/* Gold Honeycomb & Bee Crest */}
            <text x="37" y="20" textAnchor="middle" fill="#D4AF37" fontSize="7.5" fontWeight="bold">❖ HoneyRaj</text>
            <circle cx="46" cy="52" r="16" fill="#B45309" opacity="0.55" />
            <circle cx="46" cy="52" r="11" fill="#F59E0B" opacity="0.7" />
            <text x="37" y="88" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="bold">SUNDARBAN'S</text>
            <text x="37" y="100" textAnchor="middle" fill="#FBBF24" fontSize="9.5" fontWeight="bold">HONEY ¤</text>
            {/* Glowing golden dots */}
            <circle cx="22" cy="122" r="2" fill="#FBBF24" />
            <circle cx="38" cy="130" r="3" fill="#F59E0B" />
            <circle cx="54" cy="118" r="2.5" fill="#FBBF24" />
            <circle cx="28" cy="142" r="2" fill="#D97706" />
            <text x="37" y="156" textAnchor="middle" fill="#A1A1AA" fontSize="6">Net Weight: 500gm</text>
          </g>

          {/* Left: Ribbed Amber Honey Bottle */}
          <g transform="translate(34, 46)">
            {/* Black Cap */}
            <rect x="24" y="0" width="38" height="15" rx="3" fill="#18181B" />
            {/* Ribbed Honey Body */}
            <rect x="6" y="15" width="74" height="142" rx="22" fill="#B45309" stroke="#92400E" strokeWidth="2" />
            <rect x="12" y="20" width="62" height="132" rx="18" fill="#D97706" />
            {/* Horizontal Honey Bottle Ribs */}
            <line x1="8" y1="38" x2="78" y2="38" stroke="#92400E" strokeWidth="2" />
            <line x1="6" y1="52" x2="80" y2="52" stroke="#92400E" strokeWidth="2" />
            <line x1="6" y1="122" x2="80" y2="122" stroke="#92400E" strokeWidth="2" />
            <line x1="8" y1="136" x2="78" y2="136" stroke="#92400E" strokeWidth="2" />
            {/* Dark Arch Center Label */}
            <rect x="16" y="60" width="54" height="56" rx="8" fill="#18181B" stroke="#F59E0B" strokeWidth="1.2" />
            <circle cx="43" cy="78" r="10" fill="#F59E0B" />
            <text x="43" y="99" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="bold">SUNDARBAN</text>
            <text x="43" y="108" textAnchor="middle" fill="#FBBF24" fontSize="6.5" fontWeight="bold">HONEY</text>
          </g>
        </svg>
      );

    case 'gawa-ghee':
      return (
        <svg viewBox="0 0 240 240" className={`w-full h-full ${className}`}>
          <ellipse cx="120" cy="210" rx="64" ry="11" fill="rgba(0,0,0,0.16)" />
          <rect x="78" y="34" width="84" height="20" rx="4" fill="#92400E" stroke="#F59E0B" strokeWidth="1.5" />
          <rect x="64" y="54" width="112" height="152" rx="22" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
          <rect x="72" y="62" width="96" height="136" rx="16" fill="#FBBF24" />
          <rect x="72" y="90" width="96" height="82" rx="6" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
          <text x="120" y="114" textAnchor="middle" fill="#92400E" fontSize="12" fontWeight="bold" className="font-bengali">পাবনার ঐতিহ্যবাহী</text>
          <text x="120" y="138" textAnchor="middle" fill="#111827" fontSize="18" fontWeight="bold" className="font-bengali">খাঁটি গাওয়া ঘি</text>
          <text x="120" y="158" textAnchor="middle" fill="#B45309" fontSize="9.5" fontWeight="bold">100% GRASS-FED COW GHEE</text>
        </svg>
      );

    case 'ajwa-dates':
      return (
        <svg viewBox="0 0 240 240" className={`w-full h-full ${className}`}>
          <ellipse cx="120" cy="210" rx="74" ry="11" fill="rgba(0,0,0,0.16)" />
          <rect x="46" y="44" width="148" height="158" rx="10" fill="#451A03" stroke="#D97706" strokeWidth="2" />
          <rect x="56" y="54" width="128" height="138" rx="6" fill="#290F02" stroke="#B45309" strokeWidth="1" />
          <text x="120" y="82" textAnchor="middle" fill="#FBBF24" fontSize="14" fontWeight="bold">PREMIUM MADINAH</text>
          <text x="120" y="102" textAnchor="middle" fill="#FEF3C7" fontSize="16" fontWeight="bold" className="font-bengali">আজওয়া খেজুর</text>
          {/* Window showing dates */}
          <rect x="72" y="116" width="96" height="56" rx="8" fill="#78350F" stroke="#F59E0B" strokeWidth="1.5" />
          <ellipse cx="95" cy="136" rx="14" ry="8" fill="#3B1504" />
          <ellipse cx="122" cy="134" rx="15" ry="9" fill="#451A03" />
          <ellipse cx="148" cy="138" rx="14" ry="8" fill="#3B1504" />
          <ellipse cx="108" cy="152" rx="15" ry="9" fill="#5C2409" />
          <ellipse cx="136" cy="152" rx="15" ry="9" fill="#451A03" />
        </svg>
      );

    case 'chia-seeds':
      return (
        <svg viewBox="0 0 240 240" className={`w-full h-full ${className}`}>
          <ellipse cx="120" cy="212" rx="64" ry="10" fill="rgba(0,0,0,0.16)" />
          <path d="M58 26 L182 26 L176 206 Q120 212 64 206 Z" fill="#1F2937" stroke="#111827" strokeWidth="2" />
          <rect x="72" y="54" width="96" height="126" rx="8" fill="#FFFFFF" />
          <rect x="98" y="44" width="44" height="22" rx="4" fill="#10B981" />
          <text x="120" y="59" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">SUPERFOOD</text>
          <text x="120" y="88" textAnchor="middle" fill="#111827" fontSize="15" fontWeight="bold" className="font-bengali">অর্গানিক চিয়া সিড</text>
          <text x="120" y="103" textAnchor="middle" fill="#059669" fontSize="9.5" fontWeight="bold">ORGANIC CHIA SEEDS</text>
          <ellipse cx="120" cy="142" rx="32" ry="18" fill="#4B5563" />
          <circle cx="110" cy="138" r="1.8" fill="#E5E7EB" />
          <circle cx="122" cy="144" r="1.8" fill="#111827" />
          <circle cx="130" cy="136" r="1.8" fill="#E5E7EB" />
          <circle cx="116" cy="148" r="1.8" fill="#D1D5DB" />
        </svg>
      );

    case 'winter-combo':
      return (
        <svg viewBox="0 0 240 240" className={`w-full h-full ${className}`}>
          <ellipse cx="120" cy="210" rx="85" ry="12" fill="rgba(0,0,0,0.16)" />
          {/* Mustard Oil behind */}
          <rect x="38" y="54" width="52" height="138" rx="10" fill="#D97706" />
          <rect x="42" y="88" width="44" height="58" rx="3" fill="#FFFBEB" />
          <text x="64" y="120" textAnchor="middle" fill="#92400E" fontSize="8" fontWeight="bold" className="font-bengali">সরিষার তেল</text>
          {/* Moringa Pouch right */}
          <rect x="144" y="48" width="58" height="144" rx="6" fill="#059669" />
          <rect x="150" y="76" width="46" height="72" rx="16" fill="#ECFDF5" />
          <text x="173" y="114" textAnchor="middle" fill="#065F46" fontSize="8" fontWeight="bold" className="font-bengali">মরিঙ্গা</text>
          {/* Center Honey & Ghee Jars */}
          <rect x="78" y="68" width="56" height="132" rx="12" fill="#B45309" stroke="#F59E0B" strokeWidth="2" />
          <rect x="84" y="102" width="44" height="62" rx="4" fill="#FFFBEB" />
          <text x="106" y="132" textAnchor="middle" fill="#78350F" fontSize="9.5" fontWeight="bold" className="font-bengali">সুন্দরবন মধু</text>
          <rect x="118" y="96" width="48" height="104" rx="10" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
          <rect x="123" y="126" width="38" height="50" rx="3" fill="#FFFBEB" />
          <text x="142" y="154" textAnchor="middle" fill="#92400E" fontSize="9" fontWeight="bold" className="font-bengali">গাওয়া ঘি</text>
        </svg>
      );

    case 'galaxy-tab-s10':
      // Exact match to Screenshot 1's Samsung Galaxy Tab S10 WiFi (Moonstone Gray / Silver)
      return (
        <svg viewBox="0 0 240 240" className={`w-full h-full ${className}`}>
          <ellipse cx="120" cy="212" rx="76" ry="10" fill="rgba(0,0,0,0.18)" />
          {/* Back Tablet (Silver) */}
          <rect x="68" y="28" width="126" height="168" rx="10" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" />
          <circle cx="176" cy="46" r="5" fill="#1E293B" />
          <circle cx="176" cy="60" r="5" fill="#1E293B" />
          <line x1="176" y1="68" x2="176" y2="148" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          {/* Front Tablet Display (Moonstone Gray) */}
          <rect x="42" y="42" width="128" height="168" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="2.5" />
          <rect x="48" y="48" width="116" height="156" rx="6" fill="#0F172A" />
          {/* Dynamic AMOLED Wallpaper */}
          <path d="M48 90 Q106 55 164 110 L164 204 L48 204 Z" fill="#1D4ED8" opacity="0.55" />
          <path d="M48 135 Q110 105 164 155 L164 204 L48 204 Z" fill="#38BDF8" opacity="0.45" />
          <text x="106" y="88" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">Galaxy Tab S10</text>
          <text x="106" y="102" textAnchor="middle" fill="#93C5FD" fontSize="8">Dynamic AMOLED 2X • S Pen</text>
          {/* S-Pen Stylus */}
          <rect x="182" y="54" width="6" height="136" rx="3" transform="rotate(8 182 54)" fill="#334155" />
          <polygon points="166,188 169,198 172,189" fill="#94A3B8" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 240 240" className={`w-full h-full ${className}`}>
          <ellipse cx="120" cy="210" rx="64" ry="10" fill="rgba(0,0,0,0.15)" />
          <rect x="64" y="36" width="112" height="164" rx="14" fill="#F58220" />
          <rect x="76" y="68" width="88" height="100" rx="6" fill="#FFFBEB" />
          <text x="120" y="122" textAnchor="middle" fill="#92400E" fontSize="14" fontWeight="bold">ORGANIC</text>
        </svg>
      );
  }
};
