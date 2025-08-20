"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import ProductForm from "@/components/product-form";
import { createProduct } from "@/lib/product-actions";
import type { ProductFormData } from "@/lib/validation-schemas";

export default function AddProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    
    try {
      // Convert the form data to FormData for the server action
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("productType", data.productType);
      formData.append("condition", data.condition);
      formData.append("price", data.price.toString());
      formData.append("location", data.location);
      formData.append("contactNumber", data.contactNumber);
      
      // Add images as files (they are currently data URLs, need to convert back)
      // For now, we'll handle this in the server action
      data.images.forEach((image, index) => {
        formData.append("images", image);
      });

      const result = await createProduct(formData);
      
      if (result.success) {
        toast.success(result.message);
        router.push("/seller/products");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Product creation error:", error);
      toast.error("Failed to create product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/seller">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Add New Product</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Product Listing
          </h1>
          <p className="text-gray-600">
            Fill out the form below to add your product to ReTrade. Make sure to provide clear images and accurate descriptions.
          </p>
        </div>

        {/* Product Form */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Product Details</span>
            </CardTitle>
            <CardDescription>
              All fields marked with <span className="text-red-500">*</span> are required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              mode="create"
            />
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
