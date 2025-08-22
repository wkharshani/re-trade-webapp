"use server";

import { db } from "@/db";
import { cart, products, users } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export interface CartItem {
  id: string;
  quantity: number;
  addedAt: Date;
  product: {
    id: string;
    name: string;
    description: string;
    category: string;
    condition: string;
    price: string;
    images: string[] | null;
    location: string;
    seller: {
      name: string;
      email: string;
    };
  };
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export async function addToCart(productId: string, quantity: number = 1) {
  try {
    const user = await getSession();
    if (!user.isLoggedIn) {
      throw new Error("You must be logged in to add items to cart");
    }

    if (user.role !== "buyer") {
      throw new Error("Only buyers can add items to cart");
    }

    // Check if product exists and is active
    const product = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.isActive, true)))
      .limit(1);

    if (!product[0]) {
      throw new Error("Product not found or unavailable");
    }

    // Check if item already exists in cart
    const existingCartItem = await db
      .select()
      .from(cart)
      .where(and(eq(cart.buyerId, user.userId), eq(cart.productId, productId)))
      .limit(1);

    if (existingCartItem[0]) {
      // Update quantity if item exists
      await db
        .update(cart)
        .set({ 
          quantity: existingCartItem[0].quantity + quantity,
          addedAt: new Date()
        })
        .where(eq(cart.id, existingCartItem[0].id));
    } else {
      // Add new item to cart
      await db.insert(cart).values({
        buyerId: user.userId,
        productId,
        quantity,
      });
    }

    revalidatePath("/buyer/cart");
    return { success: true, message: "Item added to cart successfully" };
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to add item to cart");
  }
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  try {
    const user = await getSession();
    if (!user.isLoggedIn) {
      throw new Error("You must be logged in to update cart");
    }

    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    // Verify cart item belongs to user
    const cartItem = await db
      .select()
      .from(cart)
      .where(and(eq(cart.id, cartItemId), eq(cart.buyerId, user.userId)))
      .limit(1);

    if (!cartItem[0]) {
      throw new Error("Cart item not found");
    }

    await db
      .update(cart)
      .set({ quantity })
      .where(eq(cart.id, cartItemId));

    revalidatePath("/buyer/cart");
    return { success: true, message: "Cart updated successfully" };
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update cart item");
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    const user = await getSession();
    if (!user.isLoggedIn) {
      throw new Error("You must be logged in to remove items from cart");
    }

    // Verify cart item belongs to user
    const cartItem = await db
      .select()
      .from(cart)
      .where(and(eq(cart.id, cartItemId), eq(cart.buyerId, user.userId)))
      .limit(1);

    if (!cartItem[0]) {
      throw new Error("Cart item not found");
    }

    await db.delete(cart).where(eq(cart.id, cartItemId));

    revalidatePath("/buyer/cart");
    return { success: true, message: "Item removed from cart" };
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to remove item from cart");
  }
}

export async function getCartItems(): Promise<CartSummary> {
  try {
    const user = await getSession();
    if (!user.isLoggedIn) {
      return { items: [], totalItems: 0, totalAmount: 0 };
    }

    const cartItemsRaw = await db
      .select({
        cartId: cart.id,
        quantity: cart.quantity,
        addedAt: cart.addedAt,
        productId: products.id,
        productName: products.name,
        productDescription: products.description,
        productCategory: products.category,
        productCondition: products.condition,
        productPrice: products.price,
        productImages: products.images,
        productLocation: products.location,
        sellerName: users.name,
        sellerEmail: users.email,
      })
      .from(cart)
      .innerJoin(products, and(eq(cart.productId, products.id), eq(products.isActive, true)))
      .innerJoin(users, eq(products.sellerId, users.id))
      .where(eq(cart.buyerId, user.userId))
      .orderBy(sql`${cart.addedAt} DESC`);

    const cartItems = cartItemsRaw.map(item => ({
      id: item.cartId,
      quantity: item.quantity,
      addedAt: item.addedAt,
      product: {
        id: item.productId,
        name: item.productName,
        description: item.productDescription,
        category: item.productCategory,
        condition: item.productCondition,
        price: item.productPrice,
        images: item.productImages,
        location: item.productLocation,
        seller: {
          name: item.sellerName,
          email: item.sellerEmail,
        },
      },
    }));

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.product.price) * item.quantity);
    }, 0);

    return {
      items: cartItems,
      totalItems,
      totalAmount,
    };
  } catch (error) {
    console.error("Error fetching cart items:", error);
    throw new Error("Failed to fetch cart items");
  }
}

export async function clearCart() {
  try {
    const user = await getSession();
    if (!user.isLoggedIn) {
      throw new Error("You must be logged in to clear cart");
    }

    await db.delete(cart).where(eq(cart.buyerId, user.userId));

    revalidatePath("/buyer/cart");
    return { success: true, message: "Cart cleared successfully" };
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw new Error("Failed to clear cart");
  }
}

export async function getCartItemCount(): Promise<number> {
  try {
    const user = await getSession();
    if (!user.isLoggedIn) {
      return 0;
    }

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(cart)
      .where(eq(cart.buyerId, user.userId));

    return result[0]?.count || 0;
  } catch (error) {
    console.error("Error fetching cart item count:", error);
    return 0;
  }
}

export async function validateCartItem(productId: string, quantity: number) {
  try {
    // Check if product exists and is active
    const product = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.isActive, true)))
      .limit(1);

    if (!product[0]) {
      return { valid: false, message: "Product not found or unavailable" };
    }

    if (quantity <= 0) {
      return { valid: false, message: "Quantity must be greater than 0" };
    }

    return { valid: true, product: product[0] };
  } catch (error) {
    console.error("Error validating cart item:", error);
    return { valid: false, message: "Failed to validate cart item" };
  }
}
