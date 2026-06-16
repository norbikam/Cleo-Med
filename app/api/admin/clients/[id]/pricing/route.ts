import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientProductPricing } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const pricing = await db
    .select()
    .from(clientProductPricing)
    .where(eq(clientProductPricing.clientId, params.id));

  return NextResponse.json({ pricing });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const { productId, productName, customPrice } = await req.json();
  if (!productId || customPrice == null) {
    return NextResponse.json({ error: "Podaj produkt i cenę." }, { status: 400 });
  }

  // Remove existing override for this product+client, then insert fresh
  await db.execute(
    sql`DELETE FROM client_product_pricing WHERE client_id = ${params.id} AND product_id = ${String(productId)}`
  );

  const [created] = await db
    .insert(clientProductPricing)
    .values({
      clientId: params.id,
      productId: String(productId),
      productName: productName ?? null,
      customPrice: String(customPrice),
    })
    .returning();

  return NextResponse.json({ pricing: created });
}
