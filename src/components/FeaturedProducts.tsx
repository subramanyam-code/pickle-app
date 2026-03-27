import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, Loader2 } from 'lucide-react';

const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestsellers = async () => {
      // Get bestsellers collection
      const { data: collection } = await supabase
        .from('ecom_collections')
        .select('id')
        .eq('handle', 'bestsellers')
        .single();

      if (collection) {
        const { data: productLinks } = await supabase
          .from('ecom_product_collections')
          .select('product_id, position')
          .eq('collection_id', collection.id)
          .order('position');

        if (productLinks && productLinks.length > 0) {
          const productIds = productLinks.map(pl => pl.product_id);
          const { data: productsData } = await supabase
            .from('ecom_products')
            .select('*, variants:ecom_product_variants(*)')
            .in('id', productIds)
            .eq('status', 'active');

          const sorted = productIds
            .map(id => productsData?.find(p => p.id === id))
            .filter(Boolean);
          setProducts(sorted as any[]);
        }
      }

      // Fallback: get any active products
      if (products.length === 0) {
        const { data } = await supabase
          .from('ecom_products')
          .select('*, variants:ecom_product_variants(*)')
          .eq('status', 'active')
          .limit(4);
        if (data) setProducts(data);
      }

      setLoading(false);
    };
    fetchBestsellers();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-100 rounded-lg w-48 animate-pulse mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl overflow-hidden">
                <div className="aspect-square bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 font-serif">Customer Favorites</h2>
            <p className="text-gray-600 mt-2">Our most loved pickles — tried, tested, and adored</p>
          </div>
          <Link
            to="/collections/bestsellers"
            className="hidden sm:inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold transition-colors"
          >
            View All
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="sm:hidden text-center mt-8">
          <Link
            to="/collections/bestsellers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors"
          >
            View All Bestsellers
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
