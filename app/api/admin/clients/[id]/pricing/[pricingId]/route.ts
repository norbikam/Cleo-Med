import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientProductPricing } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; pricingId: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  await db
    .delete(clientProductPricing)
    .where(eq(clientProductPricing.id, params.pricingId));

  return NextResponse.json({ ok: true });
}
