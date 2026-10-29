import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw, Search } from 'lucide-react';
import { CategoryItem, Product } from '../data/products';
import { CategoryArt } from './ProductArt';
import { ProductCard } from './ProductCard';

interface BrowseCategoryViewProps {
  products: Product[];
  categories: CategoryItem[];
  selectedCategory: string;
  searchQuery: string;
  onlyOrganicCertified: boolean;
  onSelectCategory: (catId: string) => void;
  onSearchChange: (q: string) => void;
  onToggleOrganicCertified: (val: boolean) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedVariants: Record<string, string>,
    unitPrice: number
  ) => void;
}

export const BrowseCategoryView: React.FC<BrowseCategoryViewProps> = ({
  products,
  categories,
  selectedCategory,
  searchQuery,
  onlyOrganicCertified,
  onSelectCategory,
  onSearchChange,
  onToggleOrganicCertified,
  onSelectProduct,
  onAddToCart,
}) => {
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'discount'>('popular');
  const [maxPrice, setMaxPrice] = useState<number>(100000);

  const filteredProducts = React.useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (onlyOrganicCertified && !p.isOrganicCertified) return false;
        if (p.basePrice > maxPrice) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBn = p.bengaliSub?.toLowerCase().includes(q);
          const matchCat = p.categoriesList.toLowerCase().includes(q);
          return matchName || matchBn || matchCat;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
        if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
        if (sortBy === 'discount') return (b.discountPercent || 0) - (a.discountPercent || 0);
        return (b.isBestSelling ? 1 : 0) - (a.isBestSelling ? 1 : 0);
      });
  }, [products, selectedCategory, onlyOrganicCertified, maxPrice, searchQuery, sortBy]);

  const handleResetFilters = () => {
    onSelectCategory('all');
    onSearchChange('');
    onToggleOrganicCertified(false);
    setMaxPrice(100000);
    setSortBy('popular');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Top Category Visual Strip */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg sm:text-2xl font-bold text-[#111827]">
            Browse All Categories & Products
          </h1>
          <span className="text-xs sm:text-sm text-gray-500 font-mono-num">
            Showing {filteredProducts.length} items
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3.5">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(isActive ? 'all' : cat.id)}
                className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center ${
                  isActive
                    ? 'bg-orange-50/80 border-[#F58220] ring-1 ring-[#F58220]/30 shadow-xs'
                    : 'bg-white border-gray-100 hover:border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
                }`}
              >
                <div className="w-16 h-12 sm:w-20 sm:h-14 mb-1.5">
                  <CategoryArt categoryId={cat.artKey || cat.id} imageUrl={cat.imageUrl} />
                </div>
                <span className="text-xs sm:text-[13px] font-bold text-[#111827] whitespace-nowrap truncate max-w-full">
                  {cat.name}
                </span>
                <span className="text-[10px] text-gray-500 font-bengali">{cat.bengaliName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout: Desktop Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-4 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2 font-bold text-sm text-gray-900">
              <SlidersHorizontal className="w-4 h-4 text-[#F58220]" />
              <span>Filter Products</span>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-[#F58220] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Category List */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
              Category
            </h3>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => onSelectCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#111827] text-white font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>All Categories</span>
                <span className="font-mono-num text-xs opacity-75">{products.length}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#F58220] text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="font-bengali text-[11px] opacity-80">{cat.bengaliName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Collection Filter */}
          <div className="pt-3 border-t border-gray-100">
            <label className="flex items-center gap-2.5 text-sm font-medium text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyOrganicCertified}
                onChange={(e) => onToggleOrganicCertified(e.target.checked)}
                className="w-4 h-4 accent-[#16A34A] rounded cursor-pointer"
              />
              <span>Organic Certified Only</span>
            </label>
          </div>

          {/* Sort Order */}
          <div className="pt-3 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Sort By
            </h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:border-[#F58220]"
            >
              <option value="popular">Top Selling / Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Highest Discount (%)</option>
            </select>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No Matching Products Found</h3>
              <p className="text-xs text-gray-500 mt-1">
                Try clearing your search query or switching to "All Categories".
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 px-5 py-2 bg-[#F58220] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  badgeType={onlyOrganicCertified ? 'discount' : 'auto'}
                  onSelectProduct={onSelectProduct}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
