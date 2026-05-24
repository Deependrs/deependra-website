import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import {
  Star,
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  Headphones,
  RefreshCw,
  SprayCan,
  FlaskConical,
  ShieldCheck,
  Leaf,
  Bug,
  Sprout,
  Recycle,
  Apple,
  Wrench,
  ArrowRight,
  Quote,
} from "lucide-react";

const categoryIcons: Record<string, React.ElementType> = {
  SprayCan, FlaskConical, ShieldCheck, Leaf, Bug, Sprout, Recycle, Apple, Wrench,
};

const testimonials = [
  {
    name: "Rajesh Patel",
    location: "Gujarat",
    rating: 5,
    text: "Great quality pesticides at affordable prices. Delivery was fast and the products are genuine. My cotton yield improved significantly after using their recommended fungicides.",
    avatar: "RP",
  },
  {
    name: "Sunita Devi",
    location: "Bihar",
    rating: 5,
    text: "Excellent customer service! The team helped me choose the right fertilizers for my paddy field. The organic compost is of top quality. Highly recommended for all farmers.",
    avatar: "SD",
  },
  {
    name: "Mohan Singh",
    location: "Punjab",
    rating: 4,
    text: "Been ordering from KisanStore for over a year now. The seeds are always fresh with high germination rates. The sprayer I bought is still working perfectly after 6 months of heavy use.",
    avatar: "MS",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideRef = useRef<NodeJS.Timeout | null>(null);

  const { data: banners } = trpc.banner.list.useQuery();
  const { data: featuredProducts } = trpc.product.getFeatured.useQuery();
  const { data: bestsellerProducts } = trpc.product.getBestsellers.useQuery();
  const { data: categories } = trpc.category.list.useQuery();

  // Cart mutation
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

  // Auto-slide
  useEffect(() => {
    if (isPaused || !banners?.length) return;
    slideRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (banners?.length || 1));
    }, 5000);
    return () => {
      if (slideRef.current) clearInterval(slideRef.current);
    };
  }, [isPaused, banners]);

  const nextSlide = () => {
    if (banners?.length) setCurrentSlide((prev) => (prev + 1) % banners.length);
  };
  const prevSlide = () => {
    if (banners?.length) setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleAddToCart = (productId: number) => {
    addToCart.mutate({ productId, quantity: 1, sessionId: getSessionId() });
  };

  const getImages = (item: { images: unknown }) => {
    if (typeof item.images === "string") {
      try { return JSON.parse(item.images); } catch { return ["/product-1.jpg"]; }
    }
    return Array.isArray(item.images) ? item.images : ["/product-1.jpg"];
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Slider */}
      <section
        className="relative h-[350px] md:h-[500px] overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {banners?.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10" />
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="max-w-[1400px] mx-auto px-4 md:px-8 w-full">
                <div className="max-w-lg">
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
                    {banner.title}
                  </h1>
                  <p className="text-base md:text-lg text-white/80 mb-6">{banner.subtitle}</p>
                  <Link
                    to={banner.link || "/shop"}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#4CAF50] hover:bg-[#43A047] text-white font-medium rounded-md transition-colors"
                  >
                    Shop Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider controls */}
        {banners && banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentSlide ? "bg-white w-8" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Features Banner */}
      <section className="bg-[#E8F5E9] py-5">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, text: "Free Shipping" },
              { icon: Shield, text: "Secure Payment" },
              { icon: Headphones, text: "24/7 Support" },
              { icon: RefreshCw, text: "Easy Returns" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center justify-center gap-3">
                <feature.icon className="w-7 h-7 text-[#1B5E20]" />
                <span className="text-sm font-medium text-[#1A1A1A]">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1400px] mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-[#1A1A1A] mb-2">Shop by Category</h2>
          <p className="text-gray-500">Find everything your farm needs</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-4">
          {categories?.map((category) => {
            const IconComp = categoryIcons[category.icon || ""] || Leaf;
            return (
              <Link
                key={category.id}
                to={`/shop?category=${category.slug}`}
                className="group flex flex-col items-center p-5 bg-white border border-gray-200 rounded-xl hover:border-[#4CAF50] hover:shadow-md hover:scale-[1.02] transition-all duration-300"
              >
                <IconComp className="w-10 h-10 text-[#1B5E20] mb-3 group-hover:text-[#4CAF50] transition-colors" />
                <span className="text-sm font-medium text-center">{category.name}</span>
                <span className="text-xs text-gray-400 mt-1">{category.productCount} products</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-semibold text-[#1A1A1A]">Featured Products</h2>
            <Link to="/shop" className="text-[#4CAF50] font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts?.map((product) => {
              const images = getImages(product);
              const badges = typeof product.badges === "string" ? JSON.parse(product.badges) : product.badges;
              const hasDiscount = product.salePrice && Number(product.salePrice) < Number(product.price);
              const discountPercent = hasDiscount
                ? Math.round(((Number(product.price) - Number(product.salePrice)) / Number(product.price)) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <Link to={`/product/${product.slug}`} className="block relative">
                    <div className="aspect-square bg-gray-50 p-4 overflow-hidden">
                      <img
                        src={images[0] || "/product-1.jpg"}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-400"
                      />
                    </div>
                    {badges?.includes("SALE") && hasDiscount && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#E53935] text-white text-[11px] font-bold rounded-full">
                        -{discountPercent}%
                      </span>
                    )}
                    {badges?.includes("NEW") && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#4CAF50] text-white text-[11px] font-bold rounded-full">
                        NEW
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); }}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </Link>
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-1">{product.brand}</p>
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="text-sm font-medium text-[#1A1A1A] line-clamp-2 mb-2 hover:text-[#4CAF50] transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < Math.floor(Number(product.rating)) ? "text-[#FFC107] fill-[#FFC107]" : "text-gray-200"}`}
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">({product.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-[#1A1A1A]">Rs. {product.salePrice || product.price}</span>
                      {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">Rs. {product.price}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#4CAF50] hover:bg-[#43A047] text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Seasonal Sale Banner */}
      <section className="relative bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] py-16 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Monsoon Mega Sale</h2>
            <p className="text-white/80 text-lg mb-6">Stock up for the rainy season — Up to 50% Off</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-[#1B5E20] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Shop Sale <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex gap-4">
            {featuredProducts?.slice(0, 3).map((product, i) => {
              const images = getImages(product);
              return (
                <img
                  key={product.id}
                  src={images[0]}
                  alt={product.name}
                  className="w-20 h-20 md:w-28 md:h-28 object-contain bg-white/20 rounded-lg rotate-3"
                  style={{ transform: `rotate(${(i - 1) * 8}deg)` }}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-[1400px] mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold text-[#1A1A1A]">Best Sellers</h2>
          <Link to="/shop?sort=rating" className="text-[#4CAF50] font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {bestsellerProducts?.map((product) => {
            const images = getImages(product);
            const badges = typeof product.badges === "string" ? JSON.parse(product.badges) : product.badges;
            const hasDiscount = product.salePrice && Number(product.salePrice) < Number(product.price);
            const discountPercent = hasDiscount
              ? Math.round(((Number(product.price) - Number(product.salePrice)) / Number(product.price)) * 100)
              : 0;

            return (
              <div
                key={product.id}
                className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <Link to={`/product/${product.slug}`} className="block relative">
                  <div className="aspect-square bg-gray-50 p-4 overflow-hidden">
                    <img
                      src={images[0] || "/product-1.jpg"}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-400"
                    />
                  </div>
                  {badges?.includes("SALE") && hasDiscount && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#E53935] text-white text-[11px] font-bold rounded-full">
                      -{discountPercent}%
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </Link>
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-1">{product.brand}</p>
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="text-sm font-medium text-[#1A1A1A] line-clamp-2 mb-2 hover:text-[#4CAF50] transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.floor(Number(product.rating)) ? "text-[#FFC107] fill-[#FFC107]" : "text-gray-200"}`}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">({product.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-[#1A1A1A]">Rs. {product.salePrice || product.price}</span>
                    {hasDiscount && (
                      <span className="text-sm text-gray-400 line-through">Rs. {product.price}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#4CAF50] hover:bg-[#43A047] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#F5F5F5] py-16">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold text-[#1A1A1A] mb-2">What Farmers Say</h2>
            <p className="text-gray-500">Real reviews from our trusted customers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className={`w-4 h-4 ${j < t.rating ? "text-[#FFC107] fill-[#FFC107]" : "text-gray-200"}`}
                    />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-[#4CAF50] mb-3" />
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1B5E20] flex items-center justify-center text-white font-semibold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <ChatBot />
    </div>
  );
}
