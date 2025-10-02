import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price_mzn: integer("price_mzn").notNull(),
  price_usd: decimal("price_usd", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull(),
  images: jsonb("images").$type<string[]>().default([]),
  specifications: jsonb("specifications").$type<Record<string, string>>().default({}),
  status: text("status").default("active"),
  created_at: timestamp("created_at").default(sql`now()`),
  updated_at: timestamp("updated_at").default(sql`now()`),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customer_name: text("customer_name").notNull(),
  customer_email: text("customer_email").notNull(),
  customer_phone: text("customer_phone").notNull(),
  customer_company: text("customer_company"),
  delivery_address: text("delivery_address").notNull(),
  delivery_city: text("delivery_city").notNull(),
  delivery_postal_code: text("delivery_postal_code"),
  delivery_option: text("delivery_option").notNull(),
  payment_method: text("payment_method").notNull(),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  total_mzn: integer("total_mzn").notNull(),
  total_usd: decimal("total_usd", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"),
  notes: text("notes"),
  created_at: timestamp("created_at").default(sql`now()`),
});

export const cart_items = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  session_id: text("session_id").notNull(),
  product_id: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  created_at: timestamp("created_at").default(sql`now()`),
});

export const admin_users = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  created_at: timestamp("created_at").default(sql`now()`),
});

export interface OrderItem {
  product_id: string;
  product_name: string;
  price_mzn: number;
  price_usd: number;
  quantity: number;
  total_mzn: number;
  total_usd: number;
}

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  category: true,
  price_mzn: true,
  price_usd: true,
  stock: true,
  images: true,
  specifications: true,
  status: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  customer_name: true,
  customer_email: true,
  customer_phone: true,
  customer_company: true,
  delivery_address: true,
  delivery_city: true,
  delivery_postal_code: true,
  delivery_option: true,
  payment_method: true,
  items: true,
  total_mzn: true,
  total_usd: true,
  notes: true,
});

export const insertCartItemSchema = createInsertSchema(cart_items).pick({
  session_id: true,
  product_id: true,
  quantity: true,
});

export const insertAdminUserSchema = createInsertSchema(admin_users).pick({
  email: true,
  password: true,
  name: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cart_items.$inferSelect;

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof admin_users.$inferSelect;
