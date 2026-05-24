import { Link } from "react-router";
import { Leaf, Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0D3311] text-white">
      {/* Newsletter */}
      <div className="bg-[#1B5E20] py-12">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-semibold mb-2">Join 50,000+ Farmers</h3>
          <p className="text-white/70 mb-6">Get farming tips, exclusive deals & new product alerts</p>
          <form className="flex max-w-[500px] mx-auto" onSubmit={(e) => { e.preventDefault(); }}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 py-3 px-5 rounded-l-full text-gray-800 bg-white focus:outline-none text-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#4CAF50] hover:bg-[#43A047] rounded-r-full font-medium text-sm transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Footer content */}
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Leaf className="w-6 h-6 text-[#4CAF50]" />
              <span className="text-lg font-bold">KisanStore</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Your trusted agriculture partner. We provide premium quality pesticides, fertilizers, seeds, and farming tools at the best prices.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-[#4CAF50] rounded-full flex items-center justify-center transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-[#4CAF50]">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { name: "Home", href: "/" },
                { name: "Shop", href: "/shop" },
                { name: "About Us", href: "/about" },
                { name: "Contact", href: "/contact" },
                { name: "My Orders", href: "/orders" },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-white/60 hover:text-white text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-[#4CAF50]">Categories</h4>
            <ul className="space-y-2.5">
              {[
                { name: "Pesticides", href: "/shop?category=pesticides" },
                { name: "Fertilizers", href: "/shop?category=fertilizers" },
                { name: "Seeds", href: "/shop?category=seeds" },
                { name: "Farming Tools", href: "/shop?category=farming-tools" },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-white/60 hover:text-white text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-[#4CAF50]">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-[#4CAF50]" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-[#4CAF50]" />
                <span>support@kisanstore.in</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#4CAF50]" />
                <span>123 Agriculture Market, Pune, Maharashtra 411001</span>
              </li>
              <li className="pt-2">
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] rounded-lg text-sm font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1B5E20]">
        <div className="max-w-[1400px] mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} KisanStore. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-xs">We accept:</span>
            <div className="flex gap-2">
              {["UPI", "Cards", "Paytm"].map((method) => (
                <span key={method} className="px-2.5 py-1 bg-white/10 rounded text-[11px] text-white/60">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
