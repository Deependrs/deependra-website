import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "text-yellow-600 bg-yellow-50", icon: Clock },
  confirmed: { label: "Confirmed", color: "text-blue-600 bg-blue-50", icon: CheckCircle },
  shipped: { label: "Shipped", color: "text-indigo-600 bg-indigo-50", icon: Truck },
  delivered: { label: "Delivered", color: "text-green-600 bg-green-50", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red-600 bg-red-50", icon: XCircle },
  returned: { label: "Returned", color: "text-gray-600 bg-gray-50", icon: RotateCcw },
};

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const { data: orders, isLoading } = trpc.order.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();
  const cancelOrder = trpc.order.cancel.useMutation({
    onSuccess: () => utils.order.list.invalidate(),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-[1400px] mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold mb-4">Please login to view your orders</h1>
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
        <h1 className="text-3xl font-semibold text-[#1A1A1A] mb-8">My Orders</h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#4CAF50] border-t-transparent rounded-full" />
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const address = typeof order.shippingAddress === "string"
                ? JSON.parse(order.shippingAddress)
                : order.shippingAddress;

              return (
                <div key={order.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  {/* Order header */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status.color}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">Rs. {Number(order.totalAmount).toFixed(0)}</p>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      {expandedOrder === order.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedOrder === order.id && (
                    <div className="p-4 border-t border-gray-100">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Shipping Address</h4>
                          <p className="text-sm">{address?.fullName}</p>
                          <p className="text-sm">{address?.street}</p>
                          <p className="text-sm">{address?.city}, {address?.state} - {address?.pincode}</p>
                          <p className="text-sm">{address?.phone}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Payment</h4>
                          <p className="text-sm capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</p>
                          <p className="text-sm capitalize">{order.paymentStatus}</p>
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800">{order.notes}</p>
                        </div>
                      )}

                      {order.status === "pending" && (
                        <button
                          onClick={() => cancelOrder.mutate({ id: order.id })}
                          className="text-sm text-red-500 hover:text-red-600 font-medium"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-400 mb-2">No orders yet</h2>
            <p className="text-gray-400 mb-6">Start shopping to see your orders here</p>
            <Link
              to="/shop"
              className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-medium hover:bg-[#43A047] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
