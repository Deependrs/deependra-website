import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, ArrowRight } from "lucide-react";

export default function Wishlist() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-[1400px] mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold mb-4">Please login to view your wishlist</h1>
          <Link to="/login" className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-medium hover:bg-[#43A047] transition-colors">
            Login
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-[#1A1A1A] mb-8">My Wishlist</h1>

        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-400 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 mb-6">Save your favorite products to buy later</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-medium hover:bg-[#43A047] transition-colors"
          >
            Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
