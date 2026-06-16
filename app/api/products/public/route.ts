import { NextResponse } from "next/server";
import { getProducts } from "@/lib/baselinker/products";

export async function GET() {
  try {
    const { products, categories } = await getProducts();
    return NextResponse.json({ products, categories });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message, products: [], categories: {} }, { status: 502 });
  }
}
