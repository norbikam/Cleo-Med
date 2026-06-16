import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, clientPhones } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { getOrders } from "@/lib/baselinker/orders";
import { normalizePhone } from "@/lib/utils/phone";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });

  const client = await db.query.clients.findFirst({ where: eq(clients.id, session.clientId) });
  if (!client) return NextResponse.json({ error: "Brak klienta." }, { status: 404 });

  const extraPhones = await db
    .select({ phone: clientPhones.phone })
    .from(clientPhones)
    .where(eq(clientPhones.clientId, session.clientId));

  const rawPhones = [client.phone, ...extraPhones.map(p => p.phone)];
  const phonesNorm = rawPhones.map(p => ({ raw: p, normalized: normalizePhone(p) }));
  const phoneSet = new Set(phonesNorm.map(p => p.normalized));

  const dateFrom = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;
  let allOrders: Awaited<ReturnType<typeof getOrders>> = [];
  let idFrom = 0;

  while (true) {
    const batch = await getOrders({ dateFrom, idFrom: idFrom || undefined });
    allOrders = allOrders.concat(batch);
    if (batch.length < 100) break;
    idFrom = Number(batch[batch.length - 1].order_id);
  }

  const matched = allOrders.filter(o => phoneSet.has(normalizePhone(o.delivery_phone ?? "")));
  const last1 = allOrders.slice(-1).map(o => o);

  return NextResponse.json({
    myPhones: phonesNorm,
    myPhoneSet: Array.from(phoneSet),
    totalOrdersFromBL: allOrders.length,
    matchedCount: matched.length,
    matchedOrders: matched.map(o => ({
      order_id: o.order_id,
      delivery_phone: o.delivery_phone,
      delivery_fullname: o.delivery_fullname,
    })),
    lastOrderFull: last1[0] ?? null,
  });
}
