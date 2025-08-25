"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCartItems, updateCartItem, removeFromCart, CartSummary } from "@/lib/cart-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BuyerNav } from "@/components/buyer-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  ArrowRight,
  ShoppingBag
} from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const [cartData, setCartData] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await getCartItems();
      setCartData(data);
    } catch (error) {
      console.error("Error loading cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    try {
      setUpdatingItems(prev => new Set(prev).add(cartItemId));
      await updateCartItem(cartItemId, newQuantity);
      await loadCart(); // Reload cart to get updated totals
      toast.success("Cart updated successfully");
    } catch (error) {
      console.error("Error updating cart item:", error);
      toast.error("Failed to update cart item");
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(cartItemId));
      await removeFromCart(cartItemId);
      await loadCart(); // Reload cart to get updated totals
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing cart item:", error);
      toast.error("Failed to remove item");
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const handleCheckout = () => {
    router.push("/buyer/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BuyerNav />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="w-24 h-24" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BuyerNav />
        <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 64px)'}}>
          <div className="text-center space-y-6">
          <div className="text-gray-400 text-6xl">
            <ShoppingBag className="w-24 h-24 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
          <p className="text-gray-600 max-w-md">
            Looks like you haven't added any items to your cart yet. 
            Browse our products to find great deals!
          </p>
          <Button 
            onClick={() => router.push("/buyer/products")}
            size="lg"
          >
            Browse Products
          </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BuyerNav />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {cartData.totalItems} item{cartData.totalItems !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartData.items.map((item) => {
              const isUpdating = updatingItems.has(item.id);
              const itemTotal = parseFloat(item.product.price) * item.quantity;

              return (
                <Card key={item.id} className={isUpdating ? "opacity-50" : ""}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0">
                        <img
                          src={item.product.images?.[0] || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {item.product.description}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {item.product.category}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {item.product.condition}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <span>Seller: {item.product.seller.name}</span>
                          <span>•</span>
                          <span>{item.product.location}</span>
                        </div>
                      </div>

                      {/* Price and Controls */}
                      <div className="text-right space-y-4">
                        <div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatPrice(itemTotal)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatPrice(item.product.price)} each
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={isUpdating}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isUpdating}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cartData.totalItems} items)</span>
                    <span>{formatPrice(cartData.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span className="text-green-600">Free</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(cartData.totalAmount)}</span>
                </div>

                <Button 
                  onClick={handleCheckout}
                  size="lg" 
                  className="w-full"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => router.push("/buyer/products")}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-gray-900 mb-2">Delivery Information</h4>
                <p className="text-sm text-gray-600">
                  Items will be shipped directly from individual sellers. 
                  Delivery times may vary by location and seller.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
