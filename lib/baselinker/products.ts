import { blRequest } from "./client";
import { db } from "@/lib/db";
import { blProductCache } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export interface BLProduct {
  id: string;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  description?: string;
  images?: string[];
  categoryId?: string;
  categoryName?: string;
}

interface ProductsResult {
  products: BLProduct[];
  categories: Record<string, string>;
}

// in-memory micro-cache to avoid repeated DB reads within the same instance
let memCache: (ProductsResult & { at: number }) | null = null;
const MEM_TTL_MS  = 30_000;   // 30s in-memory
const DB_TTL_MIN  = 15;        // 15 min DB cache

// prevent concurrent BL fetches
let fetchingPromise: Promise<ProductsResult> | null = null;

async function fetchCategories(inventoryId: number): Promise<Record<string, string>> {
  try {
    const data = await blRequest<{
      categories: Record<string, { category_id: number; name: string }>;
    }>("getInventoryCategories", { inventory_id: inventoryId });
    const map: Record<string, string> = {};
    for (const [, cat] of Object.entries(data.categories ?? {})) {
      map[String(cat.category_id)] = cat.name;
    }
    return map;
  } catch {
    return {};
  }
}

async function fetchFromBL(): Promise<ProductsResult> {
  const inventoryId = Number(process.env.BL_INVENTORY_ID ?? 26259);
  const priceGroup  = Number(process.env.BL_PRICE_GROUP  ?? 23497);

  const [listData, categoryMap] = await Promise.all([
    blRequest<{ products: Record<string, string> }>(
      "getInventoryProductsList",
      { inventory_id: inventoryId }
    ),
    fetchCategories(inventoryId),
  ]);

  const productIds = Object.keys(listData.products ?? {});
  if (productIds.length === 0) return { products: [], categories: categoryMap };

  const detailData = await blRequest<{
    products: Record<string, {
      sku?: string;
      category_id?: number;
      text_fields?: { name?: string; description?: string };
      images?: Record<string, string>;
      prices?: Record<string, number>;
      stock?: Record<string, number>;
    }>;
  }>("getInventoryProductsData", { inventory_id: inventoryId, products: productIds });

  const products: BLProduct[] = Object.entries(detailData.products ?? {})
    .map(([id, p]) => {
      const name = p.text_fields?.name ?? listData.products[id] ?? "";
      const stock = Object.values(p.stock ?? {}).reduce((a, b) => a + b, 0);
      const categoryId = p.category_id ? String(p.category_id) : undefined;
      return {
        id, name,
        sku: id,
        price: p.prices?.[String(priceGroup)] ?? 0,
        stock,
        description: p.text_fields?.description,
        images: Object.values(p.images ?? {}).filter(Boolean),
        categoryId,
        categoryName: categoryId ? categoryMap[categoryId] : undefined,
      };
    })
    .filter(p => p.name && p.stock > 0);

  // save to DB (upsert each product)
  if (products.length > 0) {
    const rows = products.map(p => ({ blProductId: p.id, data: p as unknown as Record<string, unknown> }));
    await db.insert(blProductCache)
      .values(rows)
      .onConflictDoUpdate({
        target: blProductCache.blProductId,
        set: { data: sql`excluded.data`, cachedAt: sql`now()` },
      });
  }

  console.log(`[products] BL fetch: ${products.length} produktów`);
  return { products, categories: categoryMap };
}

export async function getProducts(): Promise<ProductsResult> {
  // 1. in-memory micro-cache
  if (memCache && Date.now() - memCache.at < MEM_TTL_MS) {
    return { products: memCache.products, categories: memCache.categories };
  }

  // 2. DB cache
  const rows = await db.select().from(blProductCache);
  if (rows.length > 0) {
    const freshest = rows.reduce((a, b) => (a.cachedAt > b.cachedAt ? a : b));
    const ageMin = (Date.now() - freshest.cachedAt.getTime()) / 60_000;

    if (ageMin < DB_TTL_MIN) {
      const products = rows.map(r => r.data as unknown as BLProduct);
      const categories: Record<string, string> = {};
      for (const p of products) {
        if (p.categoryId && p.categoryName) categories[p.categoryId] = p.categoryName;
      }
      memCache = { products, categories, at: Date.now() };

      // refresh in background if > 10 min old
      if (ageMin > 10 && !fetchingPromise) {
        fetchingPromise = fetchFromBL()
          .then(r => { memCache = { ...r, at: Date.now() }; return r; })
          .finally(() => { fetchingPromise = null; });
      }

      return { products, categories };
    }
  }

  // 3. fetch from BL (deduplicated)
  if (!fetchingPromise) {
    fetchingPromise = fetchFromBL()
      .then(r => { memCache = { ...r, at: Date.now() }; return r; })
      .finally(() => { fetchingPromise = null; });
  }

  const result = await fetchingPromise;
  return result;
}
