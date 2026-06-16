import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, clientPhones } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { getOrders } from "@/lib/baselinker/orders";
import { normalizePhone } from "@/lib/utils/phone";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "Podaj clientId." }, { status: 400 });

  const client = await db.query.clients.findFirst({ where: eq(clients.id, clientId) });
  if (!client) return NextResponse.json({ error: "Klient nie znaleziony." }, { status: 404 });

  const extraPhones = await db
    .select({ phone: clientPhones.phone })
    .from(clientPhones)
    .where(eq(clientPhones.clientId, clientId));

  const rawPhones = [client.phone, ...extraPhones.map(p => p.phone)];
  const normalizedPhones = rawPhones.map(p => ({ raw: p, normalized: normalizePhone(p) }));
  const phoneSet = new Set(normalizedPhones.map(p => p.normalized));

  const dateFrom = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;
  const orders = await getOrders({ dateFrom });

  const matched = orders.filter(o => phoneSet.has(normalizePhone(o.delivery_phone ?? "")));
  const sample  = orders.slice(0, 5).map(o => ({
    order_id:       o.order_id,
    delivery_phone: o.delivery_phone,
    normalized:     normalizePhone(o.delivery_phone ?? ""),
    matches:        phoneSet.has(normalizePhone(o.delivery_phone ?? "")),
  }));

  return NextResponse.json({
    client: { id: client.id, phone: client.phone },
    phones: normalizedPhones,
    phoneSet: Array.from(phoneSet),
    totalFromBL: orders.length,
    matchedCount: matched.length,
    matchedOrders: matched.map(o => ({ order_id: o.order_id, delivery_phone: o.delivery_phone, normalized: normalizePhone(o.delivery_phone ?? "") })),
    sampleOrders: sample,
  });
}
