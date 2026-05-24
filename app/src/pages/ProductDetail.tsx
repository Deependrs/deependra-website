import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import {
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Shield,
  RefreshCw,
  ChevronRight,
  Package,
  Info,
  AlertTriangle,
} from "lucide-react";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "instructions" | "safety">("description");

  const { data: product, isLoading } = trpc.product.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const getSessionId = () => {
    let sessionId = localStorage.getItem("cart_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("cart_session_id", sessionId);
    }
    return sessionId;
  };

  const utils = trpc.useUtils();
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.getCount.invalidate();
      utils.cart.get.invalidate();
    },
  });

  const getImages = (item: { images: unknown }) => {
    if (typeof item.images === "string") {
      try { return JSON.parse(item.images); } catch { return ["/product-1.jpg"]; }
    }
    return Array.isArray(item.images) ? item.images : ["/product-1.jpg"];
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart.mutate({ productId: product.id, quantity, sessionId: getSessionId() });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#4CAF50] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-xl font-semibold text-gray-600">Product not found</h1>
        <Link to="/shop" className="mt-4 text-[#4CAF50] hover:underline">Browse products</Link>
      </div>
    );
  }

  const images = getImages(product);
  const badges = typeof product.badges === "string" ? JSON.parse(product.badges) : product.badges;
  const hasDiscount = product.salePrice && Number(product.salePrice) < Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.price) - Number(product.salePrice)) / Number(product.price)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#4CAF50]">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/shop" className="hover:text-[#4CAF50]">Shop</Link>
          <ChevronRight className="w-4 h-4" />
          {product.categoryName && (
            <>
              <Link to={`/shop?category=${product.categorySlug}`} className="hover:text-[#4CAF50]">
                {product.categoryName}
              </Link>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
          <span className="text-[#1A1A1A] font-medium truncate">{product.name}</span>
        </nav>

        {/* Product detail */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Image */}
          <div className="bg-gray-50 rounded-2xl p-8 flex items-center justify-center">
            <img
              src={images[0] || "/product-1.jpg"}
              alt={product.name}
              className="max-w-full max-h-[400px] object-contain"
            />
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {badges?.includes("SALE") && hasDiscount && (
                <span className="px-2.5 py-1 bg-[#E53935] text-white text-xs font-bold rounded-full">
                  -{discountPercent}%
                </span>
              )}
              {badges?.includes("NEW") && (
                <span className="px-2.5 py-1 bg-[#4CAF50] text-white text-xs font-bold rounded-full">
                  NEW
                </span>
              )}
              {badges?.includes("BESTSELLER") && (
                <span className="px-2.5 py-1 bg-[#FFC107] text-[#1A1A1A] text-xs font-bold rounded-full">
                  BESTSELLER
                </span>
              )}
            </div>

            <p className="text-sm text-gray-400 mb-1">{product.brand}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-3">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(Number(product.rating)) ? "text-[#FFC107] fill-[#FFC107]" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.rating} ({product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-[#1A1A1A]">Rs. {product.salePrice || product.price}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">Rs. {product.price}</span>
                  <span className="text-sm text-[#4CAF50] font-medium">Save Rs. {(Number(product.price) - Number(product.salePrice)).toFixed(0)}</span>
                </>
              )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.shortDescription || product.description}</p>

            {/* SKU & Weight */}
            <div className="flex gap-6 mb-6 text-sm">
              <div>
                <span className="text-gray-400">SKU:</span>
                <span className="ml-1 font-medium">{product.sku}</span>
              </div>
              <div>
                <span className="text-gray-400">Weight:</span>
                <span className="ml-1 font-medium">{product.weight}</span>
              </div>
              <div>
                <span className="text-gray-400">Stock:</span>
                <span className={`ml-1 font-medium ${product.stock && product.stock > 0 ? "text-[#4CAF50]" : "text-[#E53935]"}`}>
                  {product.stock && product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 h-10 flex items-center justify-center font-medium border-x border-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 0, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!product.stock || product.stock <= 0}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#4CAF50] hover:bg-[#43A047] disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.stock || product.stock <= 0}
                className="flex-1 py-3.5 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
              >
                Buy Now
              </button>
              <button className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors">
                <Heart className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
              {[
                { icon: Truck, text: "Free Delivery" },
                { icon: Shield, text: "Secure Payment" },
                { icon: RefreshCw, text: "7-Day Returns" },
              ].map((f, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1.5">
                  <f.icon className="w-5 h-5 text-[#1B5E20]" />
                  <span className="text-xs text-gray-600">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-12">
          <div className="flex border-b border-gray-200 mb-6">
            {[
              { key: "description" as const, label: "Description", icon: Info },
              { key: "instructions" as const, label: "Usage Instructions", icon: Package },
              { key: "safety" as const, label: "Safety Information", icon: AlertTriangle },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-[#4CAF50] text-[#4CAF50]"
                    : "border-transparent text-gray-500 hover:text-[#1A1A1A]"
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
          <div className="text-gray-600 text-sm leading-relaxed">
            {activeTab === "description" && <p>{product.description}</p>}
            {activeTab === "instructions" && (
              <div>
                <p className="mb-2">{product.usageInstructions || "No specific usage instructions available."}</p>
                {product.dosage && (
                  <p className="font-medium">Recommended Dosage: {product.dosage}</p>
                )}
              </div>
            )}
            {activeTab === "safety" && <p>{product.safetyInfo || "Always read the label before use. Wear protective equipment when handling agricultural chemicals."}</p>}
          </div>
        </div>

        {/* Related Products */}
        {product.related && product.related.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {product.related.map((rp) => {
                const rpImages = getImages(rp);
                return (
                  <Link
                    key={rp.id}
                    to={`/product/${rp.slug}`}
                    className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-square bg-gray-50 p-4">
                      <img
                        src={rpImages[0] || "/product-1.jpg"}
                        alt={rp.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-[#1A1A1A] line-clamp-2 group-hover:text-[#4CAF50] transition-colors">
                        {rp.name}
                      </h3>
                      <p className="text-lg font-bold mt-1">Rs. {rp.salePrice || rp.price}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
      <ChatBot />
    </div>
  );
}
