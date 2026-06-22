import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/baselinker/products";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { products } = await getProducts();
    const product = products.find(p => String(p.id) === String(params.id));
    if (!product) return NextResponse.json({ error: "Produkt nie znaleziony." }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
