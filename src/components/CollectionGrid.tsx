import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ArrowRight } from 'lucide-react';

// Collection card images based on handle
const collectionImages: Record<string, string> = {
  'mango-pickles': 'https://d64gsuwffb70l.cloudfront.net/69c4c665978d2984325b4c28_1774503707810_ca6bb9b4.png',
  'lemon-pickles': 'https://d64gsuwffb70l.cloudfront.net/69c4c665978d2984325b4c28_1774503787496_dc1e3633.png',
  'spicy-mixed': 'https://d64gsuwffb70l.cloudfront.net/69c4c665978d2984325b4c28_1774503822582_9bd826b1.jpg',
  'bestsellers': 'https://d64gsuwffb70l.cloudfront.net/69c4c665978d2984325b4c28_1774503703714_3b135db9.jpg',
  'gift-sets': 'https://d64gsuwffb70l.cloudfront.net/69c4c665978d2984325b4c28_1774503826453_9c457155.jpg',
  'all-pickles': 'https://d64gsuwffb70l.cloudfront.net/69c4c665978d2984325b4c28_1774503667078_86881ea9.png',
};

const CollectionGrid: React.FC = () => {
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    const fetchCollections = async () => {
      const { data } = await supabase
        .from('ecom_collections')
        .select('*')
        .eq('is_visible', true)
        .order('title');
      if (data) {
        // Filter out "All Pickles" from the grid
        setCollections(data.filter(c => c.handle !== 'all-pickles'));
      }
    };
    fetchCollections();
  }, []);

  if (collections.length === 0) return null;

  return (
    <section className="py-16 bg-amber-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 font-serif">Shop by Category</h2>
          <p className="text-gray-600 mt-2">Explore our handcrafted pickle collections</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(collection => (
            <Link
              key={collection.id}
              to={`/collections/${collection.handle}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <img
                src={collectionImages[collection.handle] || collectionImages['all-pickles']}
                alt={collection.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-bold text-white font-serif">{collection.title}</h3>
                {collection.description && (
                  <p className="text-white/80 text-sm mt-1 line-clamp-2">{collection.description}</p>
                )}
                <div className="mt-3 inline-flex items-center gap-2 text-amber-300 text-sm font-medium group-hover:gap-3 transition-all">
                  Shop Now
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionGrid;
