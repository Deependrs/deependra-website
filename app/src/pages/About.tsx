import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { Leaf, Shield, Truck, Headphones, Award, Users } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <div className="bg-[#1B5E20] text-white py-16">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About KisanStore</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Your trusted partner in agriculture since 2020. We provide premium quality farming inputs to help Indian farmers achieve better yields.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-16">
        {/* Story */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-semibold mb-4">Our Story</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              KisanStore was founded with a simple mission — to make quality agriculture products accessible and affordable to every farmer in India. What started as a small local shop in Pune has grown into a trusted online marketplace serving farmers across the country.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We partner directly with leading brands like UPL, Syngenta, Bayer, and Coromandel to ensure 100% genuine products at competitive prices. Our team of agriculture experts is always ready to help you choose the right products for your crops.
            </p>
          </div>
          <div className="bg-[#E8F5E9] rounded-2xl p-8">
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: "50,000+", label: "Happy Farmers" },
                { value: "500+", label: "Products" },
                { value: "28", label: "States Served" },
                { value: "99%", label: "Satisfaction" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl font-bold text-[#1B5E20]">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-semibold text-center mb-10">Why Choose Us</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Award, title: "Genuine Products", desc: "All products sourced directly from authorized manufacturers with quality assurance." },
              { icon: Truck, title: "Fast Delivery", desc: "Free shipping on orders above Rs. 999 with delivery to your doorstep within 3-5 days." },
              { icon: Shield, title: "Secure Payments", desc: "Multiple secure payment options including COD, UPI, Razorpay, and credit cards." },
              { icon: Headphones, title: "Expert Support", desc: "Our agriculture experts are available to help you choose the right products." },
              { icon: Leaf, title: "Wide Range", desc: "From pesticides to organic fertilizers, we have everything your farm needs." },
              { icon: Users, title: "Farmer Community", desc: "Join our growing community of farmers and share knowledge and experiences." },
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-[#E8F5E9] rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#1B5E20]" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-white/80 text-lg max-w-3xl mx-auto leading-relaxed">
            To empower every farmer in India with access to high-quality, affordable agriculture inputs. We believe that better farming inputs lead to better harvests, and better harvests lead to prosperous farming communities.
          </p>
        </div>
      </div>

      <Footer />
      <ChatBot />
    </div>
  );
}
