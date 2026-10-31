// src/pages/ProfilePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  MapPin,
  Building2,
  Lock,
  Save,
  Loader2,
  Settings,
  ArrowRight,
  Package,
  Truck,
  ExternalLink,
  CheckCircle2,
  Clock,
  RotateCw,
} from "lucide-react";
import { api, BASE_IMAGE_URL, BASE_URL } from "../utils/api";
import { useCart } from "../context/CartContext";

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("edit"); // "edit", "orders", "password", "savebuilds"

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { carts } = useCart();
  // console.log(carts);

  // Orders & Tracking state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      setOrderError("");
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await api.get("/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      setOrderError("Failed to load orders. Please try again.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    billingStreet: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
    billingCountry: "",
    commercialStreet: "",
    commercialCity: "",
    commercialState: "",
    commercialZip: "",
    commercialCountry: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const data = await api.get("/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });


        setFormData({
          fullName: data.fullName || "",
          email: data.email || "",
          billingStreet: data.billingStreet || "",
          billingCity: data.billingCity || "",
          billingState: data.billingState || "",
          billingZip: data.billingZip || "",
          billingCountry: data.billingCountry || "",
          commercialStreet: data.commercialStreet || "",
          commercialCity: data.commercialCity || "",
          commercialState: data.commercialState || "",
          commercialZip: data.commercialZip || "",
          commercialCountry: data.commercialCountry || "",
        });
      } catch (err) {
        setError(err.message || "Failed to load profile");
        if (err.message.includes("Unauthorized")) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setPasswordSaving(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/profile-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: passwordForm.oldPassword,
            newPassword: passwordForm.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // 👈 backend error comes here
        throw new Error(data.error || "Password update failed");
      }

      setPasswordSuccess("Password changed successfully!");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#f9c821]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="w-full lg:w-80 bg-gradient-to-b from-[#f9c821] to-[#f0b500] p-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-4">
                <Settings className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-black">Account Settings</h1>
              <p className="text-black/80 mt-2">Manage your profile</p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("edit")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-left transition-all ${activeTab === "edit"
                  ? "bg-black/20 text-black font-semibold shadow-md"
                  : "text-black/80 hover:bg-black/10"
                  }`}
              >
                <User className="h-6 w-6" />
                <span className="text-lg">Edit Profile</span>
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-left transition-all ${activeTab === "orders"
                  ? "bg-black/20 text-black font-semibold shadow-md"
                  : "text-black/80 hover:bg-black/10"
                  }`}
              >
                <Package className="h-6 w-6" />
                <span className="text-lg">My Orders & Tracking</span>
              </button>

              <button
                onClick={() => setActiveTab("password")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-left transition-all ${activeTab === "password"
                  ? "bg-black/20 text-black font-semibold shadow-md"
                  : "text-black/80 hover:bg-black/10"
                  }`}
              >
                <Lock className="h-6 w-6" />
                <span className="text-lg">Change Password</span>
              </button>

              <button
                onClick={() => setActiveTab("savebuilds")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-left transition-all ${activeTab === "savebuilds"
                  ? "bg-black/20 text-black font-semibold shadow-md"
                  : "text-black/80 hover:bg-black/10"
                  }`}
              >
                <Lock className="h-6 w-6" />
                <span className="text-lg">Save Builds</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
            {activeTab === "edit" && (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-8">Edit Profile</h2>

                {error && (
                  <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6">
                    {success}
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-8">
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
                      <User className="h-5 w-5 text-[#f9c821]" />
                      Personal Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f9c821]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="inline h-4 w-4 mr-1" />Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div>
                    <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[#f9c821]" />
                      Billing Address
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Repeat inputs like before... */}
                      <input type="text" name="billingStreet" placeholder="Street" value={formData.billingStreet} onChange={handleChange} className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#f9c821]" />
                      <input type="text" name="billingCity" placeholder="City" value={formData.billingCity} onChange={handleChange} className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#f9c821]" />
                      <input type="text" name="billingState" placeholder="State" value={formData.billingState} onChange={handleChange} className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#f9c821]" />
                      <input type="text" name="billingZip" placeholder="ZIP" value={formData.billingZip} onChange={handleChange} className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#f9c821]" />
                      <div className="md:col-span-2">
                        <input type="text" name="billingCountry" placeholder="Country" value={formData.billingCountry} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#f9c821]" />
                      </div>
                    </div>
                  </div>

                  {/* Commercial Address */}
                  <div>
                    <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-[#f9c821]" />
                      Commercial / Shipping Address
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <input type="text" name="commercialStreet" placeholder="Street" value={formData.commercialStreet} onChange={handleChange} className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#f9c821]" />
                      <input type="text" name="commercialCity" placeholder="City" value={formData.commercialCity} onChange={handleChange} className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#f9c821]" />
                      <input type="text" name="commercialState" placeholder="State" value={formData.commercialState} onChange={handleChange} className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#f9c821]" />
                      <input type="text" name="commercialZip" placeholder="ZIP" value={formData.commercialZip} onChange={handleChange} className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#f9c821]" />
                      <div className="md:col-span-2">
                        <input type="text" name="commercialCountry" placeholder="Country" value={formData.commercialCountry} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#f9c821]" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-3 bg-[#f9c821] hover:bg-[#e8b71d] text-black font-semibold px-8 py-4 rounded-xl shadow-md hover:shadow-lg disabled:opacity-70"
                    >
                      {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab === "password" && (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-8">Change Password</h2>

                {passwordError && (
                  <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6">
                    {passwordSuccess}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="max-w-lg">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="oldPassword"
                        value={passwordForm.oldPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f9c821]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f9c821]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmNewPassword"
                        value={passwordForm.confirmNewPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f9c821]"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="flex items-center gap-3 bg-[#f9c821] hover:bg-[#e8b71d] text-black font-semibold px-8 py-4 rounded-xl shadow-md hover:shadow-lg disabled:opacity-70"
                    >
                      {passwordSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                      {passwordSaving ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab === "savebuilds" && (
              <>
                <div className="flex flex-row justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 ">
                    Saved Builds
                  </h2>
                  {carts.length === 0 ? (
                    <button
                      onClick={() => navigate("/")}
                      className="w-fit bg-[#f9c821] hover:bg-[#e0b318] text-white font-bold text-sm tracking-[0.2em] py-2 px-6 rounded-xl shadow-lg shadow-[#f9c821]/30 transition-all hover:scale-[1.02] active:scale-98 uppercase flex items-center justify-center gap-3"
                    >
                      Shop Now <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/checkout")}
                      className="w-fit bg-[#f9c821] hover:bg-[#e0b318] text-white font-bold text-sm tracking-[0.2em] py-2 px-6 rounded-xl shadow-lg shadow-[#f9c821]/30 transition-all hover:scale-[1.02] active:scale-98 uppercase flex items-center justify-center gap-3"
                    >
                      Check Out <ArrowRight className="w-5 h-5" />
                    </button>
                  )}

                </div>
                {carts.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    No saved builds found.
                  </div>
                ) : (
                  <div className="grid md:grid-cols-1 xl:grid-cols-1 gap-6">
                    {carts.map((build) => (
                      <div
                        key={build.id}
                        className="flex flex-row items-start justify-start w-full gap-3 bg-white border border-[#ffc400] rounded-2xl shadow-md hover:shadow-xl transition-all p-3"
                      >
                        {/* Build Image */}
                        <div className="">

                          {build.imageOne && (
                            <img
                              src={`${BASE_IMAGE_URL}${build.imageOne}`}
                              alt={build.name}
                              className="w-full h-32 object-contain rounded-xl mb-4"
                            />
                          )}
                        </div>
                        <div className="">
                          {/* Build Info */}
                          <h3 className="text-lg font-semibold mb-2">
                            {build.name}
                          </h3>

                          <p className="text-gray-600 text-sm mb-3">
                            {build.description || "No description available"}
                          </p>

                          <div className="text-xs sm:text-sm text-gray-600 mb-2">
                            {build?.productType.name ? `${build.productType.name}` : ""} {build?.color ? `• ${build.color}` : ""} {build?.qty ? `• ${build.qty} quantity` : ""}
                          </div>

                          {/* Price */}
                          <div className="text-lg font-bold text-amber-700 mb-4">
                            $ {build.regularPrice}
                          </div>

                          {/* Actions */}
                          {/* <div className="flex justify-between items-center">
                            <button
                              onClick={() => navigate(`/builder/${build.id}`)}
                              className="text-sm font-medium text-blue-600 hover:underline"
                            >
                              View
                            </button>

                            <button
                              className="text-sm font-medium text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div> */}
                        </div>

                      </div>
                    ))}

                  </div>
                )}
              </>
            )}

            {/* Orders & Tracking Tab */}
            {activeTab === "orders" && (
              <>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">My Orders &amp; Tracking</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      View your order history, payment receipts, and real-time shipping tracking.
                    </p>
                  </div>
                  <button
                    onClick={fetchOrders}
                    disabled={loadingOrders}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all disabled:opacity-50"
                  >
                    <RotateCw className={`w-4 h-4 ${loadingOrders ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>

                {loadingOrders ? (
                  <div className="py-20 flex flex-col items-center justify-center text-gray-500">
                    <Loader2 className="w-10 h-10 animate-spin text-[#f9c821] mb-4" />
                    <p className="font-medium">Loading your orders...</p>
                  </div>
                ) : orderError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
                    <p className="font-medium mb-3">{orderError}</p>
                    <button
                      onClick={fetchOrders}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
                    >
                      Try Again
                    </button>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200 p-8">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-200">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No Orders Placed Yet</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                      When you place an order, your order receipt, live fulfillment status, and carrier tracking links will automatically appear here.
                    </p>
                    <button
                      onClick={() => navigate("/club-car")}
                      className="inline-flex items-center gap-2 bg-[#f9c821] hover:bg-[#e0b318] text-black font-bold text-sm tracking-wide py-3 px-6 rounded-xl shadow-md transition-all"
                    >
                      Browse Products <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => {
                      const isShipped = order.status === "SHIPPED" || order.shipmentStatus === "SHIPPED";
                      const isDelivered = order.status === "DELIVERED";
                      const isPaid = order.status === "PAID";
                      const carrier = order.carrier || "FedEx";
                      const cleanTracking = (order.trackingNumber || "").trim();

                      const isUPS =
                        carrier.toUpperCase().includes("UPS") ||
                        cleanTracking.toUpperCase().startsWith("1Z");
                      const trackingUrl = cleanTracking
                        ? isUPS
                          ? `https://www.ups.com/track?tracknum=${cleanTracking}`
                          : `https://www.fedex.com/fedextrack/?trknbr=${cleanTracking}`
                        : null;

                      const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      const totalAmt = Number(order.totalAmount || 0).toFixed(2);
                      const shipCost = Number(order.shipmentCost || 0).toFixed(2);
                      const subtotal = (Number(totalAmt) - Number(shipCost)).toFixed(2);

                      return (
                        <div
                          key={order.id}
                          className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                        >
                          {/* Order Card Top Bar */}
                          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="font-extrabold text-lg text-gray-900">
                                  Order #{order.id}
                                </span>
                                {order.fishbowlSalesOrderNumber && (
                                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono">
                                    SO {order.fishbowlSalesOrderNumber}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{orderDate}</p>
                            </div>

                            {/* Status Badges */}
                            <div className="flex items-center gap-2">
                              {/* Payment status badge */}
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                              </span>

                              {/* Shipment status badge */}
                              {isShipped ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                                  <Truck className="w-3.5 h-3.5" /> Shipped
                                </span>
                              ) : isDelivered ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                                  <Clock className="w-3.5 h-3.5" /> In Fulfillment
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-6 space-y-6">
                            {/* Tracking & Shipment Status Box */}
                            {cleanTracking ? (
                              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                                    <Truck className="w-4 h-4 text-amber-600" />
                                    Shipped via {carrier} ({order.serviceLevel || "Ground"})
                                  </div>
                                  <div className="text-sm text-gray-700">
                                    Tracking Number:{" "}
                                    <span className="font-mono font-bold text-gray-900 bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                                      {cleanTracking}
                                    </span>
                                  </div>
                                </div>

                                {trackingUrl && (
                                  <a
                                    href={trackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-[#f9c821] hover:bg-[#e0b21a] text-black font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow"
                                  >
                                    Track Package <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            ) : isShipped ? (
                              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Truck className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <p className="text-sm font-semibold text-blue-900">
                                      Package Shipped via {carrier}
                                    </p>
                                    <p className="text-xs text-blue-700">
                                      Carrier pickup completed. Live tracking number updating shortly.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                                <div className="text-xs text-gray-600 leading-relaxed">
                                  <strong className="text-gray-900 font-semibold text-sm block mb-0.5">
                                    Warehouse Fulfillment in Progress
                                  </strong>
                                  Your payment has been received and verified. Our warehouse team is picking, packing, and preparing your order for pickup with <strong>{carrier} ({order.serviceLevel || "Ground"})</strong>. Once dispatched, you will receive an email notification and your live tracking link will be displayed here.
                                </div>
                              </div>
                            )}

                            {/* Order Items Table */}
                            <div>
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                Items in this Order ({order.items?.length || 0})
                              </h4>
                              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                                {(order.items || []).map((item) => {
                                  const prod = item.product;
                                  const img = prod?.images ? (typeof prod.images === "string" ? JSON.parse(prod.images)[0] : prod.images[0]) : null;

                                  return (
                                    <div
                                      key={item.id}
                                      className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                                    >
                                      <div className="flex items-center gap-4">
                                        {img ? (
                                          <img
                                            src={`${BASE_IMAGE_URL}${img}`}
                                            alt={prod?.name || "Product"}
                                            className="w-14 h-14 object-contain rounded-lg border border-gray-200 bg-white p-1"
                                          />
                                        ) : (
                                          <div className="w-14 h-14 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400">
                                            <Package className="w-6 h-6" />
                                          </div>
                                        )}
                                        <div>
                                          <h5 className="font-semibold text-sm text-gray-900">
                                            {prod?.name || `Item #${item.productId}`}
                                          </h5>
                                          <p className="text-xs text-gray-500">
                                            Qty: <span className="font-medium text-gray-700">{item.quantity}</span>
                                            {prod?.sku && ` • SKU: ${prod.sku}`}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="text-right">
                                        <div className="font-bold text-sm text-gray-900">
                                          ${(Number(item.priceAtOrder) * item.quantity).toFixed(2)}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          ${Number(item.priceAtOrder).toFixed(2)} each
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Order Summary & Delivery Address */}
                            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                              {/* Shipping Address */}
                              <div className="text-xs text-gray-600 leading-relaxed">
                                <h5 className="font-bold uppercase tracking-wider text-gray-500 text-[11px] mb-2">
                                  Delivery Address
                                </h5>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {order.shipFirstName ? `${order.shipFirstName} ${order.shipLastName || ""}` : "Customer"}
                                </p>
                                <p>{order.shipAddress1 || "Address on file"}</p>
                                {order.shipAddress2 && <p>{order.shipAddress2}</p>}
                                <p>
                                  {order.shipCity ? `${order.shipCity}, ` : ""}
                                  {order.shipState} {order.shipZip}
                                </p>
                                <p>{order.shipCountry || "US"}</p>
                              </div>

                              {/* Payment & Financial Summary */}
                              <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-2">
                                <h5 className="font-bold uppercase tracking-wider text-gray-500 text-[11px] mb-2">
                                  Payment &amp; Financial Summary
                                </h5>
                                <div className="flex justify-between text-gray-600">
                                  <span>Subtotal:</span>
                                  <span>${subtotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span>Shipping ({carrier}):</span>
                                  <span>${shipCost}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                                  <span>Total Paid:</span>
                                  <span className="text-emerald-700">${totalAmt}</span>
                                </div>
                                <p className="text-[11px] text-gray-400 pt-1">
                                  Payment Method: Credit Card (Online)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}