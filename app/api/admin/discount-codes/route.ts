import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { discountCodes, clients } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  try {
    const codes = await db
      .select({
        id: discountCodes.id,
        code: discountCodes.code,
        type: discountCodes.type,
        value: discountCodes.value,
        maxUses: discountCodes.maxUses,
        usedCount: discountCodes.usedCount,
        active: discountCodes.active,
        expiresAt: discountCodes.expiresAt,
        createdAt: discountCodes.createdAt,
        clientId: discountCodes.clientId,
        clientName: clients.name,
        clientPhone: clients.phone,
      })
      .from(discountCodes)
      .leftJoin(clients, eq(discountCodes.clientId, clients.id))
      .orderBy(desc(discountCodes.createdAt));

    return NextResponse.json({ codes });
  } catch {
    return NextResponse.json({ codes: [], error: "Tabela nie istnieje — uruchom: npx drizzle-kit push" });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const body = await req.json();
  const { code, type, value, clientId, maxUses, expiresAt } = body;

  if (!code || !type) {
    return NextResponse.json({ error: "Podaj kod i typ." }, { status: 400 });
  }

  const [created] = await db
    .insert(discountCodes)
    .values({
      code: (code as string).toUpperCase().trim(),
      type,
      value: value != null ? String(value) : null,
      clientId: clientId || null,
      maxUses: maxUses || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    })
    .returning();

  return NextResponse.json({ code: created });
}
