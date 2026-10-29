import React from 'react';
import { Flame, ShoppingCart, Check } from 'lucide-react';
import { Product } from '../data/products';
import { ProductArt } from './ProductArt';

interface ProductCardProps {
  product: Product;
  badgeType?: 'best-selling' | 'discount' | 'auto';
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, selectedVariants: Record<string, string>, unitPrice: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  badgeType = 'auto',
  onSelectProduct,
  onAddToCart,
}) => {
  const [justAdded, setJustAdded] = React.useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultVariants: Record<string, string> = {};
    product.variantGroups.forEach((group) => {
      if (group.options.length > 0) {
        defaultVariants[group.name] = group.options[0].label;
      }
    });
    onAddToCart(product, 1, defaultVariants, product.basePrice);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const showBestSelling =
    badgeType === 'best-selling' || (badgeType === 'auto' && product.isBestSelling);
  const showDiscount =
    badgeType === 'discount' || (badgeType === 'auto' && !product.isBestSelling && product.discountPercent);

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group relative bg-white rounded-lg border border-gray-100 shadow-[0_1px_5px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Top-Right Best Selling Badge matching Screenshot 2 & 3 */}
      {showBestSelling && (
        <div className="absolute top-0 right-0 z-10 bg-[#D90429] text-white text-[11px] font-semibold px-2.5 py-1 rounded-bl-md flex items-center gap-1 shadow-xs">
          <Flame className="w-3.5 h-3.5 fill-white text-white shrink-0" />
          <span className="whitespace-nowrap">Best Selling</span>
        </div>
      )}

      {/* Top-Left Discount Badge matching Screenshot 3 ("16% OFF", "4% OFF") */}
      {showDiscount && product.discountPercent && (
        <div className="absolute top-0 left-0 z-10 bg-[#16A34A] text-white text-[11px] font-bold px-2.5 py-1 rounded-br-md shadow-xs">
          <span className="whitespace-nowrap">{product.discountPercent}% OFF</span>
        </div>
      )}

      {/* Product Image Area */}
      <div className="w-full aspect-square p-3 sm:p-5 flex items-center justify-center bg-white group-hover:scale-[1.03] transition-transform duration-200">
        <ProductArt
          artKey={product.artKey}
          imageUrl={product.imageUrl}
          galleryUrls={product.galleryUrls}
          className="max-h-full max-w-full"
        />
      </div>

      {/* Card Body */}
      <div className="px-3 pb-3 sm:px-4 sm:pb-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-[13.5px] sm:text-[15px] font-bold text-[#111827] leading-snug line-clamp-2 min-h-[2.4rem] group-hover:text-[#F58220] transition-colors">
            {product.name}
          </h3>

          {/* Price Row matching Screenshot 3 */}
          <div className="mt-2 mb-3 flex items-baseline gap-2 flex-wrap">
            {product.oldPriceDisplay && (
              <span className="text-[13px] sm:text-[14px] text-[#FDBA74] line-through font-semibold font-mono-num">
                {product.oldPriceDisplay}
              </span>
            )}
            <span className="text-[14px] sm:text-[15.5px] font-bold text-[#F58220] font-mono-num">
              {product.priceDisplay}
            </span>
          </div>
        </div>

        {/* Outlined Add to Cart Button matching Screenshot 3 */}
        <button
          type="button"
          onClick={handleQuickAdd}
          className={`w-full py-2 px-3 rounded-[4px] border text-[13px] sm:text-[14px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            justAdded
              ? 'bg-[#16A34A] border-[#16A34A] text-white'
              : 'bg-white border-[#F59E0B] text-[#F58220] hover:bg-[#F58220] hover:text-white active:scale-[0.99]'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4 shrink-0" />
              <span>Added to Cart</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
