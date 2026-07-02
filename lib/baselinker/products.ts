import { blRequest } from "./client";
import { db } from "@/lib/db";
import { blProductCache } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export interface BLVariant {
  id: string;
  name: string;
  stock: number;
  price: number;
}

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
  variants?: BLVariant[];
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
      variants?: Record<string, {
        name?: string;
        stock?: Record<string, number>;
        prices?: Record<string, number>;
      }>;
    }>;
  }>("getInventoryProductsData", { inventory_id: inventoryId, products: productIds });

  const products: BLProduct[] = Object.entries(detailData.products ?? {})
    .map(([id, p]) => {
      const name = p.text_fields?.name ?? listData.products[id] ?? "";
      const priceGroupKey = String(priceGroup);
      const basePrice = p.prices?.[priceGroupKey] ?? 0;
      const categoryId = p.category_id ? String(p.category_id) : undefined;

      const variants: BLVariant[] = Object.entries(p.variants ?? {})
        .map(([varId, v]) => ({
          id: varId,
          name: v.name ?? varId,
          stock: Object.values(v.stock ?? {}).reduce((a, b) => a + b, 0),
          price: v.prices?.[priceGroupKey] ?? basePrice,
        }))
        .filter(v => v.name);

      const stock = variants.length > 0
        ? variants.reduce((sum, v) => sum + v.stock, 0)
        : Object.values(p.stock ?? {}).reduce((a, b) => a + b, 0);

      return {
        id, name,
        sku: id,
        price: basePrice,
        stock,
        description: p.text_fields?.description,
        images: Object.values(p.images ?? {}).filter(Boolean),
        categoryId,
        categoryName: categoryId ? categoryMap[categoryId] : undefined,
        ...(variants.length > 0 ? { variants } : {}),
      };
    })
    .filter(p => p.name);

  // upsert all products (including stock=0) and remove stale entries no longer in BL
  if (products.length > 0) {
    const rows = products.map(p => ({ blProductId: p.id, data: p as unknown as Record<string, unknown> }));
    await db.insert(blProductCache)
      .values(rows)
      .onConflictDoUpdate({
        target: blProductCache.blProductId,
        set: { data: sql`excluded.data`, cachedAt: sql`now()` },
      });

    // remove products that no longer exist in BL
    const ids = products.map(p => p.id);
    await db.delete(blProductCache)
      .where(sql`bl_product_id NOT IN (${sql.join(ids.map(id => sql`${id}`), sql`, `)})`);
  }

  console.log(`[products] BL fetch: ${products.length} produktów`);
  return { products, categories: categoryMap };
}

export function clearProductCache() {
  memCache = null;
}

export async function deductLocalStock(items: { id: string; qty: number; variantId?: string }[]) {
  for (const item of items) {
    const [row] = await db.select().from(blProductCache).where(eq(blProductCache.blProductId, item.id)).limit(1);
    if (!row) continue;
    const data = row.data as unknown as BLProduct;
    let updated: BLProduct;
    if (item.variantId && data.variants?.length) {
      const variants = data.variants.map(v =>
        v.id === item.variantId ? { ...v, stock: Math.max(0, v.stock - item.qty) } : v
      );
      const stock = variants.reduce((sum, v) => sum + v.stock, 0);
      updated = { ...data, variants, stock };
    } else {
      updated = { ...data, stock: Math.max(0, data.stock - item.qty) };
    }
    await db.update(blProductCache)
      .set({ data: updated as unknown as Record<string, unknown> })
      .where(eq(blProductCache.blProductId, item.id));
  }
  memCache = null;
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
