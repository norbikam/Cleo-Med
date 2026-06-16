import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getProducts } from "@/lib/baselinker/products";
import { db } from "@/lib/db";
import { clients, clientProductPricing } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });

  try {
    const { products, categories } = await getProducts();

    const [client] = await db
      .select({ priceDiscountPercent: clients.priceDiscountPercent })
      .from(clients)
      .where(eq(clients.id, session.clientId))
      .limit(1);

    const pricingRows = await db
      .select()
      .from(clientProductPricing)
      .where(eq(clientProductPricing.clientId, session.clientId));

    const priceMap = new Map(
      pricingRows.map(p => [p.productId, parseFloat(String(p.customPrice))])
    );

    const globalDiscount = client?.priceDiscountPercent
      ? parseFloat(String(client.priceDiscountPercent))
      : 0;

    const adjusted = products.map(p => {
      const custom = priceMap.get(String(p.id));
      if (custom !== undefined) {
        return { ...p, price: custom, originalPrice: p.price, hasCustomPrice: true };
      }
      if (globalDiscount > 0) {
        return { ...p, price: parseFloat((p.price * (1 - globalDiscount / 100)).toFixed(2)), originalPrice: p.price };
      }
      return p;
    });

    return NextResponse.json({ products: adjusted, categories, discount: globalDiscount });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[products] BL error:", message);
    return NextResponse.json({ error: message, products: [], categories: {} }, { status: 502 });
  }
}
