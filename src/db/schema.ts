import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";

export const userTypeEnum = pgEnum('user_type', ['seller', 'buyer']);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  userType: userTypeEnum("user_type").notNull().default('buyer'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
