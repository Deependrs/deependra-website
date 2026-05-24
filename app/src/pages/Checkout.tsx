import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, CreditCard, Truck, Building2, ArrowLeft } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay" | "upi">("cod");
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const getSessionId = () => {
    let sessionId = localStorage.getItem("cart_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("cart_session_id", sessionId);
    }
    return sessionId;
  };

  const utils = trpc.useUtils();
  const { data: cartData } = trpc.cart.get.useQuery({ sessionId: getSessionId() });
  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      setOrderId(data.orderId);
      setOrderComplete(true);
      utils.cart.get.invalidate();
      utils.cart.getCount.invalidate();
    },
  });

  const total = cartData?.total || 0;
  const shipping = total > 999 ? 0 : 50;
  const grandTotal = total + shipping;

  const handlePlaceOrder = () => {
    if (!cartData?.items.length) return;
    const items = cartData.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
    createOrder.mutate({
      items,
      shippingAddress,
      paymentMethod,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-[1400px] mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold mb-4">Please login to checkout</h1>
          <p className="text-gray-500 mb-6">You need to be logged in to place an order</p>
          <Link to="/login" className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-medium hover:bg-[#43A047] transition-colors">
            Login
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (orderComplete && orderId) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-[#4CAF50]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3">Order Placed!</h1>
          <p className="text-gray-500 mb-2">Thank you for your order</p>
          <p className="text-[#1B5E20] font-semibold mb-6">Order #{orderId}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/orders"
              className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-medium hover:bg-[#43A047] transition-colors"
            >
              View My Orders
            </Link>
            <Link
              to="/shop"
              className="px-6 py-3 border border-gray-200 rounded-lg font-medium hover:border-[#4CAF50] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const items = cartData?.items || [];

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-[1400px] mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
          <Link to="/shop" className="text-[#4CAF50] hover:underline">Browse products</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/cart")} className="text-gray-500 hover:text-[#1A1A1A]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-semibold text-[#1A1A1A]">Checkout</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          {[
            { num: 1, label: "Shipping" },
            { num: 2, label: "Payment" },
            { num: 3, label: "Review" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s.num ? "bg-[#4CAF50] text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                {s.num}
              </div>
              <span className={`text-sm ${step >= s.num ? "text-[#1A1A1A] font-medium" : "text-gray-400"}`}>
                {s.label}
              </span>
              {s.num < 3 && <div className="w-8 h-px bg-gray-200 ml-2" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Street Address</label>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                      placeholder="House no, street, area"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">City</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">State</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">PIN Code</label>
                    <input
                      type="text"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                      placeholder="6 digit PIN"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                      placeholder="10 digit mobile"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (shippingAddress.fullName && shippingAddress.street && shippingAddress.city) {
                      setStep(2);
                    }
                  }}
                  className="mt-6 w-full py-3 bg-[#4CAF50] hover:bg-[#43A047] text-white font-semibold rounded-lg transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { key: "cod" as const, label: "Cash on Delivery", icon: Truck, desc: "Pay when you receive" },
                    { key: "upi" as const, label: "UPI / Google Pay / PhonePe", icon: CreditCard, desc: "Pay via UPI apps" },
                    { key: "razorpay" as const, label: "Razorpay (Cards / Net Banking)", icon: Building2, desc: "Secure online payment" },
                  ].map((method) => (
                    <button
                      key={method.key}
                      onClick={() => setPaymentMethod(method.key)}
                      className={`w-full flex items-center gap-4 p-4 border rounded-xl transition-colors text-left ${
                        paymentMethod === method.key
                          ? "border-[#4CAF50] bg-[#E8F5E9]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <method.icon className="w-6 h-6 text-[#1B5E20]" />
                      <div className="flex-1">
                        <p className="font-medium">{method.label}</p>
                        <p className="text-sm text-gray-500">{method.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === method.key ? "border-[#4CAF50]" : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === method.key && <div className="w-2.5 h-2.5 bg-[#4CAF50] rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-gray-200 rounded-lg font-medium hover:border-[#4CAF50] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 bg-[#4CAF50] hover:bg-[#43A047] text-white font-semibold rounded-lg transition-colors"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Review Order</h2>
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">Shipping To</h3>
                    <p className="text-sm text-gray-600">{shippingAddress.fullName}</p>
                    <p className="text-sm text-gray-600">{shippingAddress.street}</p>
                    <p className="text-sm text-gray-600">{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                    <p className="text-sm text-gray-600">Phone: {shippingAddress.phone}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">Payment</h3>
                    <p className="text-sm text-gray-600 capitalize">{paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "upi" ? "UPI Payment" : "Razorpay"}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 border border-gray-200 rounded-lg font-medium hover:border-[#4CAF50] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={createOrder.isPending}
                    className="flex-1 py-3 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
                  >
                    {createOrder.isPending ? "Placing Order..." : `Place Order - Rs. ${grandTotal.toFixed(0)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                {items.map((item) => {
                  const images = typeof item.productImage === "string" ? JSON.parse(item.productImage) : item.productImage;
                  return (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0">
                        <img
                          src={Array.isArray(images) ? images[0] : "/product-1.jpg"}
                          alt={item.productName || ""}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">Rs. {(Number(item.productPrice) * item.quantity).toFixed(0)}</p>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>Rs. {total.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={shipping === 0 ? "text-[#4CAF50]" : ""}>{shipping === 0 ? "Free" : `Rs. ${shipping}`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span>Rs. {grandTotal.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
