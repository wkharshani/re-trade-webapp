"use server";

import { db } from "@/db";
import { orders, orderItems, cart, products, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export interface OrderData {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  shippingAddress: string;
}

export interface OrderDetails {
  id: string;
  orderNumber: string;
  totalAmount: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  shippingAddress: string;
  createdAt: Date;
  items: Array<{
    id: string;
    quantity: number;
    price: string;
    productName: string;
    product: {
      id: string;
      images: string[] | null;
      category: string;
      condition: string;
      location: string;
    };
  }>;
}

export async function generateOrderNumber(): Promise<string> {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RT-${timestamp.slice(-6)}${random}`;
}

export async function createOrder(orderData: OrderData) {
  try {
    const user = await getSession();
    if (!user.isLoggedIn) {
      throw new Error("You must be logged in to place an order");
    }

    if (user.role !== "buyer") {
      throw new Error("Only buyers can place orders");
    }

    // Get cart items
    const cartItems = await db
      .select({
        id: cart.id,
        productId: cart.productId,
        quantity: cart.quantity,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          isActive: products.isActive,
        },
      })
      .from(cart)
      .innerJoin(products, eq(cart.productId, products.id))
      .where(eq(cart.buyerId, user.userId));

    if (cartItems.length === 0) {
      throw new Error("Your cart is empty");
    }

    // Validate all products are still active
    const inactiveProducts = cartItems.filter(item => !item.product.isActive);
    if (inactiveProducts.length > 0) {
      throw new Error("Some items in your cart are no longer available");
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.product.price) * item.quantity);
    }, 0);

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order without transaction (Neon HTTP driver doesn't support transactions)
    const [newOrder] = await db
      .insert(orders)
      .values({
        buyerId: user.userId,
        orderNumber,
        totalAmount: totalAmount.toString(),
        buyerName: orderData.buyerName,
        buyerEmail: orderData.buyerEmail,
        buyerPhone: orderData.buyerPhone,
        shippingAddress: orderData.shippingAddress,
      })
      .returning();

    // Create order items
    const orderItemsData = cartItems.map(item => ({
      orderId: newOrder.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
      productName: item.product.name,
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Clear the cart
    await db.delete(cart).where(eq(cart.buyerId, user.userId));

    const result = newOrder;

    revalidatePath("/buyer/cart");
    revalidatePath("/buyer/orders");

    return {
      success: true,
      orderId: result.id,
      orderNumber: result.orderNumber,
      message: "Order placed successfully",
    };
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to create order");
  }
}

export async function getOrderById(orderId: string): Promise<OrderDetails | null> {
  try {
    const user = await getSession();
    if (!user.isLoggedIn) {
      throw new Error("You must be logged in to view orders");
    }

    // Get order details
    const orderResult = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.buyerId, user.userId)))
      .limit(1);

    if (!orderResult[0]) {
      return null;
    }

    // Get order items
    const itemsResult = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        price: orderItems.price,
        productName: orderItems.productName,
        product: {
          id: products.id,
          images: products.images,
          category: products.category,
          condition: products.condition,
          location: products.location,
        },
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    return {
      ...orderResult[0],
      items: itemsResult,
    };
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    throw new Error("Failed to fetch order details");
  }
}

export async function getUserOrders(page: number = 1, limit: number = 10) {
  try {
    const user = await getSession();
    if (!user.isLoggedIn) {
      throw new Error("You must be logged in to view orders");
    }

    const offset = (page - 1) * limit;

    // Get orders with basic info
    const ordersResult = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.buyerId, user.userId))
      .orderBy(sql`${orders.createdAt} DESC`)
      .limit(limit + 1)
      .offset(offset);

    // Check if there are more orders
    const hasMore = ordersResult.length > limit;
    const ordersList = hasMore ? ordersResult.slice(0, -1) : ordersResult;

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.buyerId, user.userId));

    const total = totalResult[0]?.count || 0;

    return {
      orders: ordersList,
      total,
      hasMore,
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw new Error("Failed to fetch orders");
  }
}

export async function getOrderSummary(orderId: string) {
  try {
    const user = await getSession();
    if (!user) {
      throw new Error("You must be logged in to view order summary");
    }

    const orderDetails = await getOrderById(orderId);
    if (!orderDetails) {
      throw new Error("Order not found");
    }

    // Calculate summary statistics
    const totalItems = orderDetails.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = parseFloat(orderDetails.totalAmount);

    return {
      order: orderDetails,
      summary: {
        totalItems,
        subtotal,
        deliveryFee: 0, // No delivery fee for now
        total: subtotal,
      },
    };
  } catch (error) {
    console.error("Error fetching order summary:", error);
    throw new Error("Failed to fetch order summary");
  }
}

export async function cancelOrder(orderId: string) {
  try {
    const user = await getSession();
    if (!user) {
      throw new Error("You must be logged in to cancel orders");
    }

    // Check if order exists and belongs to user
    const order = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.buyerId, user.userId)))
      .limit(1);

    if (!order[0]) {
      throw new Error("Order not found");
    }

    if (order[0].status !== 'pending') {
      throw new Error("Only pending orders can be cancelled");
    }

    // Update order status
    await db
      .update(orders)
      .set({ status: 'cancelled' })
      .where(eq(orders.id, orderId));

    revalidatePath("/buyer/orders");
    revalidatePath(`/buyer/orders/${orderId}`);

    return {
      success: true,
      message: "Order cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to cancel order");
  }
}

export async function getOrderStats() {
  try {
    const user = await getSession();
    if (!user) {
      return {
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        completedOrders: 0,
      };
    }

    // Get order statistics
    const statsResult = await db
      .select({
        totalOrders: sql<number>`count(*)`,
        totalSpent: sql<number>`sum(${orders.totalAmount})`,
        pendingOrders: sql<number>`sum(case when ${orders.status} = 'pending' then 1 else 0 end)`,
        completedOrders: sql<number>`sum(case when ${orders.status} = 'confirmed' then 1 else 0 end)`,
      })
      .from(orders)
      .where(eq(orders.buyerId, user.userId));

    const stats = statsResult[0];

    return {
      totalOrders: stats.totalOrders || 0,
      totalSpent: parseFloat(stats.totalSpent?.toString() || '0'),
      pendingOrders: stats.pendingOrders || 0,
      completedOrders: stats.completedOrders || 0,
    };
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return {
      totalOrders: 0,
      totalSpent: 0,
      pendingOrders: 0,
      completedOrders: 0,
    };
  }
}
