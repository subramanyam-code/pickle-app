import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { Package, ChevronRight, Loader2, ShoppingBag } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const OrdersPage: React.FC = () => {
  const { user, setShowAuthModal, setAuthMode } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Find customer by email
      const { data: customer } = await supabase
        .from('ecom_customers')
        .select('id')
        .eq('email', user.email)
        .single();

      if (customer) {
        const { data: ordersData } = await supabase
          .from('ecom_orders')
          .select('*, items:ecom_order_items(*)')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false });

        setOrders(ordersData || []);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-amber-50/30">
        <Header />
        <AuthModal />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 font-serif">Sign in to view orders</h2>
            <p className="text-gray-500 mt-2">Please sign in to see your order history.</p>
            <button
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
              className="mt-6 px-8 py-3 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/30">
      <Header />
      <AuthModal />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 font-serif mb-8">My Orders</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">No orders yet</h2>
            <p className="text-gray-500 mt-2">Start shopping to see your orders here.</p>
            <Link
              to="/collections/all-pickles"
              className="inline-flex items-center gap-2 mt-6 px-8 py-3 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors"
            >
              Browse Pickles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link
                key={order.id}
                to={`/order-confirmation/${order.id}`}
                className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-mono font-bold text-gray-900 text-sm">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                  </p>
                  <p className="font-bold text-green-800">${(order.total / 100).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default OrdersPage;
