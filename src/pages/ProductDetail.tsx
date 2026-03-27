import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { StarRating } from '@/components/ProductCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { Minus, Plus, ShoppingBag, Truck, Shield, Leaf, ChevronRight, Flame, Star, Loader2, MessageSquarePlus, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

const ProductDetail: React.FC = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();

  // Review state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, text: '' });

  // Fetch reviews
  const fetchReviews = useCallback(async (productId: string) => {
    setReviewsLoading(true);
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    setReviews(data || []);
    setReviewsLoading(false);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!handle) return;
      setSelectedVariant(null);
      setSelectedSize('');
      setQuantity(1);
      setRatingFilter(null);
      setLoading(true);

      const { data } = await supabase
        .from('ecom_products')
        .select('*, variants:ecom_product_variants(*)')
        .eq('handle', handle)
        .single();

      if (data) {
        let variants = data.variants || [];
        if (data.has_variants && variants.length === 0) {
          const { data: variantData } = await supabase
            .from('ecom_product_variants')
            .select('*')
            .eq('product_id', data.id)
            .order('position');
          variants = variantData || [];
          data.variants = variants;
        }

        setProduct(data);
        fetchReviews(data.id);

        if (variants.length > 0) {
          const sorted = [...variants].sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
          const firstInStock = sorted.find((v: any) => v.inventory_qty == null || v.inventory_qty > 0) || sorted[0];
          setSelectedVariant(firstInStock);
          setSelectedSize(firstInStock?.option1 || '');
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [handle, fetchReviews]);

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    const variant = product?.variants?.find((v: any) =>
      v.option1 === size || v.title?.toLowerCase().includes(size.toLowerCase())
    );
    if (variant) setSelectedVariant(variant);
  };

  const variantSizes = [...new Set(product?.variants?.map((v: any) => v.option1).filter(Boolean) || [])];
  const hasVariants = product?.has_variants && product?.variants?.length > 0;

  const getInStock = (): boolean => {
    if (selectedVariant) {
      if (selectedVariant.inventory_qty == null) return true;
      return selectedVariant.inventory_qty > 0;
    }
    if (product?.variants?.length > 0) {
      return product.variants.some((v: any) => v.inventory_qty == null || v.inventory_qty > 0);
    }
    if (product?.has_variants) return true;
    if (product?.inventory_qty == null) return true;
    return product.inventory_qty > 0;
  };
  const inStock = getInStock();

  const handleAddToCart = () => {
    if (!product) return;
    if (hasVariants && !selectedSize) return;
    if (!inStock) return;

    addToCart({
      product_id: product.id,
      variant_id: selectedVariant?.id || undefined,
      name: product.name,
      variant_title: selectedVariant?.title || selectedSize || undefined,
      sku: selectedVariant?.sku || product.sku || product.handle,
      price: selectedVariant?.price || product.price,
      image: product.images?.[0],
    }, quantity);
  };

  const currentPrice = selectedVariant?.price || product?.price || 0;

  // Review calculations
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: reviews.filter(rev => rev.rating === r).length,
  }));

  const filteredReviews = ratingFilter
    ? reviews.filter(r => r.rating === ratingFilter)
    : reviews;

  // Submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewForm.name.trim() || !reviewForm.text.trim()) return;

    setSubmittingReview(true);
    const { error } = await supabase.from('product_reviews').insert({
      product_id: product.id,
      reviewer_name: reviewForm.name.trim(),
      rating: reviewForm.rating,
      review_text: reviewForm.text.trim(),
    });

    if (error) {
      toast.error('Failed to submit review. Please try again.');
    } else {
      toast.success('Review submitted! Thank you for your feedback.');
      setReviewForm({ name: '', rating: 5, text: '' });
      setShowReviewForm(false);
      fetchReviews(product.id);
    }
    setSubmittingReview(false);
  };

  const SpiceIndicator: React.FC<{ level: string }> = ({ level }) => {
    const levels: Record<string, number> = {
      'Mild': 1, 'Medium': 2, 'Medium-Hot': 3, 'Hot': 3, 'Extra Hot': 4, 'Extreme': 5, 'Varies': 2,
    };
    const count = levels[level] || 2;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Flame key={i} className={`w-5 h-5 ${i < count ? 'text-red-500 fill-red-500' : 'text-gray-200'}`} />
        ))}
        <span className="text-sm text-gray-600 ml-2 font-medium">{level}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50/30">
        <Header />
        <AuthModal />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
              <div className="h-6 bg-gray-100 rounded-lg w-1/4 animate-pulse" />
              <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-amber-50/30">
        <Header />
        <AuthModal />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
          <Link to="/collections/all-pickles" className="mt-4 inline-block text-green-700 hover:underline">
            Browse all pickles
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/30">
      <Header />
      <AuthModal />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-green-700 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/collections/all-pickles" className="hover:text-green-700 transition-colors">Shop</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm">
              <img
                src={product.images?.[activeImage] || product.images?.[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === i ? 'border-green-600 shadow-md' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {product.tags?.includes('bestseller') && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full">
                  Bestseller
                </span>
              )}
              {product.tags?.includes('premium') && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider rounded-full">
                  Premium
                </span>
              )}
              {product.tags?.includes('limited') && (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider rounded-full">
                  Limited Edition
                </span>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 font-serif">{product.name}</h1>

            {/* Average rating summary under title */}
            {reviews.length > 0 && (
              <button
                onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-2 flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <StarRating rating={avgRating} size="w-4 h-4" showValue />
                <span className="text-sm text-gray-500 underline underline-offset-2">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </button>
            )}

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-green-800">
                ${(currentPrice / 100).toFixed(2)}
              </span>
              {hasVariants && selectedVariant && (
                <span className="text-sm text-gray-500">/ {selectedVariant.title}</span>
              )}
            </div>

            {product.metadata?.spice_level && (
              <div className="mt-4">
                <SpiceIndicator level={product.metadata.spice_level} />
              </div>
            )}

            <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>

            {/* Size Selector */}
            {(hasVariants || variantSizes.length > 0) && (
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Select Size</label>
                <div className="flex flex-wrap gap-2">
                  {variantSizes.map((size: string) => {
                    const variant = product.variants?.find((v: any) => v.option1 === size);
                    const sizeInStock = variant ? (variant.inventory_qty == null || variant.inventory_qty > 0) : true;
                    return (
                      <button
                        key={size}
                        onClick={() => sizeInStock && handleSizeSelect(size)}
                        disabled={!sizeInStock}
                        className={`px-5 py-3 border-2 rounded-xl font-medium transition-all text-sm ${
                          selectedSize === size
                            ? 'bg-green-700 text-white border-green-700 shadow-md'
                            : sizeInStock
                            ? 'border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50'
                            : 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                        }`}
                      >
                        {size}
                        {variant && (
                          <span className="block text-xs mt-0.5 opacity-75">${(variant.price / 100).toFixed(2)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Quantity</label>
              <div className="inline-flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-3 font-semibold text-gray-900 min-w-[60px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={(hasVariants && !selectedSize) || !inStock}
              className="mt-6 w-full py-4 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg shadow-green-700/20 hover:shadow-green-700/30"
            >
              <ShoppingBag className="w-5 h-5" />
              {!inStock ? 'Out of Stock' : hasVariants && !selectedSize ? 'Select a Size' : 'Add to Cart'}
            </button>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center p-3 bg-green-50 rounded-xl">
                <Truck className="w-5 h-5 text-green-700 mb-1" />
                <span className="text-xs text-green-800 font-medium">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-green-50 rounded-xl">
                <Shield className="w-5 h-5 text-green-700 mb-1" />
                <span className="text-xs text-green-800 font-medium">Quality Guaranteed</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-green-50 rounded-xl">
                <Leaf className="w-5 h-5 text-green-700 mb-1" />
                <span className="text-xs text-green-800 font-medium">All Natural</span>
              </div>
            </div>

            {/* Product Details */}
            {product.metadata && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
                <dl className="grid grid-cols-2 gap-3">
                  {product.metadata.weight && (
                    <>
                      <dt className="text-sm text-gray-500">Weight</dt>
                      <dd className="text-sm font-medium text-gray-900">{product.metadata.weight}</dd>
                    </>
                  )}
                  {product.metadata.shelf_life && (
                    <>
                      <dt className="text-sm text-gray-500">Shelf Life</dt>
                      <dd className="text-sm font-medium text-gray-900">{product.metadata.shelf_life}</dd>
                    </>
                  )}
                  {product.metadata.ingredients && (
                    <>
                      <dt className="text-sm text-gray-500">Ingredients</dt>
                      <dd className="text-sm font-medium text-gray-900 col-span-1">{product.metadata.ingredients}</dd>
                    </>
                  )}
                  {product.metadata.allergens && (
                    <>
                      <dt className="text-sm text-gray-500">Allergens</dt>
                      <dd className="text-sm font-medium text-red-600">{product.metadata.allergens}</dd>
                    </>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* ===================== REVIEWS SECTION ===================== */}
        <div id="reviews-section" className="mt-16 border-t border-gray-200 pt-12">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left: Rating Summary + Filter */}
            <div className="lg:w-72 shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 font-serif mb-6">Customer Reviews</h2>

              {reviews.length > 0 ? (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="text-center mb-4">
                    <p className="text-5xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                    <div className="flex justify-center mt-2">
                      <StarRating rating={avgRating} size="w-5 h-5" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Rating breakdown bars */}
                  <div className="space-y-2 mt-5">
                    {ratingCounts.map(({ rating, count }) => {
                      const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <button
                          key={rating}
                          onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                          className={`w-full flex items-center gap-2 group py-1 rounded transition-colors ${
                            ratingFilter === rating ? 'bg-amber-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-sm font-medium text-gray-600 w-4 text-right">{rating}</span>
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                        </button>
                      );
                    })}
                  </div>

                  {ratingFilter && (
                    <button
                      onClick={() => setRatingFilter(null)}
                      className="mt-4 w-full text-sm text-green-700 hover:text-green-800 font-medium flex items-center justify-center gap-1"
                    >
                      <Filter className="w-3.5 h-3.5" />
                      Clear filter ({filteredReviews.length} of {reviews.length})
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                  <Star className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
                </div>
              )}

              {/* Write a review button */}
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="mt-4 w-full py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Write a Review
              </button>
            </div>

            {/* Right: Review Form + Review List */}
            <div className="flex-1 min-w-0">
              {/* Review Form */}
              {showReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  className="bg-white rounded-2xl p-6 border border-green-200 shadow-sm mb-8 animate-in slide-in-from-top-2 duration-300"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">Write Your Review</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        value={reviewForm.name}
                        onChange={e => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                star <= reviewForm.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-200 hover:text-amber-200'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-500 self-center">
                          {reviewForm.rating === 1 && 'Poor'}
                          {reviewForm.rating === 2 && 'Fair'}
                          {reviewForm.rating === 3 && 'Good'}
                          {reviewForm.rating === 4 && 'Very Good'}
                          {reviewForm.rating === 5 && 'Excellent'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                      <textarea
                        value={reviewForm.text}
                        onChange={e => setReviewForm(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Share your experience with this pickle..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm resize-none"
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                      >
                        {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                        Submit Review
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Review List */}
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <p className="text-gray-500">
                    {ratingFilter
                      ? `No ${ratingFilter}-star reviews yet.`
                      : 'No reviews yet. Be the first to share your thoughts!'}
                  </p>
                  {ratingFilter && (
                    <button
                      onClick={() => setRatingFilter(null)}
                      className="mt-2 text-green-700 hover:underline text-sm font-medium"
                    >
                      Show all reviews
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {ratingFilter && (
                    <p className="text-sm text-gray-500 mb-2">
                      Showing {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} with {ratingFilter} star{ratingFilter !== 1 ? 's' : ''}
                    </p>
                  )}
                  {filteredReviews.map(review => (
                    <div
                      key={review.id}
                      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-green-800 font-bold text-sm">
                              {review.reviewer_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{review.reviewer_name}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(review.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} size="w-4 h-4" />
                      </div>
                      <p className="mt-3 text-gray-700 text-sm leading-relaxed">{review.review_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
