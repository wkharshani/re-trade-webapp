"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Package,
  Eye,
  DollarSign,
  Users,
  Edit,
  Trash2,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import { deleteProduct, toggleProductStatus } from "@/lib/product-actions";
import { toast } from "sonner";
import type { Product } from "@/db/schema";

interface SellerDashboardClientProps {
  products: Product[];
  totalProducts: number;
  activeProducts: number;
  totalValue: number;
}

export default function SellerDashboardClient({ 
  products, 
  totalProducts, 
  activeProducts, 
  totalValue 
}: SellerDashboardClientProps) {
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (productId: string) => {
    try {
      setIsLoading(true);
      const result = await deleteProduct(productId);
      if (result.success) {
        toast.success(result.message);
        // Remove the deleted product from local state
        setLocalProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (productId: string) => {
    try {
      setIsLoading(true);
      const result = await toggleProductStatus(productId);
      if (result.success) {
        toast.success(result.message);
        // Update the product status in local state
        setLocalProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, isActive: !p.isActive } : p
        ));
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error toggling product status:", error);
      toast.error("Failed to update product status");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Update local stats based on current local products
  const currentTotalProducts = localProducts.length;
  const currentActiveProducts = localProducts.filter(p => p.isActive).length;
  const currentTotalValue = localProducts.reduce((sum, p) => sum + Number(p.price), 0);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{currentTotalProducts}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">{currentActiveProducts}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Eye className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  LKR {currentTotalValue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">1,250</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">All Listed Products</h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Processing...</p>
            </div>
          ) : localProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-6">Start building your inventory by adding your first product</p>
              <Link href="/seller/products/add">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  <Package className="w-4 h-4 mr-2" />
                  Add Your First Product
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Condition</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {localProducts.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <img 
                                src={product.images[0]} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {product.category}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {product.condition}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">
                          {formatPrice(Number(product.price))}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant={product.isActive ? "default" : "secondary"}
                          className={product.isActive ? "bg-green-500" : "bg-gray-500"}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Link href={`/seller/products/${product.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleToggleStatus(product.id)}
                            disabled={isLoading}
                          >
                            {product.isActive ? (
                              <EyeOff className="w-4 h-4 text-orange-600" />
                            ) : (
                              <Eye className="w-4 h-4 text-green-600" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
