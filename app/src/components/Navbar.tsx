import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
  X,
  Leaf,
  ChevronDown,
  LogOut,
  Package,
  Shield,
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { data: searchResults } = trpc.product.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 2 }
  );

  // Get session ID for cart
  const getSessionId = () => {
    let sessionId = localStorage.getItem("cart_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("cart_session_id", sessionId);
    }
    return sessionId;
  };

  const { data: cartCount } = trpc.cart.getCount.useQuery(
    isAuthenticated ? undefined : { sessionId: getSessionId() }
  );

  const isAdmin = user?.role === "admin";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Categories", href: "/shop" },
    { name: "Deals", href: "/shop?sort=price-asc" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 bg-[#1B5E20] text-white shadow-md">
      {/* Top bar */}
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between h-[70px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Leaf className="w-7 h-7 text-[#4CAF50]" />
            <span className="text-xl font-bold tracking-tight">KisanStore</span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-[500px] mx-8 relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 px-4 pr-12 rounded-full text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm"
            />
            <button type="submit" className="absolute right-3 text-gray-500 hover:text-[#1B5E20]">
              <Search className="w-5 h-5" />
            </button>
            {/* Search dropdown */}
            {searchQuery.length > 2 && searchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      navigate(`/product/${product.slug}`);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-left"
                  >
                    <img
                      src={typeof product.images === "string" ? JSON.parse(product.images)[0] : product.images?.[0] || "/product-1.jpg"}
                      alt={product.name}
                      className="w-10 h-10 object-contain rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                      <p className="text-xs text-[#4CAF50] font-semibold">
                        Rs. {product.salePrice || product.price}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-[15px] font-medium hover:text-[#4CAF50] transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            {/* Mobile search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              to={isAuthenticated ? "/wishlist" : "/login"}
              className="hidden sm:flex p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount && cartCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#E53935] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <ChevronDown className="w-4 h-4 hidden sm:block" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 text-gray-800">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                    </div>
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-[#1B5E20]">
                        <Shield className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-red-600 w-full"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#4CAF50] hover:bg-[#43A047] rounded-full text-sm font-medium transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 px-4 pr-12 rounded-full text-gray-800 bg-white focus:outline-none text-sm"
                autoFocus
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1B5E20] border-t border-white/10">
          <nav className="max-w-[1400px] mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block py-2.5 px-3 text-[15px] font-medium hover:bg-white/10 rounded-lg transition-colors"
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="block py-2.5 px-3 text-[15px] font-medium hover:bg-white/10 rounded-lg transition-colors text-[#4CAF50]"
              >
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
