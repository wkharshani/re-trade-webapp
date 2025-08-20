"use server";

import { z } from "zod";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { productFormSchema, productSchema } from "./validation-schemas";
import { uploadMultipleImages, deleteMultipleImages } from "./blob-utils";
import { revalidatePath } from "next/cache";

// Create new product
export async function createProduct(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      productType: formData.get("productType") as string,
      condition: formData.get("condition") as string,
      price: parseFloat(formData.get("price") as string),
      location: formData.get("location") as string,
      contactNumber: formData.get("contactNumber") as string,
    };

    // Validate input data
    const validatedData = productSchema.parse(rawData);

    // Handle image uploads
    const imageFiles: File[] = [];
    const imageInputs = formData.getAll("images") as File[];
    
    for (const file of imageInputs) {
      if (file instanceof File && file.size > 0) {
        imageFiles.push(file);
      }
    }

    if (imageFiles.length === 0) {
      return { success: false, error: "At least one image is required" };
    }

    if (imageFiles.length > 3) {
      return { success: false, error: "Maximum 3 images allowed" };
    }

    // Upload images to Vercel Blob
    const uploadResults = await uploadMultipleImages(imageFiles);
    const failedUploads = uploadResults.filter(result => !result.success);
    
    if (failedUploads.length > 0) {
      return { success: false, error: "Some images failed to upload" };
    }

    const imageUrls = uploadResults.map(result => result.url);

    // TODO: Get actual seller ID from session
    const sellerId = "00000000-0000-0000-0000-000000000001"; // Valid UUID format for testing

    // Create product in database
    const newProduct = await db.insert(products).values({
      sellerId,
      name: validatedData.name,
      description: validatedData.description,
      category: validatedData.category,
      productType: validatedData.productType,
      condition: validatedData.condition,
      price: validatedData.price.toString(),
      images: imageUrls,
      location: validatedData.location,
      contactNumber: validatedData.contactNumber,
      isActive: true,
    }).returning();

    revalidatePath("/seller/products");
    revalidatePath("/seller");

    return { 
      success: true, 
      message: "Product created successfully",
      product: newProduct[0]
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { success: false, error: firstError?.message || "Validation failed" };
    }
    console.error("Product creation error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

// Update existing product
export async function updateProduct(productId: string, formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      productType: formData.get("productType") as string,
      condition: formData.get("condition") as string,
      price: parseFloat(formData.get("price") as string),
      location: formData.get("location") as string,
      contactNumber: formData.get("contactNumber") as string,
    };

    // Validate input data
    const validatedData = productSchema.parse(rawData);

    // Get existing product to check images
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (existingProduct.length === 0) {
      return { success: false, error: "Product not found" };
    }

    const currentImages = existingProduct[0].images || [];
    const newImageFiles: File[] = [];
    const imageInputs = formData.getAll("images") as File[];
    
    for (const file of imageInputs) {
      if (file instanceof File && file.size > 0) {
        newImageFiles.push(file);
      }
    }

    let finalImageUrls = [...currentImages];

    // Handle new image uploads
    if (newImageFiles.length > 0) {
      const uploadResults = await uploadMultipleImages(newImageFiles);
      const failedUploads = uploadResults.filter(result => !result.success);
      
      if (failedUploads.length > 0) {
        return { success: false, error: "Some new images failed to upload" };
      }

      const newImageUrls = uploadResults.map(result => result.url);
      finalImageUrls = [...currentImages, ...newImageUrls];
    }

    // Handle image removal (if any)
    const removedImages = formData.getAll("removedImages") as string[];
    if (removedImages.length > 0) {
      finalImageUrls = finalImageUrls.filter(url => !removedImages.includes(url));
      
      // Delete removed images from blob storage
      await deleteMultipleImages(removedImages);
    }

    if (finalImageUrls.length === 0) {
      return { success: false, error: "At least one image is required" };
    }

    if (finalImageUrls.length > 3) {
      return { success: false, error: "Maximum 3 images allowed" };
    }

    // Update product in database
    const updatedProduct = await db
      .update(products)
      .set({
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        productType: validatedData.productType,
        condition: validatedData.condition,
        price: validatedData.price.toString(),
        images: finalImageUrls,
        location: validatedData.location,
        contactNumber: validatedData.contactNumber,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
      .returning();

    revalidatePath("/seller/products");
    revalidatePath("/seller");

    return { 
      success: true, 
      message: "Product updated successfully",
      product: updatedProduct[0]
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { success: false, error: firstError?.message || "Validation failed" };
    }
    console.error("Product update error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

// Delete product
export async function deleteProduct(productId: string) {
  try {
    // Get product to access images
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (product.length === 0) {
      return { success: false, error: "Product not found" };
    }

    const productImages = product[0].images || [];

    // Delete images from blob storage
    if (productImages.length > 0) {
      await deleteMultipleImages(productImages);
    }

    // Delete product from database
    await db.delete(products).where(eq(products.id, productId));

    revalidatePath("/seller/products");
    revalidatePath("/seller");

    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    console.error("Product deletion error:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

// Toggle product status (active/inactive)
export async function toggleProductStatus(productId: string) {
  try {
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (product.length === 0) {
      return { success: false, error: "Product not found" };
    }

    const currentStatus = product[0].isActive;
    const newStatus = !currentStatus;

    await db
      .update(products)
      .set({ 
        isActive: newStatus,
        updatedAt: new Date()
      })
      .where(eq(products.id, productId));

    revalidatePath("/seller/products");
    revalidatePath("/seller");

    return { 
      success: true, 
      message: `Product ${newStatus ? 'activated' : 'deactivated'} successfully`,
      isActive: newStatus
    };
  } catch (error) {
    console.error("Product status toggle error:", error);
    return { success: false, error: "Failed to update product status" };
  }
}

// Get seller's products with filtering and pagination
export async function getSellerProducts(
  sellerId: string,
  options: {
    page?: number;
    limit?: number;
    category?: string;
    condition?: string;
    status?: boolean;
    search?: string;
    sortBy?: 'name' | 'price' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  } = {}
) {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      condition,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const offset = (page - 1) * limit;

    // Build where conditions
    let whereConditions = [eq(products.sellerId, sellerId)];
    
    if (category) {
      whereConditions.push(eq(products.category, category));
    }
    
    if (condition) {
      whereConditions.push(eq(products.condition, condition));
    }
    
    if (status !== undefined) {
      whereConditions.push(eq(products.isActive, status));
    }
    
    if (search) {
      whereConditions.push(
        // Add search functionality here if needed
        eq(products.name, search)
      );
    }

    // Build order by
    let orderBy;
    switch (sortBy) {
      case 'name':
        orderBy = sortOrder === 'asc' ? asc(products.name) : desc(products.name);
        break;
      case 'price':
        orderBy = sortOrder === 'asc' ? asc(products.price) : desc(products.price);
        break;
      default:
        orderBy = sortOrder === 'asc' ? asc(products.createdAt) : desc(products.createdAt);
    }

    // Get products
    const sellerProducts = await db
      .select()
      .from(products)
      .where(and(...whereConditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: products.id })
      .from(products)
      .where(and(...whereConditions));

    return {
      success: true,
      products: sellerProducts,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / limit)
      }
    };
  } catch (error) {
    console.error("Get seller products error:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

// Get single product by ID
export async function getProductById(productId: string) {
  try {
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (product.length === 0) {
      return { success: false, error: "Product not found" };
    }

    return { success: true, product: product[0]! };
  } catch (error) {
    console.error("Get product by ID error:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}
