import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import ProductCard from '@/components/ProductCard';
import { Search, Loader2 } from 'lucide-react';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data } = await supabase
        .from('ecom_products')
        .select('*, variants:ecom_product_variants(*)')
        .eq('status', 'active')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,product_type.ilike.%${query}%`);

      setProducts(data || []);
      setLoading(false);
    };
    searchProducts();
  }, [query]);

  return (
    <div className="min-h-screen bg-amber-50/30">
      <Header />
      <AuthModal />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-serif">
            Search Results
          </h1>
          {query && (
            <p className="text-gray-600 mt-1">
              {loading ? 'Searching...' : `${products.length} result${products.length !== 1 ? 's' : ''} for "${query}"`}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">No pickles found</h2>
            <p className="text-gray-500 mt-2">Try a different search term or browse our collections.</p>
            <Link
              to="/collections/all-pickles"
              className="inline-block mt-6 px-8 py-3 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors"
            >
              Browse All Pickles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SearchPage;
