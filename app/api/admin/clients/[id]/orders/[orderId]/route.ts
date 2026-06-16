import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blOrderCache } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; orderId: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  await db
    .delete(blOrderCache)
    .where(and(eq(blOrderCache.id, params.orderId), eq(blOrderCache.clientId, params.id)));

  return NextResponse.json({ ok: true });
}
