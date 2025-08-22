"use server";

import { db } from "@/db";
import { products, users } from "@/db/schema";
import { and, eq, ilike, or, gte, lte, sql } from "drizzle-orm";

export interface ProductFilters {
  search?: string;
  category?: string[];
  productType?: 'household' | 'industrial';
  condition?: 'excellent' | 'good' | 'fair';
  priceRange?: { min: number; max: number };
  location?: string[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    productType: string;
    condition: string;
    price: string;
    images: string[] | null;
    location: string;
    contactNumber: string;
    createdAt: Date;
    seller: {
      name: string;
      email: string;
    };
  }>;
  total: number;
  hasMore: boolean;
}

export async function getProducts(
  filters: ProductFilters = {},
  pagination: PaginationParams = {}
): Promise<ProductsResponse> {
  try {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(products.isActive, true)];

    // Search filter
    if (filters.search) {
      conditions.push(
        or(
          ilike(products.name, `%${filters.search}%`),
          ilike(products.description, `%${filters.search}%`),
          ilike(products.category, `%${filters.search}%`)
        )!
      );
    }

    // Category filter
    if (filters.category && filters.category.length > 0) {
      conditions.push(
        or(...filters.category.map(cat => eq(products.category, cat)))!
      );
    }

    // Product type filter
    if (filters.productType) {
      conditions.push(eq(products.productType, filters.productType));
    }

    // Condition filter
    if (filters.condition) {
      conditions.push(eq(products.condition, filters.condition));
    }

    // Price range filter
    if (filters.priceRange) {
      if (filters.priceRange.min) {
        conditions.push(gte(products.price, filters.priceRange.min.toString()));
      }
      if (filters.priceRange.max) {
        conditions.push(lte(products.price, filters.priceRange.max.toString()));
      }
    }

    // Location filter
    if (filters.location && filters.location.length > 0) {
      conditions.push(
        or(...filters.location.map(loc => eq(products.location, loc)))!
      );
    }

    // Get products with seller info
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        category: products.category,
        productType: products.productType,
        condition: products.condition,
        price: products.price,
        images: products.images,
        location: products.location,
        contactNumber: products.contactNumber,
        createdAt: products.createdAt,
        seller: {
          name: users.name,
          email: users.email,
        },
      })
      .from(products)
      .innerJoin(users, eq(products.sellerId, users.id))
      .where(and(...conditions))
      .orderBy(sql`${products.createdAt} DESC`)
      .limit(limit + 1)
      .offset(offset);

    // Check if there are more products
    const hasMore = result.length > limit;
    const productsData = hasMore ? result.slice(0, -1) : result;

    // Get total count for pagination
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .innerJoin(users, eq(products.sellerId, users.id))
      .where(and(...conditions));

    const total = totalResult[0]?.count || 0;

    return {
      products: productsData,
      total,
      hasMore,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

export async function searchProducts(query: string): Promise<ProductsResponse> {
  try {
    return await getProducts({ search: query });
  } catch (error) {
    console.error("Error searching products:", error);
    throw new Error("Failed to search products");
  }
}

export async function getProductById(id: string) {
  try {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        category: products.category,
        productType: products.productType,
        condition: products.condition,
        price: products.price,
        images: products.images,
        location: products.location,
        contactNumber: products.contactNumber,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        seller: {
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
        },
      })
      .from(products)
      .innerJoin(users, eq(products.sellerId, users.id))
      .where(and(eq(products.id, id), eq(products.isActive, true)))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw new Error("Failed to fetch product");
  }
}

export async function getRelatedProducts(sellerId: string, currentProductId: string, limit = 4) {
  try {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        category: products.category,
        condition: products.condition,
        price: products.price,
        images: products.images,
        location: products.location,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(
        and(
          eq(products.sellerId, sellerId),
          eq(products.isActive, true),
          sql`${products.id} != ${currentProductId}`
        )
      )
      .orderBy(sql`${products.createdAt} DESC`)
      .limit(limit);

    return result;
  } catch (error) {
    console.error("Error fetching related products:", error);
    throw new Error("Failed to fetch related products");
  }
}

export async function getProductCategories() {
  try {
    const result = await db
      .selectDistinct({ category: products.category })
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(products.category);

    return result.map(item => item.category);
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

export async function getProductLocations() {
  try {
    const result = await db
      .selectDistinct({ location: products.location })
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(products.location);

    return result.map(item => item.location);
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw new Error("Failed to fetch locations");
  }
}
