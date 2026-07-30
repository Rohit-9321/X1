import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { paymentAPI } from '../api';
import toast from 'react-hot-toast';
import { useState } from 'react';

const plans = [
  {
    key: 'free', name: 'Free', price: '₹0', period: 'forever',
    desc: 'Get a feel for the platform',
    features: ['10 aptitude questions/day','5 coding problems','1 mock test per week','Basic dashboard','Placement readiness score'],
    cta: 'Get Started', link: '/signup', highlight: false,
  },
  {
    key: 'single', name: 'Single Company', price: '₹299', period: 'per company',
    desc: 'Go all-in on one target company',
    features: ['Full company topic bank','Previous year questions','All company mock tests','Interview prep guide','Detailed roadmap'],
    cta: 'Buy Pack', razorpay: true, highlight: false,
  },
  {
    key: 'bundle', name: '3-Company Bundle', price: '₹999', period: 'any 3 companies',
    desc: 'Cover all your top targets',
    features: ['Full access to 3 packs','Cross-company analytics','All mock tests','Interview prep each','Priority questions'],
    cta: 'Get Bundle', razorpay: true, highlight: true,
  },
  {
    key: 'premium', name: 'Placement Premium', price: '₹1,999', period: 'all companies',
    desc: 'Everything, for serious prep',
    features: ['All 12+ company tracks','AI Career Coach','LeetCode-style coding','AI mock interview','Advanced analytics','Priority support'],
    cta: 'Go Premium', razorpay: true, highlight: false,
  },
];

export default function PricingPage() {
  const { isAuthenticated } = useSelector(s => s.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const handleRazorpay = async (plan) => {
    if (!isAuthenticated) { navigate('/signup'); return; }
    setLoading(plan.key);
    try {
      const { data } = await paymentAPI.createOrder({ plan: plan.key, companies: [] });
      const options = {
        key: data.data.keyId,
        amount: data.data.amount,
        currency: 'INR',
        name: 'X1 Platform',
        description: plan.name,
        order_id: data.data.orderId,
        handler: async (response) => {
          try {
            await paymentAPI.verifyPayment(response);
            toast.success('Payment successful! Subscription activated 🎉');
            navigate('/dashboard');
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: { name: data.data.user?.name, email: data.data.user?.email },
        theme: { color: '#5B3BF5' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment init failed');
    } finally { setLoading(null); }
  };

  return (
    <div className="min-h-screen bg-surface">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl font-black text-ink">X<span className="text-primary">1</span></Link>
        <div className="flex gap-3">
          <Link to="/login" className="btn-ghost text-sm py-2">Login</Link>
          <Link to="/signup" className="btn-primary text-sm py-2">Sign Up</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="text-xs font-bold tracking-widest uppercase text-primary mb-3">Pricing</div>
          <h1 className="font-display text-5xl font-black text-ink tracking-tight mb-4">
            Pay for the company you want.<br/>Not everything you don't.
          </h1>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">Start free, unlock the exact company pack when you're ready to get serious.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map(plan => (
            <div key={plan.key} className={`rounded-2xl p-7 border-2 relative flex flex-col ${plan.highlight ? 'bg-ink border-primary text-white' : 'bg-white border-gray-100'}`}>
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full whitespace-nowrap">
                  ⭐ Most Popular
                </div>
              )}
              <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${plan.highlight ? 'text-gray-400' : 'text-gray-400'}`}>{plan.name}</div>
              <div className={`font-display text-4xl font-black mb-1 ${plan.highlight ? 'text-white' : 'text-ink'}`}>{plan.price}</div>
              <div className={`text-xs mb-2 ${plan.highlight ? 'text-gray-400' : 'text-gray-400'}`}>{plan.period}</div>
              <p className={`text-xs mb-6 ${plan.highlight ? 'text-gray-300' : 'text-gray-500'}`}>{plan.desc}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className={`flex items-start gap-2 text-xs ${plan.highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                    <CheckCircle size={13} className={`mt-0.5 shrink-0 ${plan.highlight ? 'text-accent' : 'text-primary'}`} />{f}
                  </li>
                ))}
              </ul>
              {plan.razorpay ? (
                <button onClick={() => handleRazorpay(plan)} disabled={loading === plan.key}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${plan.highlight ? 'bg-primary text-white hover:bg-primary-600' : 'bg-ink text-white hover:bg-gray-800'}`}>
                  {loading === plan.key ? 'Opening…' : plan.cta}
                </button>
              ) : (
                <Link to={plan.link || '/signup'}
                  className={`block text-center py-3 rounded-xl text-sm font-bold transition-all ${plan.highlight ? 'bg-primary text-white' : 'border-2 border-gray-200 text-ink hover:border-primary hover:text-primary'}`}>
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm">All plans include 256-bit SSL encryption · Secure payments via Razorpay · 7-day refund policy</p>
        </div>
      </div>
      <script src="https://checkout.razorpay.com/v1/checkout.js" />
    </div>
  );
}
