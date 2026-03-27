import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { Loader2, Lock, ShoppingBag, Truck, ArrowLeft } from 'lucide-react';

const PROJECT_ID = window.location.hostname.split('.')[0];

// Stripe setup
const STRIPE_ACCOUNT_ID = 'STRIPE_ACCOUNT_ID';
const stripePromise = STRIPE_ACCOUNT_ID && STRIPE_ACCOUNT_ID !== 'STRIPE_ACCOUNT_ID'
  ? loadStripe('pk_live_51OJhJBHdGQpsHqInIzu7c6PzGPSH0yImD4xfpofvxvFZs0VFhPRXZCyEgYkkhOtBOXFWvssYASs851mflwQvjnrl00T6DbUwWZ', { stripeAccount: STRIPE_ACCOUNT_ID })
  : null;

const SHIPPING_RULES = "Free shipping on all orders";

// Payment Form Component
const PaymentForm: React.FC<{ onSuccess: (pi: any) => void; total: number }> = ({ onSuccess, total }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full mt-6 py-4 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay ${(total / 100).toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
};

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [clientSecret, setClientSecret] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [tax, setTax] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [calculatingTax, setCalculatingTax] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  const subtotal = cartTotal;
  const total = subtotal + shippingCost + tax;

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // Calculate shipping
  useEffect(() => {
    if (cart.length === 0) return;
    const calcShipping = async () => {
      const { data } = await supabase.functions.invoke('calculate-shipping', {
        body: {
          cartItems: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingRules: SHIPPING_RULES,
          subtotal,
        },
      });
      if (data?.success) setShippingCost(data.shippingCents);
    };
    calcShipping();
  }, [cart, subtotal]);

  // Calculate tax when state changes
  const calculateTax = async (state: string) => {
    if (!state) return;
    setCalculatingTax(true);
    const { data } = await supabase.functions.invoke('calculate-tax', {
      body: { state, subtotal },
    });
    if (data?.success) {
      setTax(data.taxCents);
      setTaxRate(data.taxRate);
    }
    setCalculatingTax(false);
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const required = ['name', 'email', 'address', 'city', 'state', 'zip'];
    for (const field of required) {
      if (!shippingAddress[field as keyof typeof shippingAddress]?.trim()) {
        return;
      }
    }

    // Calculate tax if not done
    if (tax === 0 && shippingAddress.state) {
      await calculateTax(shippingAddress.state);
    }

    // Create payment intent
    const finalTotal = subtotal + shippingCost + tax;
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: { amount: finalTotal > 0 ? finalTotal : subtotal, currency: 'usd' },
    });

    if (error || !data?.clientSecret) {
      setPaymentError('Unable to initialize payment. Please try again.');
      setStep('payment');
      return;
    }

    setClientSecret(data.clientSecret);
    setStep('payment');
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
      // Create or find customer
      const { data: customer } = await supabase
        .from('ecom_customers')
        .upsert(
          { email: shippingAddress.email.toLowerCase(), name: shippingAddress.name },
          { onConflict: 'email' }
        )
        .select('id')
        .single();

      // Create order
      const { data: order } = await supabase
        .from('ecom_orders')
        .insert({
          customer_id: customer?.id,
          status: 'paid',
          subtotal,
          tax,
          shipping: shippingCost,
          total: subtotal + shippingCost + tax,
          shipping_address: shippingAddress,
          stripe_payment_intent_id: paymentIntent.id,
        })
        .select('id')
        .single();

      if (order) {
        // Create order items
        const orderItems = cart.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          product_name: item.name,
          variant_title: item.variant_title || null,
          sku: item.sku || null,
          quantity: item.quantity,
          unit_price: item.price,
          total: item.price * item.quantity,
        }));
        await supabase.from('ecom_order_items').insert(orderItems);

        // Send confirmation email
        try {
          const { data: orderItemsData } = await supabase
            .from('ecom_order_items')
            .select('*')
            .eq('order_id', order.id);

          await fetch(`https://famous.ai/api/ecommerce/${PROJECT_ID}/send-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              customerEmail: shippingAddress.email,
              customerName: shippingAddress.name,
              orderItems: orderItemsData,
              subtotal,
              shipping: shippingCost,
              tax,
              total: subtotal + shippingCost + tax,
              shippingAddress,
            }),
          });
        } catch {}

        clearCart();
        navigate(`/order-confirmation/${order.id}`);
      }
    } catch (err) {
      console.error('Order creation error:', err);
    }
  };

  const updateField = (field: string, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    if (field === 'state') {
      calculateTax(value);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/30">
      <Header />
      <AuthModal />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 font-serif mb-8">Checkout</h1>

        {/* Steps indicator */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-green-700' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step === 'shipping' ? 'bg-green-700 text-white' : 'bg-green-100 text-green-700'
            }`}>
              1
            </div>
            <span className="text-sm font-medium">Shipping</span>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-green-700' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step === 'payment' ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Payment</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3">
            {step === 'shipping' ? (
              <form onSubmit={handleShippingSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Shipping Information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={shippingAddress.name}
                      onChange={e => updateField('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={shippingAddress.email}
                      onChange={e => updateField('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={shippingAddress.address}
                      onChange={e => updateField('address', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={e => updateField('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select
                      value={shippingAddress.state}
                      onChange={e => updateField('state', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                      required
                    >
                      <option value="">Select State</option>
                      {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={shippingAddress.zip}
                      onChange={e => updateField('zip', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value="United States"
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 py-4 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  Continue to Payment
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </form>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Payment</h2>
                  <button
                    onClick={() => setStep('shipping')}
                    className="text-sm text-green-700 hover:text-green-800 font-medium"
                  >
                    Edit Shipping
                  </button>
                </div>

                {/* Shipping summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
                  <p className="font-medium text-gray-900">{shippingAddress.name}</p>
                  <p className="text-gray-600">{shippingAddress.address}</p>
                  <p className="text-gray-600">
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
                  </p>
                  <p className="text-gray-600">{shippingAddress.email}</p>
                </div>

                {!stripePromise ? (
                  <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl text-center">
                    <Lock className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                    <p className="text-yellow-800 font-medium">Payment processing is being set up.</p>
                    <p className="text-yellow-600 text-sm mt-1">Please check back soon to complete your order.</p>
                  </div>
                ) : paymentError ? (
                  <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center">
                    <p className="text-red-800 font-medium">{paymentError}</p>
                    <button
                      onClick={() => setStep('shipping')}
                      className="mt-3 text-sm text-red-700 hover:underline"
                    >
                      Go back and try again
                    </button>
                  </div>
                ) : clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm onSuccess={handlePaymentSuccess} total={total} />
                  </Elements>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    <span className="ml-3 text-gray-600">Loading payment form...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-28">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={`${item.product_id}-${item.variant_id}`} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-amber-50 shrink-0">
                      {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      {item.variant_title && (
                        <p className="text-xs text-gray-500">{item.variant_title}</p>
                      )}
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${(subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    Free
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Tax {taxRate > 0 && `(${taxRate}%)`}
                  </span>
                  <span className="font-medium">
                    {calculatingTax ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      `$${(tax / 100).toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-3 pt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-green-800 text-xl">${(total / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
