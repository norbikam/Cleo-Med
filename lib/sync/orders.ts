import { db } from "@/lib/db";
import { clients, clientPhones, blOrderCache, clientAddresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getOrders, getStatusList } from "@/lib/baselinker/orders";
import { normalizePhone } from "@/lib/utils/phone";

export async function syncOrdersForClient(clientId: string): Promise<number> {
  const client = await db.query.clients.findFirst({ where: eq(clients.id, clientId) });
  if (!client) throw new Error("Client not found");

  const phones = await db
    .select({ phone: clientPhones.phone })
    .from(clientPhones)
    .where(eq(clientPhones.clientId, clientId));

  const normalizedPhones = new Set([
    normalizePhone(client.phone),
    ...phones.map((p) => normalizePhone(p.phone)),
  ]);

  const statuses = await getStatusList();
  const statusMap = new Map(statuses.map((s) => [s.id, s.name]));

  const dateFrom = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;
  let idFrom = 0;
  let synced = 0;

  // collect unique delivery addresses from matched orders
  const addressMap = new Map<string, {
    fullname: string; street: string; city: string; postcode: string; phone: string; email: string | null;
  }>();

  while (true) {
    const orders = await getOrders({ dateFrom, idFrom: idFrom || undefined });
    if (orders.length === 0) break;

    for (const o of orders) {
      const deliveryPhone = normalizePhone(o.phone || o.delivery_phone || "");
      if (!normalizedPhones.has(deliveryPhone)) continue;

      const total = o.products.reduce(
        (sum, p) => sum + p.price_brutto * p.quantity,
        0
      );

      const products = o.products.map((p) => ({
        name: p.name,
        sku: p.sku,
        qty: p.quantity,
        price: p.price_brutto,
      }));

      await db
        .insert(blOrderCache)
        .values({
          clientId,
          blOrderId: String(o.order_id),
          statusId: o.order_status_id,
          statusName: statusMap.get(o.order_status_id) ?? null,
          products,
          total: String(total.toFixed(2)),
          deliveryFullname: o.delivery_fullname || o.user_login || null,
          deliveryAddress: o.delivery_address,
          deliveryCity: o.delivery_city,
          deliveryPrice: o.delivery_price != null ? String(o.delivery_price.toFixed(2)) : null,
          deliveryMethod: o.delivery_method ?? null,
          trackingNumber: o.delivery_package_nr ?? null,
          orderDate: new Date(o.date_add * 1000),
          customSourceId: o.custom_source_id ?? null,
          syncedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: blOrderCache.blOrderId,
          set: {
            statusId: o.order_status_id,
            statusName: statusMap.get(o.order_status_id) ?? null,
            products,
            total: String(total.toFixed(2)),
            trackingNumber: o.delivery_package_nr ?? null,
            syncedAt: new Date(),
          },
        });

      synced++;

      // collect delivery address if complete
      const street   = o.delivery_address?.trim();
      const city     = o.delivery_city?.trim();
      const postcode = o.delivery_postcode?.trim();
      const fullname = (o.delivery_fullname || o.user_login || "").trim();
      if (street && city && postcode && fullname) {
        const key = `${street}|${city}|${postcode}`.toLowerCase();
        if (!addressMap.has(key)) {
          addressMap.set(key, {
            fullname,
            street,
            city,
            postcode,
            phone: o.phone || o.delivery_phone || client.phone,
            email: o.email || null,
          });
        }
      }
    }

    const lastId = Number(orders[orders.length - 1].order_id);
    if (orders.length < 100) break;
    idFrom = lastId;
  }

  // upsert addresses — skip ones already saved (same street+city+postcode)
  if (addressMap.size > 0) {
    const existing = await db
      .select({ street: clientAddresses.street, city: clientAddresses.city, postcode: clientAddresses.postcode })
      .from(clientAddresses)
      .where(eq(clientAddresses.clientId, clientId));

    const existingKeys = new Set(
      existing.map(a => `${a.street}|${a.city}|${a.postcode}`.toLowerCase())
    );

    const existingCount = existing.length;
    let inserted = 0;

    for (const [key, addr] of Array.from(addressMap)) {
      if (existingKeys.has(key)) {
        // update email on existing address if it's missing
        if (addr.email) {
          await db.update(clientAddresses)
            .set({ email: addr.email })
            .where(
              eq(clientAddresses.clientId, clientId)
            );
        }
        continue;
      }
      await db.insert(clientAddresses).values({
        clientId,
        label:     addr.fullname,
        fullname:  addr.fullname,
        phone:     addr.phone,
        email:     addr.email,
        street:    addr.street,
        city:      addr.city,
        postcode:  addr.postcode,
        isDefault: existingCount + inserted === 0,
      });
      inserted++;
    }
  }

  return synced;
}
