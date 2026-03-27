import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import ProductCard from '@/components/ProductCard';
import { ChevronRight, SlidersHorizontal, Loader2 } from 'lucide-react';

const CollectionPage: React.FC = () => {
  const { handle } = useParams<{ handle: string }>();
  const [collection, setCollection] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('manual');
  const [filterSpice, setFilterSpice] = useState('all');

  useEffect(() => {
    const fetchCollectionProducts = async () => {
      if (!handle) return;
      setLoading(true);

      // Step 1: Get collection info
      const { data: collectionData } = await supabase
        .from('ecom_collections')
        .select('*')
        .eq('handle', handle)
        .single();

      if (!collectionData) {
        setLoading(false);
        return;
      }
      setCollection(collectionData);

      // Step 2: Get product IDs for this collection
      const { data: productLinks } = await supabase
        .from('ecom_product_collections')
        .select('product_id, position')
        .eq('collection_id', collectionData.id)
        .order('position');

      if (!productLinks || productLinks.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // Step 3: Fetch products by IDs
      const productIds = productLinks.map(pl => pl.product_id);
      const { data: productsData } = await supabase
        .from('ecom_products')
        .select('*, variants:ecom_product_variants(*)')
        .in('id', productIds)
        .eq('status', 'active');

      // Sort by collection position order
      const sortedProducts = productIds
        .map(id => productsData?.find(p => p.id === id))
        .filter(Boolean);

      setProducts(sortedProducts as any[]);
      setLoading(false);
    };

    fetchCollectionProducts();
  }, [handle]);

  // Sort products
  const getSortedProducts = () => {
    let filtered = [...products];

    // Filter by spice level
    if (filterSpice !== 'all') {
      filtered = filtered.filter(p => p.metadata?.spice_level === filterSpice);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return filtered;
  };

  const sortedProducts = getSortedProducts();
  const spiceLevels = ['all', ...new Set(products.map(p => p.metadata?.spice_level).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50/30">
        <Header />
        <AuthModal />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="h-8 bg-gray-100 rounded-lg w-48 animate-pulse mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden">
                <div className="aspect-square bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-amber-50/30">
        <Header />
        <AuthModal />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Collection not found</h2>
          <Link to="/" className="mt-4 inline-block text-green-700 hover:underline">
            Return to Home
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

      {/* Collection Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <nav className="flex items-center gap-2 text-sm text-green-200 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{collection.title}</span>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-bold font-serif">{collection.title}</h1>
          {collection.description && (
            <p className="mt-2 text-green-100 max-w-2xl">{collection.description}</p>
          )}
          <p className="mt-3 text-green-200 text-sm">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-gray-500" />
            <div className="flex flex-wrap gap-2">
              {spiceLevels.map(level => (
                <button
                  key={level}
                  onClick={() => setFilterSpice(level)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filterSpice === level
                      ? 'bg-green-700 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
                  }`}
                >
                  {level === 'all' ? 'All' : level}
                </button>
              ))}
            </div>
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="manual">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No products match your filters.</p>
            <button
              onClick={() => setFilterSpice('all')}
              className="mt-4 text-green-700 hover:underline font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CollectionPage;
