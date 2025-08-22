"use server";

import { getSession } from "@/lib/session";

export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return null;
    }
    return {
      userId: session.userId,
      name: session.name,
      email: session.email,
      phone: "", // We don't store phone in session, will need to get from database if needed
      role: session.role,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
