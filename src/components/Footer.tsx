import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Mail, MapPin, Phone, Send, Leaf } from 'lucide-react';
import { toast } from 'sonner';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    const fetchCollections = async () => {
      const { data } = await supabase
        .from('ecom_collections')
        .select('id, title, handle')
        .eq('is_visible', true)
        .order('title');
      if (data) setCollections(data);
    };
    fetchCollections();
  }, []);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success('Welcome to the family!', {
        description: 'You\'ll receive our latest pickle news and offers.',
      });
      setEmail('');
    }
  };

  return (
    <footer className="bg-green-950 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold font-serif">Join Our Pickle Family</h3>
              <p className="text-green-300 mt-1 text-sm">
                Get exclusive recipes, early access to new flavors, and 10% off your first order.
              </p>
            </div>
            <form onSubmit={handleNewsletter} className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-4 py-3 bg-green-900 border border-green-700 rounded-lg text-white placeholder-green-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg font-serif">G</span>
              </div>
              <div>
                <h4 className="font-bold font-serif">Grandma's Kitchen</h4>
                <p className="text-[10px] text-green-400 tracking-widest uppercase">Artisanal Pickles</p>
              </div>
            </div>
            <p className="text-green-300 text-sm leading-relaxed">
              Handcrafted with love using traditional family recipes passed down through generations.
              Every jar tells a story of authentic flavors and time-honored techniques.
            </p>
            <div className="flex items-center gap-2 mt-4 text-green-400 text-xs">
              <Leaf className="w-4 h-4" />
              <span>100% Natural Ingredients</span>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2.5">
              {collections.map(col => (
                <li key={col.id}>
                  <Link
                    to={`/collections/${col.handle}`}
                    className="text-green-300 hover:text-white transition-colors text-sm"
                  >
                    {col.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className="text-green-300 hover:text-white transition-colors text-sm">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-green-300 hover:text-white transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-green-300 hover:text-white transition-colors text-sm">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-green-300 hover:text-white transition-colors text-sm">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-green-300 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-green-300 hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-green-300 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>123 Pickle Lane, Farmville, CA 94102</span>
              </li>
              <li className="flex items-center gap-3 text-green-300 text-sm">
                <Phone className="w-4 h-4 shrink-0" />
                <span>(555) 123-PICK</span>
              </li>
              <li className="flex items-center gap-3 text-green-300 text-sm">
                <Mail className="w-4 h-4 shrink-0" />
                <span>hello@grandmaskitchen.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-green-400">
            <p>&copy; {new Date().getFullYear()} Grandma's Kitchen Pickles. All rights reserved.</p>
            <p>Made with love in small batches</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
