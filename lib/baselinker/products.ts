import { blRequest } from "./client";

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

interface ProductsCache {
  data: BLProduct[];
  categories: Record<string, string>;
  cachedAt: number;
}

const cache: ProductsCache = { data: [], categories: {}, cachedAt: 0 };
const TTL_MS = 10 * 60 * 1000;

async function fetchCategories(inventoryId: number): Promise<Record<string, string>> {
  try {
    const data = await blRequest<{
      categories: Record<string, { category_id: number; name: string; parent_id: number }>;
    }>("getInventoryCategories", { inventory_id: inventoryId });
    const map: Record<string, string> = {};
    for (const [, cat] of Object.entries(data.categories ?? {})) {
      map[String(cat.category_id)] = cat.name;
    }
    console.log(`[categories] załadowano ${Object.keys(map).length} kategorii:`, map);
    return map;
  } catch (err) {
    console.error("[categories] błąd:", err instanceof Error ? err.message : err);
    return {};
  }
}

export async function getProducts(): Promise<{ products: BLProduct[]; categories: Record<string, string> }> {
  if (Date.now() - cache.cachedAt < TTL_MS && cache.data.length > 0) {
    return { products: cache.data, categories: cache.categories };
  }

  const inventoryId = Number(process.env.BL_INVENTORY_ID ?? 26259);
  const priceGroup = Number(process.env.BL_PRICE_GROUP ?? 23497);

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
  }>("getInventoryProductsData", {
    inventory_id: inventoryId,
    products: productIds,
  });

  const products: BLProduct[] = Object.entries(detailData.products ?? {})
    .map(([id, p]) => {
      const name = p.text_fields?.name ?? listData.products[id] ?? "";
      const stock = Object.values(p.stock ?? {}).reduce((a, b) => a + b, 0);
      const categoryId = p.category_id ? String(p.category_id) : undefined;
      return {
        id,
        name,
        sku: p.sku || undefined,
        price: p.prices?.[String(priceGroup)] ?? 0,
        stock,
        description: p.text_fields?.description,
        images: Object.values(p.images ?? {}).filter(Boolean),
        categoryId,
        categoryName: categoryId ? categoryMap[categoryId] : undefined,
      };
    })
    .filter((p) => p.name && p.stock > 0);

  console.log(`[products] załadowano ${products.length} produktów (${Object.keys(categoryMap).length} kategorii)`);

  cache.data = products;
  cache.categories = categoryMap;
  cache.cachedAt = Date.now();

  return { products, categories: categoryMap };
}
