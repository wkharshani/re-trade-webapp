"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCartItems, CartSummary } from "@/lib/cart-actions";
import { createOrder, OrderData } from "@/lib/order-actions";
import { getCurrentUser } from "@/lib/user-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BuyerNav } from "@/components/buyer-nav";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  User,
  CreditCard,
  Truck,
  ArrowLeft,
  Lock,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const checkoutSchema = z.object({
  buyerName: z.string().min(2, "Name must be at least 2 characters"),
  buyerEmail: z.string().email("Please enter a valid email address"),
  buyerPhone: z.string().min(10, "Please enter a valid phone number"),
  shippingAddress: z.string().min(10, "Please enter a complete shipping address"),
});

interface User {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartData, setCartData] = useState<CartSummary | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<OrderData>({
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    shippingAddress: "",
  });

  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        setLoading(true);
        const [cartResponse, userResponse] = await Promise.all([
          getCartItems(),
          getCurrentUser(),
        ]);

        if (!userResponse) {
          toast.error("Please log in to continue");
          router.push("/login");
          return;
        }

        if (cartResponse.items.length === 0) {
          toast.error("Your cart is empty");
          router.push("/buyer/cart");
          return;
        }

        setCartData(cartResponse);
        setUser(userResponse);
        
        // Pre-fill form with user data
        setFormData({
          buyerName: userResponse.name,
          buyerEmail: userResponse.email,
          buyerPhone: userResponse.phone || "",
          shippingAddress: "",
        });
      } catch (error) {
        console.error("Error loading checkout data:", error);
        toast.error("Failed to load checkout information");
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutData();
  }, [router]);

  const handleInputChange = (field: keyof OrderData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    try {
      checkoutSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await createOrder(formData);
      
      toast.success("Order placed successfully!");
      router.push(`/buyer/orders/${result.orderId}`);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to place order");
    } finally {
      setIsSubmitting(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </CardContent>
              </Card>
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

  if (!cartData || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-4">Unable to load checkout information.</p>
          <Button onClick={() => router.push("/buyer/cart")}>
            Return to Cart
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BuyerNav />
      <div className="container mx-auto px-4 max-w-6xl py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="buyerName">Full Name *</Label>
                      <Input
                        id="buyerName"
                        value={formData.buyerName}
                        onChange={(e) => handleInputChange("buyerName", e.target.value)}
                        placeholder="Enter your full name"
                        className={errors.buyerName ? "border-red-500" : ""}
                      />
                      {errors.buyerName && (
                        <p className="text-sm text-red-600 mt-1">{errors.buyerName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="buyerEmail">Email Address *</Label>
                      <Input
                        id="buyerEmail"
                        type="email"
                        value={formData.buyerEmail}
                        onChange={(e) => handleInputChange("buyerEmail", e.target.value)}
                        placeholder="Enter your email address"
                        className={errors.buyerEmail ? "border-red-500" : ""}
                      />
                      {errors.buyerEmail && (
                        <p className="text-sm text-red-600 mt-1">{errors.buyerEmail}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="buyerPhone">Phone Number *</Label>
                    <Input
                      id="buyerPhone"
                      value={formData.buyerPhone}
                      onChange={(e) => handleInputChange("buyerPhone", e.target.value)}
                      placeholder="Enter your phone number"
                      className={errors.buyerPhone ? "border-red-500" : ""}
                    />
                    {errors.buyerPhone && (
                      <p className="text-sm text-red-600 mt-1">{errors.buyerPhone}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="shippingAddress">Complete Address *</Label>
                    <Textarea
                      id="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={(e) => handleInputChange("shippingAddress", e.target.value)}
                      placeholder="Enter your complete shipping address including street, city, postal code"
                      className={`min-h-24 ${errors.shippingAddress ? "border-red-500" : ""}`}
                    />
                    {errors.shippingAddress && (
                      <p className="text-sm text-red-600 mt-1">{errors.shippingAddress}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-2">
                      Please provide a detailed address to ensure accurate delivery
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Cash on Delivery</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      Payment will be collected when your order is delivered. 
                      No online payment required at this time.
                    </p>
                  </div>
                </CardContent>
              </Card>
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
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cartData.items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.product.images?.[0] || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(parseFloat(item.product.price) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({cartData.totalItems} items)</span>
                      <span>{formatPrice(cartData.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Payment Fee</span>
                      <span className="text-green-600">Free</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(cartData.totalAmount)}</span>
                  </div>

                  {/* Place Order Button */}
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    size="lg" 
                    className="w-full"
                  >
                    {isSubmitting ? (
                      "Placing Order..."
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-600 text-center">
                    By placing your order, you agree to our terms and conditions.
                  </p>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">Secure Checkout</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Your information is protected and secure. We never store payment details.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
