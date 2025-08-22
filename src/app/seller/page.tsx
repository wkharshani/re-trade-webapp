import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  LogOut, 
  Settings, 
  Plus
} from "lucide-react";
import Link from "next/link";
import { getSellerProducts } from "@/lib/product-actions";
import { requireSellerAuth } from "@/lib/session";
import SellerDashboardClient from "./seller-dashboard-client";

export default async function SellerPage() {
  // Get authenticated seller from session
  const session = await requireSellerAuth();
  
  // Load products for the authenticated seller
  const productsResult = await getSellerProducts(session.userId, { limit: 100 });
  const products = productsResult.success ? productsResult.products || [] : [];

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const totalValue = products.reduce((sum, p) => sum + Number(p.price), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ReTrade</span>
              <Badge variant="secondary" className="ml-3 bg-green-100 text-green-800">
                Seller Dashboard
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Add Product Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {session.name}! 👋
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your ReTrade business today.
            </p>
          </div>
          <Link href="/seller/products/add">
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </Button>
          </Link>
        </div>

        <SellerDashboardClient 
          products={products}
          totalProducts={totalProducts}
          activeProducts={activeProducts}
          totalValue={totalValue}
        />
      </main>
    </div>
  );
}
