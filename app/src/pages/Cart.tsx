import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";

export default function Cart() {
  const navigate = useNavigate();

  const getSessionId = () => {
    let sessionId = localStorage.getItem("cart_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("cart_session_id", sessionId);
    }
    return sessionId;
  };

  const utils = trpc.useUtils();
  const { data: cartData, isLoading } = trpc.cart.get.useQuery({ sessionId: getSessionId() });
  const updateCart = trpc.cart.update.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      utils.cart.getCount.invalidate();
    },
  });
  const removeItem = trpc.cart.remove.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      utils.cart.getCount.invalidate();
    },
  });

  const getImages = (item: { productImage: unknown }) => {
    if (typeof item.productImage === "string") {
      try { return JSON.parse(item.productImage); } catch { return ["/product-1.jpg"]; }
    }
    return Array.isArray(item.productImage) ? item.productImage : ["/product-1.jpg"];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#4CAF50] border-t-transparent rounded-full" />
      </div>
    );
  }

  const items = cartData?.items || [];
  const total = cartData?.total || 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-[#1A1A1A] mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-400 mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-6">Looks like you haven&apos;t added any products yet</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#4CAF50] hover:bg-[#43A047] text-white font-medium rounded-lg transition-colors"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const images = getImages(item);
                const price = Number(item.productPrice) || 0;
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl"
                  >
                    <Link to={`/product/${item.productSlug}`} className="shrink-0">
                      <div className="w-24 h-24 bg-gray-50 rounded-lg p-2">
                        <img
                          src={images[0] || "/product-1.jpg"}
                          alt={item.productName || ""}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.productSlug}`}>
                        <h3 className="font-medium text-[#1A1A1A] hover:text-[#4CAF50] transition-colors truncate">
                          {item.productName}
                        </h3>
                      </Link>
                      <p className="text-lg font-bold text-[#1A1A1A] mt-1">
                        Rs. {price.toFixed(0)}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() => updateCart.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 h-8 flex items-center justify-center text-sm font-medium border-x border-gray-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCart.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem.mutate({ itemId: item.id })}
                          className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-sm transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-lg">Rs. {(price * item.quantity).toFixed(0)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal ({items.length} items)</span>
                    <span className="font-medium">Rs. {total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-[#4CAF50]">{total > 999 ? "Free" : "Rs. 50"}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg">Rs. {(total > 999 ? total : total + 50).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full py-3.5 bg-[#4CAF50] hover:bg-[#43A047] text-white font-semibold rounded-lg transition-colors"
                >
                  Proceed to Checkout
                </button>
                <Link
                  to="/shop"
                  className="block text-center text-sm text-[#4CAF50] hover:underline mt-3"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
