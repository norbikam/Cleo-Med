import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blProductCache } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { clearProductCache, getProducts } from "@/lib/baselinker/products";

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  // clear DB cache so getProducts() is forced to fetch from BL
  await db.delete(blProductCache);
  clearProductCache();

  const { products } = await getProducts();
  return NextResponse.json({ ok: true, count: products.length });
}
