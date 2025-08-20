"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSession, getRedirectPath } from "./session";

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  userType: z.enum(['seller', 'buyer']).default('buyer'),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function registerUser(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      phone: formData.get("phone") as string,
      userType: (formData.get("userType") as 'seller' | 'buyer') || 'buyer',
    };

    // Validate input
    const validatedData = registerSchema.parse(rawData);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email.toLowerCase()));

    if (existingUser.length > 0) {
      return { success: false, error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    await db.insert(users).values({
      name: validatedData.name,
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      phone: validatedData.phone || null,
      userType: validatedData.userType,
    });

    return { success: true, message: "User registered successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { success: false, error: firstError?.message || "Validation failed" };
    }
    return { success: false, error: "Registration failed" };
  }
}

export async function loginUser(formData: FormData) {
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Validate input
    const validatedData = loginSchema.parse(rawData);

    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email.toLowerCase()));

    if (user.length === 0) {
      return { success: false, error: "Invalid email or password" };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      user[0].password
    );

    if (!isValidPassword) {
      return { success: false, error: "Invalid email or password" };
    }

    // Create session and redirect path
    const session = createSession(user[0]);
    const redirectPath = getRedirectPath(user[0].userType);

    return { 
      success: true, 
      message: "Login successful", 
      user: user[0],
      session,
      redirectPath 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { success: false, error: firstError?.message || "Validation failed" };
    }
    return { success: false, error: "Login failed" };
  }
}
