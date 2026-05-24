import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  MessageSquare,
  Package,
  IndianRupee,
  Shield,
  ChevronLeft,
} from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "text-yellow-600 bg-yellow-50",
  confirmed: "text-blue-600 bg-blue-50",
  shipped: "text-indigo-600 bg-indigo-50",
  delivered: "text-green-600 bg-green-50",
  cancelled: "text-red-600 bg-red-50",
  returned: "text-gray-600 bg-gray-50",
};

type AdminTab = "dashboard" | "orders" | "products" | "users" | "messages";

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  const isAdmin = user?.role === "admin";

  const { data: stats } = trpc.admin.stats.useQuery(undefined, { enabled: isAdmin });
  const { data: allOrders } = trpc.order.listAll.useQuery(undefined, { enabled: isAdmin && activeTab === "orders" });
  const { data: allUsers } = trpc.admin.users.useQuery(undefined, { enabled: isAdmin && activeTab === "users" });
  const { data: allProducts } = trpc.admin.products.useQuery(undefined, { enabled: isAdmin && activeTab === "products" });
  const { data: allMessages } = trpc.contact.list.useQuery(undefined, { enabled: isAdmin && activeTab === "messages" });

  const utils = trpc.useUtils();
  const updateOrderStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      utils.order.listAll.invalidate();
      utils.admin.stats.invalidate();
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Please login</h1>
          <Link to="/login" className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-medium">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
          <p className="text-gray-500 mb-6">You don&apos;t have admin privileges</p>
          <Link to="/" className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-medium">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { key: AdminTab; label: string; icon: React.ElementType }[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "products", label: "Products", icon: Package },
    { key: "users", label: "Users", icon: Users },
    { key: "messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/")} className="text-gray-500 hover:text-[#1A1A1A]">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Admin Dashboard</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "bg-[#E8F5E9] text-[#1B5E20]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Dashboard */}
            {activeTab === "dashboard" && stats && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
                    { label: "Revenue", value: `Rs. ${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-green-600 bg-green-50" },
                    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-purple-600 bg-purple-50" },
                    { label: "Products", value: stats.totalProducts, icon: Package, color: "text-orange-600 bg-orange-50" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <h2 className="text-lg font-semibold mb-4">Order Status Overview</h2>
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className="space-y-3">
                    {stats.ordersByStatus?.map((item) => (
                      <div key={item.status} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-24 capitalize">{item.status}</span>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#4CAF50] rounded-full transition-all"
                            style={{
                              width: `${stats.totalOrders > 0 ? (item.count / stats.totalOrders) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <h2 className="text-lg font-semibold mt-8 mb-4">Recent Orders</h2>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Order #</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Amount</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Status</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {stats.recentOrders?.slice(0, 10).map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium">#{order.id}</td>
                            <td className="px-4 py-3 text-sm">Rs. {Number(order.totalAmount).toFixed(0)}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Orders */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Order #</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Amount</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Payment</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Status</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allOrders?.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">#{order.id}</td>
                          <td className="px-4 py-3 text-sm">Rs. {Number(order.totalAmount).toFixed(0)}</td>
                          <td className="px-4 py-3 text-sm capitalize">{order.paymentMethod}</td>
                          <td className="px-4 py-3">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus.mutate({ id: order.id, status: e.target.value })}
                              className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[order.status]}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Link to={`/orders`} className="text-[#4CAF50] hover:underline text-xs">
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Products */}
            {activeTab === "products" && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Product</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Category</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Price</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Stock</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allProducts?.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-50 rounded-lg p-1">
                                <img
                                  src={Array.isArray(product.images) ? product.images[0] : "/product-1.jpg"}
                                  alt={product.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <span className="text-sm font-medium">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{product.categoryName}</td>
                          <td className="px-4 py-3 text-sm">Rs. {product.salePrice || product.price}</td>
                          <td className="px-4 py-3 text-sm">{product.stock}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${product.isActive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
                              {product.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users */}
            {activeTab === "users" && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">User</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Email</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Role</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allUsers?.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#1B5E20] rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {u.name?.charAt(0) || "U"}
                              </div>
                              <span className="text-sm font-medium">{u.name || "Unknown"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "admin" ? "text-purple-600 bg-purple-50" : "text-gray-600 bg-gray-50"}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Messages */}
            {activeTab === "messages" && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Name</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Email</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Subject</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Message</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allMessages?.map((msg) => (
                        <tr key={msg.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">{msg.name}</td>
                          <td className="px-4 py-3 text-sm">{msg.email}</td>
                          <td className="px-4 py-3 text-sm">{msg.subject}</td>
                          <td className="px-4 py-3 text-sm max-w-[200px] truncate">{msg.message}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!allMessages || allMessages.length === 0) && (
                    <div className="text-center py-8 text-gray-400 text-sm">No messages yet</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
