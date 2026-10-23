import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Trash2, CreditCard, Lock, Loader2,
  ShieldCheck, CheckCircle2, AlertCircle, ChevronRight
} from 'lucide-react';
import { BASE_API } from '../utils/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, clearCart } = useCart();

  /* ── Gateway state ──────────────────────────────────────── */
  const [gateway, setGateway]           = useState(null);  // "stripe" | "dime"
  const [dimeTokenKey, setDimeTokenKey] = useState('');
  const [dimeGatewayUrl, setDimeGatewayUrl] = useState('https://dime.transactiongateway.com');
  const [gatewayLoading, setGatewayLoading] = useState(true);

  /* ── Dime UI state ──────────────────────────────────────── */
  const [collectJsReady, setCollectJsReady] = useState(false);
  const [processing, setProcessing]         = useState(false);
  const [dimeError, setDimeError]           = useState('');
  const [paySuccess, setPaySuccess]         = useState(false);

  /* ── Stripe state ───────────────────────────────────────── */
  const [stripeLoading, setStripeLoading] = useState(false);

  /* ── Shipping & Billing Address State ───────────────────── */
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    phone: '',
  });

  /* ── Live Shipping Rate state ────────────────────────────── */
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingServiceName, setShippingServiceName] = useState('');
  const [shippingLoading, setShippingLoading] = useState(false);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_API}/shipping/countries`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.countries)) {
          setAvailableCountries(data.countries);
          if (data.countries.length > 0) {
            setShippingAddress((prev) => ({
              ...prev,
              country: prev.country && data.countries.some((c) => c.code === prev.country)
                ? prev.country
                : data.countries[0].code,
            }));
          }
        }
      })
      .catch((err) => console.warn('Could not load dynamic shipping countries:', err))
      .finally(() => setCountriesLoading(false));
  }, []);

  // Keep a stable ref to shippingAddress so submitDimeCharge doesn't change on every keystroke
  const shippingAddressRef = useRef(shippingAddress);
  useEffect(() => {
    shippingAddressRef.current = shippingAddress;
  }, [shippingAddress]);

  // Prefill shipping address from logged in user profile / localStorage
  useEffect(() => {
    const loadProfile = async () => {
      let userData = null;
      try {
        const token = getAuthToken();
        if (token) {
          const res = await fetch(`${BASE_API}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            userData = await res.json();
          }
        }
      } catch (e) {
        console.error('Failed to fetch profile:', e);
      }

      if (!userData) {
        try {
          const userRaw = localStorage.getItem('user');
          if (userRaw) userData = JSON.parse(userRaw);
        } catch (e) {
          console.error('Failed to parse user from localStorage:', e);
        }
      }

      if (userData) {
        setShippingAddress((prev) => ({
          ...prev,
          fullName: userData.fullName || userData.name || prev.fullName || '',
          address1: userData.billingStreet || userData.commercialStreet || prev.address1 || '',
          city:     userData.billingCity || userData.commercialCity || prev.city || '',
          state:    userData.billingState || userData.commercialState || prev.state || '',
          zip:      userData.billingZip || userData.commercialZip || prev.zip || '',
          country:  userData.billingCountry || userData.commercialCountry || prev.country || 'US',
          phone:    userData.phone || prev.phone || '',
        }));
      }
    };

    loadProfile();
  }, []);



  /* ── Helpers ─────────────────────────────────────────────── */
  const getPriceAsNumber = (price) => {
    const n = Number(price);
    return isNaN(n) ? 0 : n;
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + getPriceAsNumber(item.price) * item.quantity,
    0
  );

  const finalTotal = subtotal + (shippingCost || 0);

  const getAuthToken = () => localStorage.getItem('token');

  /* ── Live Shipping Rate Auto-Fetch on Address/Zip change ─── */
  useEffect(() => {
    if (!shippingAddress.zip || shippingAddress.zip.trim().length < 3 || cartItems.length === 0) {
      return;
    }

    const timer = setTimeout(async () => {
      setShippingLoading(true);
      try {
        const res = await fetch(`${BASE_API}/shipping/calculate-rate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems.map((item) => ({
              id: item.id,
              qty: Number(item.quantity || 1),
              price: getPriceAsNumber(item.price),
            })),
            shippingAddress: {
              zip: shippingAddress.zip.trim(),
              state: shippingAddress.state?.trim(),
              city: shippingAddress.city?.trim(),
              address1: shippingAddress.address1?.trim(),
              country: (shippingAddress.country || 'US').trim(),
            },
          }),
        });

        const data = await res.json();
        if (data.success) {
          setShippingCost(Number(data.shippingCost || 0));
          setShippingServiceName(data.serviceName || 'Standard Shipping');
        }
      } catch (err) {
        console.warn('Failed to calculate live shipping rate:', err);
      } finally {
        setShippingLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [shippingAddress.zip, shippingAddress.state, shippingAddress.country, cartItems]);

  /* ── 1. Fetch gateway config ─────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${BASE_API}/payment/gateway-config`);
        const data = await res.json();
        setGateway(data.gateway);
        setBypassPayment(Boolean(data.bypassPayment));
        if (data.gateway === 'dime') {
          setDimeTokenKey(data.tokenizationKey || '');
          setDimeGatewayUrl(data.gatewayUrl || 'https://dime.transactiongateway.com');
        }
      } catch {
        setGateway('stripe'); // fallback
      } finally {
        setGatewayLoading(false);
      }
    })();
  }, []);

  /* ── 2. Submit charge to backend (called directly from CollectJS callback) ── */
  const submitDimeCharge = useCallback(async (paymentToken) => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    const currentShipping = shippingAddressRef.current;

    try {
      const payload = {
        payment_token: paymentToken,
        amount: finalTotal.toFixed(2),
        items: cartItems.map((item) => ({
          id:    item.id,
          name:  item.name,
          price: getPriceAsNumber(item.price),
          qty:   Number(item.quantity || 1),
        })),
        shippingAddress: {
          fullName: currentShipping.fullName,
          address1: currentShipping.address1,
          address2: currentShipping.address2,
          city:     currentShipping.city,
          state:    currentShipping.state,
          zip:      currentShipping.zip,
          country:  currentShipping.country || 'US',
          phone:    currentShipping.phone,
          shippingCost: (shippingCost || 0).toFixed(2),
          shippingServiceName: shippingServiceName || 'Standard Shipping',
        },
        billingAddress: {
          firstName: currentShipping.fullName?.trim().split(/\s+/)[0] || '',
          lastName:  currentShipping.fullName?.trim().split(/\s+/).slice(1).join(' ') || '',
          address1:  currentShipping.address1,
          address2:  currentShipping.address2,
          city:      currentShipping.city,
          state:     currentShipping.state,
          zip:       currentShipping.zip,
          country:   currentShipping.country || 'US',
        },
      };

      const res = await fetch(`${BASE_API}/payment/dime-charge`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        setDimeError(data.message || 'Payment failed. Please check your card details and try again.');
        setProcessing(false);
        return;
      }

      // ✅ Success
      clearCart();
      setPaySuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 4000);

    } catch (err) {
      console.error('Dime charge error:', err);
      setDimeError('A network error occurred. Please try again.');
      setProcessing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, cartItems]);

  /* ── 3. Load Collect.js when gateway === "dime" ──────────── */
  useEffect(() => {
    if (gateway !== 'dime' || !dimeTokenKey) return;

    document.getElementById('collectjs-script')?.remove();

    const script = document.createElement('script');
    script.id = 'collectjs-script';
    script.src = `${dimeGatewayUrl}/token/Collect.js`;
    script.setAttribute('data-tokenization-key', dimeTokenKey);
    script.async = true;

    script.onload = () => {
      if (!window.CollectJS) return;

      window.CollectJS.configure({
        variant: 'inline',
        validationCallback: (field, status, message) => {
          if (!status) {
            setProcessing(false);
            const fieldNames = { ccnumber: 'Card Number', ccexp: 'Expiry Date', cvv: 'CVV' };
            setDimeError(`Please enter a valid ${fieldNames[field] || field}.`);
          }
        },
        callback: (response) => {
          if (response && response.token) {
            submitDimeCharge(response.token);
          } else {
            console.error('CollectJS tokenization response error:', response);
            setDimeError(response?.error || response?.message || 'Invalid card details. Please check your card number, expiry, and CVV.');
            setProcessing(false);
          }
        },
        fields: {
          ccnumber: { selector: '#collect-ccnumber', placeholder: 'Card Number' },
          ccexp:    { selector: '#collect-ccexp',    placeholder: 'MM / YY' },
          cvv:      { selector: '#collect-cvv',      placeholder: 'CVC' },
        },
        customCss: {
          'color':            '#111827',
          'background-color': '#ffffff',
          'border':           '1px solid #d1d5db',
          'border-radius':    '6px',
          'font-family':      "'Inter', system-ui, -apple-system, sans-serif",
          'font-size':        '14px',
          'padding':          '0 12px',
          'width':            '100%',
          'height':           '40px',
          'line-height':      '40px',
          'box-sizing':       'border-box',
        },
        focusCss: {
          'border':           '1px solid #111827',
          'outline':          'none',
        },
        invalidCss: {
          'color':            '#ef4444',
          'border':           '1px solid #ef4444',
        },
        placeholderCss: {
          'color':            '#9ca3af',
          'font-size':        '14px',
        },
      });

      setCollectJsReady(true);
    };

    script.onerror = () => {
      setDimeError('Failed to load payment form. Please refresh the page.');
    };

    document.body.appendChild(script);

    return () => {
      document.getElementById('collectjs-script')?.remove();
    };
  }, [gateway, dimeTokenKey, dimeGatewayUrl, submitDimeCharge]);

  /* ── Dime submit handler ──────────────────────────────────── */
  const handleDimeSubmit = (e) => {
    e.preventDefault();
    setDimeError('');

    if (!getAuthToken()) { navigate('/login'); return; }
    if (cartItems.length === 0) { setDimeError('Your cart is empty.'); return; }
    if (!shippingAddress.fullName || !shippingAddress.address1 || !shippingAddress.city || !shippingAddress.zip) {
      setDimeError('Please fill in your Shipping Address (Full Name, Street Address, City, Zip Code).');
      return;
    }
    if (bypassPayment) {
      setProcessing(true);
      submitDimeCharge('BYPASS_TEST_TOKEN');
      return;
    }

    if (!collectJsReady || !window.CollectJS) {
      setDimeError('Payment form is still loading. Please wait a moment.');
      return;
    }

    setProcessing(true);

    // Timeout safety fallback: if CollectJS rejects invalid fields without invoking callback
    setTimeout(() => {
      setProcessing((currentlyProcessing) => {
        if (currentlyProcessing) {
          setDimeError('Please verify your card details (Card Number, Expiry, CVV) and try again.');
          return false;
        }
        return false;
      });
    }, 6000);

    try {
      window.CollectJS.startPaymentRequest();
    } catch (err) {
      console.error('CollectJS startPaymentRequest error:', err);
      setDimeError('Failed to process payment request. Please check card details.');
      setProcessing(false);
    }
  };

  /* ── Stripe handler ──────────────────────────────────────── */
  const handleStripeCheckout = async () => {
    if (!getAuthToken()) { navigate('/login'); return; }
    if (cartItems.length === 0) { alert('Your cart is empty'); return; }

    setStripeLoading(true);
    try {
      const res = await fetch(`${BASE_API}/checkout/stripe-session`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            id:       item.id,
            name:     item.name,
            price:    getPriceAsNumber(item.price),
            qty:      Number(item.quantity || 1),
            quantity: Number(item.quantity || 1),
          })),
          shippingAddress: {
            fullName: shippingAddress.fullName,
            address1: shippingAddress.address1,
            address2: shippingAddress.address2,
            city:     shippingAddress.city,
            state:    shippingAddress.state,
            zip:      shippingAddress.zip,
            country:  shippingAddress.country || 'US',
            phone:    shippingAddress.phone,
          },
          billingAddress: {
            firstName: shippingAddress.fullName?.trim().split(/\s+/)[0] || '',
            lastName:  shippingAddress.fullName?.trim().split(/\s+/).slice(1).join(' ') || '',
            address1:  shippingAddress.address1,
            address2:  shippingAddress.address2,
            city:      shippingAddress.city,
            state:     shippingAddress.state,
            zip:       shippingAddress.zip,
            country:   shippingAddress.country || 'US',
          },
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create checkout session');
      }

      const data = await res.json();
      if (!data.url) throw new Error('No checkout URL received');

      clearCart();
      window.location.href = data.url;
    } catch (err) {
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setStripeLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  /* SUCCESS SCREEN                                              */
  /* ─────────────────────────────────────────────────────────── */
  if (paySuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={44} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-6">
            Your order has been placed. You'll receive a confirmation email shortly.
          </p>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-green-500 animate-[width_4s_linear_forwards]" style={{ width: '100%', animation: 'shrink 4s linear forwards' }} />
          </div>
          <p className="text-sm text-gray-400">Redirecting to home page…</p>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────── */
  /* MAIN RENDER                                                 */
  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8" style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div className="max-w-5xl mx-auto">

        {/* ── Page heading ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
          <p className="text-gray-500 mt-1 text-sm">Review your items and complete payment securely.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── LEFT: Order items ── */}
          <div className="w-full flex-1 lg:sticky lg:top-[190px]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-semibold text-gray-800 text-lg">
                  Order Items ({cartItems.length})
                </h2>
              </div>

              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <CreditCard size={28} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-4">Your cart is empty</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f9c821] text-white font-semibold rounded-lg hover:bg-yellow-500 transition-colors text-sm"
                  >
                    Continue Shopping <ChevronRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {cartItems.map((item) => {
                    const price     = getPriceAsNumber(item.price);
                    const itemTotal = price * item.quantity;
                    return (
                      <div key={item.id} className="flex gap-4 p-5 hover:bg-gray-50/60 transition-colors">
                        {/* Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.image || '/placeholder-product.jpg'}
                            alt={item.name || 'Product'}
                            className="w-20 h-20 object-cover rounded-xl border border-gray-100 shadow-sm"
                          />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{item.name}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku || 'N/A'}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-xs text-gray-500">${price.toFixed(2)} each</span>
                          </div>
                        </div>
                        {/* Price + Remove */}
                        <div className="flex flex-col items-end justify-between min-w-[90px]">
                          <span className="font-bold text-gray-900 text-base">${itemTotal.toFixed(2)}</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors mt-2"
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-green-500" /> SSL Encrypted
              </span>
              <span className="flex items-center gap-1.5">
                <Lock size={13} className="text-blue-400" /> Secure Payment
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-yellow-500" /> PCI Compliant
              </span>
            </div>
          </div>

          {/* ── RIGHT: Combined Summary, Address & Payment panel ── */}
          {cartItems.length > 0 && (
            <div className="w-full lg:w-[440px] lg:sticky lg:top-[190px]">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden space-y-0">

                {/* Order summary */}
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                  <h2 className="font-semibold text-gray-800 text-lg mb-4">Order Summary</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal ({cartItems.length} item{cartItems.length > 1 ? 's' : ''})</span>
                      <span className="font-medium text-gray-800">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Shipping</span>
                      <span className="text-gray-800 font-medium">
                        {shippingLoading ? (
                          <span className="text-yellow-600 animate-pulse text-xs font-semibold">Calculating rate...</span>
                        ) : shippingCost > 0 ? (
                          <span>${shippingCost.toFixed(2)} <span className="text-xs text-gray-400 font-normal">({shippingServiceName || 'Standard'})</span></span>
                        ) : (
                          <span className="text-gray-400 text-xs">Enter address to calculate</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-base">Total</span>
                    <span className="font-extrabold text-gray-900 text-xl">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping & Billing Address Section */}
                <div className="p-6 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2 uppercase tracking-wide">
                    Shipping &amp; Billing Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        placeholder="123 Main St"
                        value={shippingAddress.address1}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address1: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-500 transition-colors mb-2"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Apt, Suite, Unit (optional)"
                        value={shippingAddress.address2}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address2: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Country *
                      </label>
                      <select
                        value={shippingAddress.country || ''}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-500 transition-colors bg-white font-medium"
                        required
                      >
                        {countriesLoading ? (
                          <option value="">Loading countries...</option>
                        ) : availableCountries.length === 0 ? (
                          <option value="">No shipping countries available</option>
                        ) : (
                          availableCountries.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                        City *
                      </label>
                      <input
                        type="text"
                        placeholder="New York"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                        State / Province *
                      </label>
                      <input
                        type="text"
                        placeholder="NY"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Zip / Postal Code *
                      </label>
                      <input
                        type="text"
                        placeholder="10001"
                        value={shippingAddress.zip}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="+1 (555) 000-0000"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment section */}
                <div className="p-6">
                  {gatewayLoading ? (
                    <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
                      <Loader2 size={20} className="animate-spin" />
                      <span className="text-sm">Loading payment options…</span>
                    </div>

                  ) : gateway === 'stripe' ? (
                    /* ── STRIPE ── */
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
                        <CreditCard size={16} className="text-blue-500" /> Secure Payment via Stripe
                      </h3>
                      <button
                        id="stripe-checkout-btn"
                        onClick={handleStripeCheckout}
                        disabled={stripeLoading}
                        className="w-full py-4 bg-[#f9c821] hover:bg-yellow-500 active:bg-yellow-600
                                   text-white font-bold rounded-xl transition-all shadow-md
                                   flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed
                                   text-base"
                      >
                        {stripeLoading ? (
                          <><Loader2 size={18} className="animate-spin" /> Processing…</>
                        ) : (
                          <>Place Order — ${subtotal.toFixed(2)} <ArrowRight size={18} /></>
                        )}
                      </button>
                      <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                        <Lock size={12} /> Redirected to Stripe's secure page
                      </p>
                    </div>

                  ) : (
                    /* ── DIME / NMI ── */
                    <form id="dime-payment-form" onSubmit={handleDimeSubmit}>
                      {bypassPayment && (
                        <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-xl text-xs mb-4 flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                          <span>
                            <strong>Payment Bypass Active (.env):</strong> Gateway card charge is disabled. Clicking Place Order will directly create the order in DB and trigger Fishbowl sync!
                          </span>
                        </div>
                      )}
                      {/* Title & Card Icons inline */}
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-bold text-gray-900 text-sm tracking-wide">
                          Credit card
                        </h3>
                        <div className="flex items-center gap-1">
                          <img src="https://img.icons8.com/color/32/visa.png" alt="Visa" className="h-5 opacity-90" />
                          <img src="https://img.icons8.com/color/32/mastercard.png" alt="Mastercard" className="h-5 opacity-90" />
                          <img src="https://img.icons8.com/color/32/amex.png" alt="Amex" className="h-5 opacity-90" />
                          <img src="https://img.icons8.com/color/32/discover.png" alt="Discover" className="h-5 opacity-90" />
                        </div>
                      </div>

                      {/* Error alert */}
                      {dimeError && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs mb-4">
                          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                          <span>{dimeError}</span>
                        </div>
                      )}

                      {/* Shaded Inner Card Box */}
                      <div className="bg-[#e9e8f0]/70 p-4 sm:p-5 rounded-2xl border border-gray-200/80 mb-5">
                        <p className="text-xs text-gray-500 mb-4 font-medium">
                          Pay with your credit card
                        </p>

                        {/* Loading overlay while CollectJS loads */}
                        {!collectJsReady && (
                          <div className="flex items-center gap-2 text-gray-400 text-xs mb-4">
                            <Loader2 size={14} className="animate-spin" />
                            Securing payment fields…
                          </div>
                        )}

                        {/* Card Number */}
                        <div className="mb-4">
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Card Number <span className="text-red-600">*</span>
                          </label>
                          <div id="collect-ccnumber" className="w-full" style={{ height: '40px' }} />
                        </div>

                        {/* Expiry + CVV row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Expiry Date <span className="text-red-600">*</span>
                            </label>
                            <div id="collect-ccexp" className="w-full" style={{ height: '40px' }} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Card Code (CVC) <span className="text-red-600">*</span>
                            </label>
                            <div id="collect-cvv" className="w-full" style={{ height: '40px' }} />
                          </div>
                        </div>
                      </div>

                      {/* Pay button */}
                      <button
                        id="dime-pay-btn"
                        type="submit"
                        disabled={(!bypassPayment && !collectJsReady) || processing}
                        className="w-full py-4 bg-[#f9c821] hover:bg-yellow-500 active:bg-yellow-600
                                   text-white font-bold rounded-xl transition-all shadow-md
                                   flex items-center justify-center gap-2
                                   disabled:opacity-60 disabled:cursor-not-allowed text-base"
                      >
                        {processing ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Authorizing Payment…
                          </>
                        ) : (
                          <>
                            <Lock size={16} />
                            Pay ${subtotal.toFixed(2)} Securely
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                        <ShieldCheck size={13} className="text-green-500" />
                        Card details are tokenized &amp; never stored on our servers
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;