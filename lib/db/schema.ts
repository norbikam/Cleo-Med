import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  integer,
  jsonb,
  numeric,
  text,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: varchar("phone", { length: 20 }).unique().notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  passwordHash: varchar("password_hash", { length: 255 }),
  role: varchar("role", { length: 20 }).notNull().default("client"),
  active: boolean("active").notNull().default(true),
  freeShipping: boolean("free_shipping").notNull().default(false),
  priceDiscountPercent: numeric("price_discount_percent", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const clientPhones = pgTable("client_phones", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  phone: varchar("phone", { length: 20 }).unique().notNull(),
  label: varchar("label", { length: 100 }),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const clientAddresses = pgTable("client_addresses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  label:       varchar("label",       { length: 100 }).notNull(),
  fullname:    varchar("fullname",    { length: 255 }).notNull(),
  company:     varchar("company",     { length: 255 }),
  email:       varchar("email",       { length: 255 }),
  phone:       varchar("phone",       { length: 20 }),
  courierType: varchar("courier_type",{ length: 50 }),
  lockerCode:  varchar("locker_code", { length: 100 }),
  lockerName:  varchar("locker_name", { length: 255 }),
  street:      varchar("street",      { length: 255 }).notNull(),
  city:        varchar("city",        { length: 100 }).notNull(),
  postcode:    varchar("postcode",    { length: 10 }).notNull(),
  isDefault:   boolean("is_default").notNull().default(false),
  createdAt:   timestamp("created_at").default(sql`now()`),
});

export const blOrderCache = pgTable("bl_order_cache", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  blOrderId: varchar("bl_order_id", { length: 50 }).unique().notNull(),
  statusId: integer("status_id"),
  statusName: varchar("status_name", { length: 100 }),
  products: jsonb("products").notNull(),
  total: numeric("total", { precision: 10, scale: 2 }),
  deliveryFullname: varchar("delivery_fullname", { length: 255 }),
  deliveryAddress: varchar("delivery_address", { length: 255 }),
  deliveryCity: varchar("delivery_city", { length: 100 }),
  deliveryPrice: numeric("delivery_price", { precision: 10, scale: 2 }),
  deliveryMethod: varchar("delivery_method", { length: 100 }),
  trackingNumber: varchar("tracking_number", { length: 255 }),
  userComments: text("user_comments"),
  orderDate: timestamp("order_date"),
  customSourceId: integer("custom_source_id"),
  syncedAt: timestamp("synced_at").default(sql`now()`),
});

export const pageTexts = pgTable("page_texts", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 255 }).unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const clientProductPricing = pgTable("client_product_pricing", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 50 }).notNull(),
  productName: varchar("product_name", { length: 500 }),
  customPrice: numeric("custom_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const discountCodes = pgTable("discount_codes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 50 }).unique().notNull(),
  type: varchar("type", { length: 20 }).notNull().default("percent"),
  value: numeric("value", { precision: 10, scale: 2 }),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export type Client = typeof clients.$inferSelect;
export type ClientPhone = typeof clientPhones.$inferSelect;
export type ClientAddress = typeof clientAddresses.$inferSelect;
export type BlOrderCache = typeof blOrderCache.$inferSelect;
export type DiscountCode = typeof discountCodes.$inferSelect;
export type ClientProductPricing = typeof clientProductPricing.$inferSelect;
export type PageText = typeof pageTexts.$inferSelect;
