import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { discountCodes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Podaj kod." }, { status: 400 });

  const [discount] = await db
    .select()
    .from(discountCodes)
    .where(eq(discountCodes.code, (code as string).toUpperCase().trim()))
    .limit(1);

  if (!discount) return NextResponse.json({ error: "Nieprawidłowy kod promocyjny." }, { status: 404 });
  if (!discount.active) return NextResponse.json({ error: "Kod jest nieaktywny." }, { status: 400 });
  if (discount.expiresAt && new Date() > new Date(discount.expiresAt))
    return NextResponse.json({ error: "Kod wygasł." }, { status: 400 });
  if (discount.maxUses !== null && discount.usedCount >= discount.maxUses)
    return NextResponse.json({ error: "Kod został już w pełni wykorzystany." }, { status: 400 });
  if (discount.clientId && discount.clientId !== session.clientId)
    return NextResponse.json({ error: "Nieprawidłowy kod promocyjny." }, { status: 404 });

  return NextResponse.json({
    ok: true,
    discount: {
      id:    discount.id,
      code:  discount.code,
      type:  discount.type,
      value: discount.value ? Number(discount.value) : null,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Brak id." }, { status: 400 });

  await db
    .update(discountCodes)
    .set({ usedCount: sql`${discountCodes.usedCount} + 1` })
    .where(eq(discountCodes.id, id));

  return NextResponse.json({ ok: true });
}
