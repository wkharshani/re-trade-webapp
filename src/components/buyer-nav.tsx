"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package } from "lucide-react";
import { logoutUser } from "@/lib/auth-actions";
import { toast } from "sonner";

export function BuyerNav() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if (result.success) {
        toast.success(result.message);
        router.push(result.redirectPath || "/login");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <button 
              onClick={() => router.push("/buyer")}
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              ReTrade
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/buyer/cart")}
              className="relative"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/buyer/orders")}
            >
              <Package className="w-4 h-4 mr-2" />
              Orders
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
