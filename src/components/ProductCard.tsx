import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, Flame, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  handle: string;
  description: string;
  price: number;
  images: string[];
  tags: string[];
  metadata: any;
  has_variants: boolean;
  variants?: any[];
}

const SpiceIndicator: React.FC<{ level: string }> = ({ level }) => {
  const levels: Record<string, { count: number; color: string }> = {
    'Mild': { count: 1, color: 'text-yellow-500' },
    'Medium': { count: 2, color: 'text-orange-500' },
    'Medium-Hot': { count: 3, color: 'text-orange-600' },
    'Hot': { count: 3, color: 'text-red-500' },
    'Extra Hot': { count: 4, color: 'text-red-600' },
    'Extreme': { count: 5, color: 'text-red-700' },
    'Varies': { count: 2, color: 'text-orange-500' },
  };

  const config = levels[level] || { count: 2, color: 'text-orange-500' };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: config.count }).map((_, i) => (
        <Flame key={i} className={`w-3.5 h-3.5 ${config.color} fill-current`} />
      ))}
      <span className="text-xs text-gray-500 ml-1">{level}</span>
    </div>
  );
};

// Shared star rating display component
export const StarRating: React.FC<{ rating: number; size?: string; showValue?: boolean; count?: number }> = ({
  rating,
  size = 'w-4 h-4',
  showValue = false,
  count,
}) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < Math.round(rating)
            ? 'text-amber-400 fill-amber-400'
            : 'text-gray-200'
        }`}
      />
    ))}
    {showValue && <span className="text-sm font-semibold text-gray-700 ml-1">{rating.toFixed(1)}</span>}
    {count !== undefined && <span className="text-xs text-gray-500 ml-0.5">({count})</span>}
  </div>
);

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);

  // Fetch average rating for this product
  useEffect(() => {
    const fetchRating = async () => {
      const { data } = await supabase
        .from('product_reviews')
        .select('rating')
        .eq('product_id', product.id);
      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAvgRating(avg);
        setReviewCount(data.length);
      }
    };
    fetchRating();
  }, [product.id]);

  // Get the lowest price from variants or use product price
  const getPrice = () => {
    if (product.variants && product.variants.length > 0) {
      const prices = product.variants.map((v: any) => v.price).filter(Boolean);
      return prices.length > 0 ? Math.min(...prices) : product.price;
    }
    return product.price;
  };

  const lowestPrice = getPrice();
  const hasMultiplePrices = product.variants && product.variants.length > 1;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.has_variants && product.variants && product.variants.length > 0) {
      const sorted = [...product.variants].sort((a, b) => (a.position || 0) - (b.position || 0));
      const firstVariant = sorted[0];
      addToCart({
        product_id: product.id,
        variant_id: firstVariant.id,
        name: product.name,
        variant_title: firstVariant.title,
        sku: firstVariant.sku || product.handle,
        price: firstVariant.price || product.price,
        image: product.images?.[0],
      });
    } else {
      addToCart({
        product_id: product.id,
        name: product.name,
        sku: product.handle,
        price: product.price,
        image: product.images?.[0],
      });
    }
  };

  const isBestseller = product.tags?.includes('bestseller');

  return (
    <Link
      to={`/product/${product.handle}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-amber-50">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isBestseller && (
            <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
              Bestseller
            </span>
          )}
          {product.tags?.includes('premium') && (
            <span className="px-2.5 py-1 bg-green-800 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
              Premium
            </span>
          )}
          {product.tags?.includes('limited') && (
            <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
              Limited
            </span>
          )}
        </div>

        {/* Quick add button */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-3 right-3 p-3 bg-green-700 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-green-800"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-xs text-green-600 font-medium uppercase tracking-wider mb-1">
            {product.metadata?.weight || (product as any).product_type}
          </p>
          <h3 className="font-semibold text-gray-900 group-hover:text-green-800 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Average Rating */}
          {avgRating !== null && (
            <div className="mt-1.5">
              <StarRating rating={avgRating} size="w-3.5 h-3.5" count={reviewCount} />
            </div>
          )}

          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-green-800">
              {hasMultiplePrices ? 'From ' : ''}${(lowestPrice / 100).toFixed(2)}
            </span>
          </div>
          {product.metadata?.spice_level && (
            <SpiceIndicator level={product.metadata.spice_level} />
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
