import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientAddresses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function PUT(req: NextRequest, { params }: { params: { id: string; addressId: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });

  const body = await req.json();
  const { fullname, street, city, postcode, phone, email, courierType, lockerCode, lockerName, isDefault } = body;

  if (isDefault) {
    await db.update(clientAddresses).set({ isDefault: false })
      .where(eq(clientAddresses.clientId, params.id));
  }

  const [addr] = await db.update(clientAddresses)
    .set({
      label: fullname,
      fullname,
      phone: phone || null,
      email: email || null,
      courierType: courierType || null,
      lockerCode: lockerCode || null,
      lockerName: lockerName || null,
      street,
      city,
      postcode,
      isDefault: !!isDefault,
    })
    .where(and(eq(clientAddresses.id, params.addressId), eq(clientAddresses.clientId, params.id)))
    .returning();

  if (!addr) return NextResponse.json({ error: "Adres nie znaleziony." }, { status: 404 });
  return NextResponse.json({ address: addr });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; addressId: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });

  await db.delete(clientAddresses)
    .where(and(eq(clientAddresses.id, params.addressId), eq(clientAddresses.clientId, params.id)));

  return NextResponse.json({ ok: true });
}
