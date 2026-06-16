import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getProducts } from "@/lib/baselinker/products";
import { db } from "@/lib/db";
import { clients, clientProductPricing } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });

  try {
    const { products } = await getProducts();
    const product = products.find((p) => String(p.id) === String(params.id));
    if (!product) return NextResponse.json({ error: "Produkt nie znaleziony." }, { status: 404 });

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

    const custom = priceMap.get(String(product.id));
    let price = product.price;
    if (custom !== undefined) {
      price = custom;
    } else if (globalDiscount > 0) {
      price = parseFloat((product.price * (1 - globalDiscount / 100)).toFixed(2));
    }
    const adjusted = { ...product, price };

    return NextResponse.json({ product: adjusted });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
