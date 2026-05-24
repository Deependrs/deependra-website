import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import {
  Star,
  Heart,
  ShoppingCart,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
} from "lucide-react";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "");
  const [showFilters, setShowFilters] = useState(false);

  const { data: productsData } = trpc.product.list.useQuery({
    search: searchQuery || undefined,
    categorySlug: selectedCategory || undefined,
    sort: sortBy || undefined,
    page: 1,
    limit: 24,
  });

  const { data: categories } = trpc.category.list.useQuery();

  // Update URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (sortBy) params.sort = sortBy;
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, sortBy]);

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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#1A1A1A]">
              {selectedCategory
                ? categories?.find((c) => c.slug === selectedCategory)?.name || "Shop"
                : searchQuery
                  ? `Search: "${searchQuery}"`
                  : "All Products"}
            </h1>
            <p className="text-gray-500 mt-1">{productsData?.total || 0} products found</p>
          </div>

          {/* Search and filters */}
          <div className="flex items-center gap-3">
            <form
              onSubmit={(e) => { e.preventDefault(); }}
              className="relative"
            >
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm w-[200px] md:w-[280px] focus:outline-none focus:ring-1 focus:ring-[#4CAF50] focus:border-[#4CAF50]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </form>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm hover:border-[#4CAF50] transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF50] cursor-pointer"
              >
                <option value="">Sort by</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm">Categories</h3>
              <button
                onClick={() => { setSelectedCategory(""); setShowFilters(false); }}
                className="text-xs text-[#4CAF50] hover:underline"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug === selectedCategory ? "" : cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedCategory === cat.slug
                      ? "bg-[#4CAF50] text-white"
                      : "bg-white border border-gray-200 hover:border-[#4CAF50]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products grid */}
        {productsData?.products && productsData.products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productsData.products.map((product) => {
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
                      onClick={() => addToCart.mutate({ productId: product.id, quantity: 1, sessionId: getSessionId() })}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#4CAF50] hover:bg-[#43A047] text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No products found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <Footer />
      <ChatBot />
    </div>
  );
}
