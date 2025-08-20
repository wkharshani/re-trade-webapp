"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Tag, 
  MapPin, 
  Phone, 
  DollarSign,
  Info,
  AlertCircle
} from "lucide-react";
import ImageUpload from "./image-upload";
import { 
  productFormSchema, 
  productCategories, 
  productTypes, 
  productConditions,
  sriLankanCities 
} from "@/lib/validation-schemas";
import type { ProductFormData } from "@/lib/validation-schemas";

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}

export default function ProductForm({ 
  initialData, 
  onSubmit, 
  isSubmitting = false,
  mode = 'create'
}: ProductFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images || []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || undefined,
      productType: initialData?.productType || "household",
      condition: initialData?.condition || undefined,
      price: initialData?.price || 0,
      location: initialData?.location || undefined,
      contactNumber: initialData?.contactNumber || "",
      images: initialData?.images || [],
    },
    mode: "onBlur",
  });

  const selectedCategory = watch("category");
  const selectedProductType = watch("productType");
  const selectedCondition = watch("condition");
  


  // Custom validation function
  const isFormValid = () => {
    const formData = watch();
    const valid = (
      formData.name &&
      formData.description &&
      formData.category &&
      formData.condition &&
      formData.price > 0 &&
      formData.location &&
      formData.contactNumber &&
      images.length > 0
    );
    
    console.log("Form validation:", {
      name: !!formData.name,
      description: !!formData.description,
      category: !!formData.category,
      condition: !!formData.condition,
      price: formData.price > 0,
      location: !!formData.location,
      contactNumber: !!formData.contactNumber,
      images: images.length > 0,
      isValid: valid,
      isSubmitting
    });
    
    return valid;
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Images:", images);
    
    if (images.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    const formData = {
      ...data,
      images,
    };

    console.log("Final form data:", formData);
    console.log("Calling onSubmit...");
    
    try {
      await onSubmit(formData);
      console.log("onSubmit completed successfully");
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Basic Information</span>
          </CardTitle>
          <CardDescription>
            Provide the essential details about your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter product name"
              className={errors.name ? "border-red-500" : ""}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your product in detail..."
              rows={4}
              className={errors.description ? "border-red-500" : ""}
              {...register("description")}
            />
            <div className="flex justify-between items-center">
              {errors.description && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.description.message}</span>
                </p>
              )}
              <span className="text-xs text-gray-500">
                {watch("description")?.length || 0}/1000 characters
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category & Type Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="w-5 h-5" />
            <span>Category & Type</span>
          </CardTitle>
          <CardDescription>
            Help buyers find your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setValue("category", value as any);
                console.log("Category selected:", value);
              }}
            >
              <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {productCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.category.message}</span>
              </p>
            )}
          </div>

          {/* Product Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Product Type <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={selectedProductType}
              onValueChange={(value) => setValue("productType", value as "household" | "industrial")}
              className="grid grid-cols-1 gap-3"
            >
              {productTypes.map((type) => (
                <div key={type.value} className="relative">
                  <RadioGroupItem
                    value={type.value}
                    id={type.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={type.value}
                    className={`flex flex-col items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedProductType === type.value
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedProductType === type.value 
                          ? "border-blue-500 bg-blue-500" 
                          : "border-gray-300"
                      }`} />
                      <span className={`font-medium ${
                        selectedProductType === type.value ? "text-blue-700" : "text-gray-700"
                      }`}>
                        {type.label}
                      </span>
                    </div>
                    <span className={`text-sm mt-1 ${
                      selectedProductType === type.value ? "text-blue-600" : "text-gray-500"
                    }`}>
                      {type.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Condition & Pricing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Condition & Pricing</span>
          </CardTitle>
          <CardDescription>
            Set the condition and price for your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Condition */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Condition <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={selectedCondition}
              onValueChange={(value) => {
                setValue("condition", value as "excellent" | "good" | "fair");
                console.log("Condition selected:", value);
              }}
              className="grid grid-cols-1 gap-3"
            >
              {productConditions.map((condition) => (
                <div key={condition.value} className="relative">
                  <RadioGroupItem
                    value={condition.value}
                    id={condition.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={condition.value}
                    className={`flex flex-col items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedCondition === condition.value
                        ? "border-green-500 bg-green-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedCondition === condition.value 
                          ? "border-green-500 bg-green-500" 
                          : "border-gray-300"
                      }`} />
                      <span className={`font-medium ${
                        selectedCondition === condition.value ? "text-green-700" : "text-gray-700"
                      }`}>
                        {condition.label}
                      </span>
                    </div>
                    <span className={`text-sm mt-1 ${
                      selectedCondition === condition.value ? "text-green-600" : "text-gray-500"
                    }`}>
                      {condition.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.condition && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.condition.message}</span>
              </p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium text-gray-700">
              Price (LKR) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                LKR
              </span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="1"
                max="10000000"
                placeholder="0.00"
                className={`pl-12 ${errors.price ? "border-red-500" : ""}`}
                {...register("price", { valueAsNumber: true })}
              />
            </div>
            {errors.price && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.price.message}</span>
              </p>
            )}
            <p className="text-xs text-gray-500">
              Price range: 1 LKR - 10,000,000 LKR
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location & Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Location & Contact</span>
          </CardTitle>
          <CardDescription>
            Where buyers can find and contact you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Location <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("location")}
              onValueChange={(value) => setValue("location", value)}
            >
              <SelectTrigger className={errors.location ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your location" />
              </SelectTrigger>
              <SelectContent>
                {sriLankanCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.location && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.location.message}</span>
              </p>
            )}
          </div>

          {/* Contact Number */}
          <div className="space-y-2">
            <Label htmlFor="contactNumber" className="text-sm font-medium text-gray-700">
              Contact Number <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="contactNumber"
                type="tel"
                placeholder="+94xxxxxxxxx or 0xxxxxxxxx"
                className="pl-10"
                {...register("contactNumber")}
              />
            </div>
            {errors.contactNumber && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.contactNumber.message}</span>
              </p>
            )}
            <p className="text-xs text-gray-500">
              Enter a valid Sri Lankan phone number
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Images Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Product Images</span>
          </CardTitle>
          <CardDescription>
            Upload clear images of your product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={3}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          onClick={() => {
            console.log("Button clicked! Form valid:", isFormValid());
            console.log("Current form values:", watch());
            console.log("Images:", images);
            console.log("isSubmitting:", isSubmitting);
          }}
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{mode === 'create' ? 'Creating...' : 'Updating...'}</span>
            </div>
          ) : (
            <span>{mode === 'create' ? 'Create Product' : 'Update Product'}</span>
          )}
        </Button>
      </div>
    </form>
  );
}
