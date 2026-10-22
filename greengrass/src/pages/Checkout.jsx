import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import cardImg from "/assets/cpm_club_car.webp";
import {
  ArrowRight, Trash2, ShoppingCart, Check, CreditCard, Lock, Loader2,
  ShieldCheck, CheckCircle2, AlertCircle, ChevronRight
} from "lucide-react";
import { BASE_URL } from "../utils/api";

export default function Checkout() {
  const navigate = useNavigate();
  const { carts, updateQty, removeItem, clearCart } = useCart();
  const items = carts || []; // flat array of products

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

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  const finalTotal = subtotal + (shippingCost || 0);

  /* ── Live Shipping Rate Auto-Fetch on Address/Zip change ─── */
  useEffect(() => {
    if (!shippingAddress.zip || shippingAddress.zip.trim().length < 5 || items.length === 0) {
      return;
    }

    const timer = setTimeout(async () => {
      setShippingLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/shipping/calculate-rate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((item) => ({
              id: item.id,
              qty: Number(item.qty || item.quantity || 1),
              price: Number(item.price),
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
  }, [shippingAddress.zip, shippingAddress.state, shippingAddress.country, items]);

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
        const token = localStorage.getItem('token');
        if (token) {
          const res = await fetch(`${BASE_URL}/profile`, {
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



  /* ── 1. Fetch gateway config ─────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${BASE_URL}/payment/gateway-config`);
        const data = await res.json();
        setGateway(data.gateway);
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
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to proceed with checkout.');
      navigate('/login');
      return;
    }

    const currentShipping = shippingAddressRef.current;

    try {
      const payload = {
        payment_token: paymentToken,
        amount: finalTotal.toFixed(2),
        items: items.map((item) => ({
          id:    item.id,
          name:  item.name,
          price: Number(item.price),
          qty:   Number(item.qty || item.quantity || 1),
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

      const res = await fetch(`${BASE_URL}/payment/dime-charge`, {
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
  }, [subtotal, items, clearCart, navigate]);

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

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to proceed with checkout.');
      navigate('/login');
      return;
    }
    if (items.length === 0) {
      setDimeError('Your cart is empty.');
      return;
    }
    if (!shippingAddress.fullName || !shippingAddress.address1 || !shippingAddress.city || !shippingAddress.zip) {
      setDimeError('Please fill in your Shipping Address (Full Name, Street Address, City, Zip Code).');
      return;
    }
    if (!collectJsReady || !window.CollectJS) {
      setDimeError('Payment form is still loading. Please wait a moment.');
      return;
    }

    setProcessing(true);

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
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in to proceed with checkout.");
      navigate("/login");
      return;
    }

    setStripeLoading(true);
    try {
      const outOfStock = items.find(item => item.qty > item.stock);
      if (outOfStock) {
        alert(`${outOfStock.name} is out of stock`);
        setStripeLoading(false);
        return;
      }

      const body = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          qty: Number(item.qty || item.quantity || 1),
          quantity: Number(item.qty || item.quantity || 1),
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
      };

      const response = await fetch(`${BASE_URL}/checkout/stripe-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("Your session has expired. Please log in again to complete checkout.");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        let errorMsg = "Stripe session request failed";
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch {
          const text = await response.text();
          errorMsg = text || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      clearCart();
      window.location.href = data.url;

    } catch (err) {
      console.error("Stripe checkout failed:", err);
      if (err.message && (err.message.includes("Invalid token") || err.message.includes("Unauthorized"))) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("Your session has expired. Please log in again.");
        navigate("/login");
        return;
      }
      alert("Checkout failed: " + err.message);
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
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={44} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-6">
            Your order has been placed successfully. You will receive a confirmation email shortly.
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
    <div className="min-h-screen bg-white text-gray-800 font-sans pt-8 pb-20">
      {/* Page Header */}
      <div className="container mx-auto px-6 mb-6 md:mb-8">
        <h1 className="flex items-center gap-2 text-3xl md:text-5xl font-serif font-bold">
          <span className="text-gray-600">Your</span>
          <span className="text-[#f9c821]">Build &amp; Checkout</span>
        </h1>
      </div>

      <div className="container mx-auto px-6 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* LEFT: Product Image */}
        <div className="lg:w-[60%] space-y-6 lg:sticky lg:top-[190px] w-full">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 h-[350px] lg:h-[450px] group transition-all duration-300">
            <div
              className="absolute inset-0 w-full h-full bg-contain bg-center bg-no-repeat transition-transform duration-700 p-6"
              style={{ backgroundImage: `url(${cardImg})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
              <span className="bg-[#f9c821]/90 text-white px-4 py-3 rounded-full text-xs font-bold tracking-widest">
                PREMIUM SERIES
              </span>
              <button className="bg-white/95 backdrop-blur-md border border-gray-300 px-6 py-3 rounded-full shadow-lg text-xs font-bold tracking-widest flex items-center gap-2 text-gray-900 cursor-default">
                NICE BUILD! <Check className="w-4 h-4 text-[#f9c821]" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Cart Details, Shipping Address & Payment Form */}
        <div className="lg:w-[40%] w-full">
          <div className="lg:sticky lg:top-[190px] space-y-6">

            {/* Selection Header */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-sm font-bold tracking-[0.2em] text-[#f9c821] uppercase flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Your Selection
                </h2>
                {items.length > 0 && (
                  <button
                    onClick={() => clearCart()}
                    className="text-xs text-red-600 hover:text-red-500 transition-colors font-bold tracking-wider"
                  >
                    CLEAR CART
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                {items.length > 0 ? (
                  items.map((item) => {
                    const maxStock = item.stock || 0;
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col md:flex-row md:items-center justify-between bg-gray-50 border border-gray-200 p-3.5 rounded-xl hover:bg-gray-100 transition-colors gap-3 shadow-sm"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div>
                            <p className="text-xs font-bold text-gray-800 uppercase leading-tight">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              ${item.price.toFixed(2)}
                            </p>
                            {maxStock > 0 && (
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                Stock: {maxStock}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-3">
                          <div className="flex items-center bg-white border border-gray-300 rounded-lg px-2 py-1 shadow-sm">
                            <button
                              onClick={() => updateQty(item.id, Math.max(item.qty - 1, 1))}
                              className="px-2 text-gray-600 hover:text-gray-900 font-bold text-sm"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold min-w-[1.5rem] text-center">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.id, Math.min(item.qty + 1, maxStock || 99))}
                              className="px-2 text-gray-600 hover:text-gray-900 font-bold text-sm"
                              disabled={maxStock > 0 && item.qty >= maxStock}
                            >
                              +
                            </button>
                          </div>

                          <p className="text-xs font-bold min-w-[3.5rem] text-right text-[#f9c821]">
                            ${(item.price * item.qty).toFixed(2)}
                          </p>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-600 py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <p className="mb-4 text-sm font-medium">No items selected.</p>
                    <a
                      href="/greengrass/brand/ClubCar"
                      className="text-[#f9c821] hover:text-gray-900 underline text-xs font-bold tracking-widest"
                    >
                      BUILD YOUR CART
                    </a>
                  </div>
                )}
              </div>

              {/* Subtotal, Shipping, Total */}
              {items.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-xs font-bold text-gray-600 tracking-widest uppercase">
                      Subtotal
                    </span>
                    <span className="font-semibold text-gray-800">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-xs font-bold text-gray-600 tracking-widest uppercase">
                      Shipping
                    </span>
                    <span className="text-gray-800 font-medium">
                      {shippingLoading ? (
                        <span className="text-yellow-600 animate-pulse text-xs">Calculating...</span>
                      ) : shippingCost > 0 ? (
                        <span>${shippingCost.toFixed(2)} <span className="text-xs text-gray-400 font-normal">({shippingServiceName || 'Standard'})</span></span>
                      ) : (
                        <span className="text-gray-400 text-xs">Enter address to calculate</span>
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-900 tracking-widest uppercase">
                      Total
                    </span>
                    <span className="text-2xl font-serif font-bold text-gray-900">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Combined Address & Payment Card */}
            {items.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
                {/* Shipping & Billing Address Section */}
                <div>
                  <h2 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2 tracking-wide uppercase">
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#f9c821] bg-white transition-colors"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#f9c821] bg-white transition-colors mb-2"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Apt, Suite, Unit (optional)"
                        value={shippingAddress.address2}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address2: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#f9c821] bg-white transition-colors"
                      />
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#f9c821] bg-white transition-colors"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#f9c821] bg-white transition-colors"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#f9c821] bg-white transition-colors"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#f9c821] bg-white transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  {gatewayLoading ? (
                    <div className="flex items-center justify-center py-8 gap-3 text-gray-400">
                      <Loader2 size={20} className="animate-spin" />
                      <span className="text-sm">Loading payment options…</span>
                    </div>
                  ) : gateway === 'stripe' ? (
                    /* ── STRIPE ── */
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
                        <CreditCard size={16} className="text-[#f9c821]" /> Secure Payment via Stripe
                      </h3>
                      <button
                        id="stripe-checkout-btn"
                        onClick={handleStripeCheckout}
                        disabled={stripeLoading}
                        className="w-full py-4 bg-[#f9c821] hover:bg-yellow-500 active:bg-yellow-600
                                   text-white font-bold rounded-xl transition-all shadow-md
                                   flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed
                                   text-sm tracking-widest uppercase"
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
                        disabled={!collectJsReady || processing}
                        className="w-full py-4 bg-[#f9c821] hover:bg-yellow-500 active:bg-yellow-600
                                   text-white font-bold rounded-xl transition-all shadow-md
                                   flex items-center justify-center gap-2
                                   disabled:opacity-60 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
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
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
