import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, clientPhones, blOrderCache, discountCodes, clientAddresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const [client] = await db
    .select({
      id: clients.id, phone: clients.phone, name: clients.name, email: clients.email,
      role: clients.role, active: clients.active,
      freeShipping: clients.freeShipping,
      priceDiscountPercent: clients.priceDiscountPercent,
    })
    .from(clients)
    .where(eq(clients.id, params.id))
    .limit(1);

  if (!client) return NextResponse.json({ error: "Klient nie znaleziony." }, { status: 404 });

  const [phones, orders, codes, addresses] = await Promise.all([
    db.select().from(clientPhones).where(eq(clientPhones.clientId, params.id)),
    db.select().from(blOrderCache).where(eq(blOrderCache.clientId, params.id)),
    db.select().from(discountCodes).where(eq(discountCodes.clientId, params.id)),
    db.select().from(clientAddresses).where(eq(clientAddresses.clientId, params.id)),
  ]);

  return NextResponse.json({ client, phones, orders, codes, addresses });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const body = await req.json();
  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (body.active        !== undefined) patch.active              = body.active;
  if (body.freeShipping  !== undefined) patch.freeShipping        = body.freeShipping;
  if (body.name          !== undefined) patch.name                = body.name;
  if (body.email         !== undefined) patch.email               = body.email;
  if (body.priceDiscountPercent !== undefined)
    patch.priceDiscountPercent = String(body.priceDiscountPercent);

  const [updated] = await db
    .update(clients)
    .set(patch)
    .where(eq(clients.id, params.id))
    .returning();

  return NextResponse.json({ client: updated });
}
