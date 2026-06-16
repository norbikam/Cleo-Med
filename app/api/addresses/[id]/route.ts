import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientAddresses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });

  const body = await req.json();
  const { label, fullname, company, email, phone, courierType,
          lockerCode, lockerName, street, city, postcode, isDefault } = body;

  const effectiveLabel = label || fullname;

  if (isDefault) {
    await db.update(clientAddresses).set({ isDefault: false })
      .where(eq(clientAddresses.clientId, session.clientId));
  }

  const [addr] = await db.update(clientAddresses)
    .set({ label: effectiveLabel, fullname, company, email, phone,
           courierType, lockerCode, lockerName,
           street, city, postcode, isDefault: !!isDefault })
    .where(and(eq(clientAddresses.id, params.id), eq(clientAddresses.clientId, session.clientId)))
    .returning();

  if (!addr) return NextResponse.json({ error: "Adres nie znaleziony." }, { status: 404 });
  return NextResponse.json({ address: addr });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });

  await db.delete(clientAddresses)
    .where(and(eq(clientAddresses.id, params.id), eq(clientAddresses.clientId, session.clientId)));

  return NextResponse.json({ ok: true });
}
