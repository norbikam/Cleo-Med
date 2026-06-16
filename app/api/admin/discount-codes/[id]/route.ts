import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { discountCodes } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const body = await req.json();
  const [updated] = await db
    .update(discountCodes)
    .set({ active: body.active })
    .where(eq(discountCodes.id, params.id))
    .returning();

  return NextResponse.json({ code: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  await db.delete(discountCodes).where(eq(discountCodes.id, params.id));
  return NextResponse.json({ ok: true });
}
