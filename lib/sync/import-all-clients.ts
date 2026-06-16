import { db } from "@/lib/db";
import { clients, clientPhones, blOrderCache, clientAddresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getOrders, getStatusList, BLOrder } from "@/lib/baselinker/orders";
import { normalizePhone } from "@/lib/utils/phone";

export interface ImportResult {
  totalOrders: number;
  newClients: number;
  existingClients: number;
  newOrders: number;
  newAddresses: number;
  skipped: number;
  updatedContacts: number;
}

export async function importAllClients(
  onProgress?: (msg: string) => void
): Promise<ImportResult> {
  const emit = (msg: string) => onProgress?.(msg);
  const result: ImportResult = { totalOrders: 0, newClients: 0, existingClients: 0, newOrders: 0, newAddresses: 0, skipped: 0, updatedContacts: 0 };

  emit("Pobieranie listy statusów...");
  const statuses = await getStatusList();
  const statusMap = new Map(statuses.map(s => [s.id, s.name]));

  emit("Ładowanie istniejących klientów...");
  const phoneToClient = new Map<string, string>();

  const allClients = await db.select({ id: clients.id, phone: clients.phone }).from(clients);
  for (const c of allClients) phoneToClient.set(normalizePhone(c.phone), c.id);

  const allExtraPhones = await db.select({ clientId: clientPhones.clientId, phone: clientPhones.phone }).from(clientPhones);
  for (const p of allExtraPhones) phoneToClient.set(normalizePhone(p.phone), p.clientId);

  emit(`Znaleziono ${phoneToClient.size} istniejących numerów. Pobieram zamówienia z BL...`);

  const dateFrom = 1262304000; // 2010-01-01 UTC
  let idFrom = 0;
  const allOrders: BLOrder[] = [];
  let page = 0;

  while (true) {
    const batch = await getOrders({ dateFrom, idFrom: idFrom || undefined });
    if (batch.length === 0) break;
    allOrders.push(...batch);
    page++;
    emit(`Pobrano ${allOrders.length} zamówień (strona ${page})...`);
    if (batch.length < 100) break;
    idFrom = Number(batch[batch.length - 1].order_id);
  }

  result.totalOrders = allOrders.length;
  emit(`Łącznie ${allOrders.length} zamówień. Ładuję cache...`);

  const existingOrderIds = new Set<string>();
  const existingOrderRows = await db.select({ blOrderId: blOrderCache.blOrderId }).from(blOrderCache);
  for (const r of existingOrderRows) existingOrderIds.add(r.blOrderId);

  emit(`Cache: ${existingOrderIds.size} zamówień już w bazie. Zaczynam import...`);

  const clientEmailUpdates = new Map<string, string>(); // clientId → latest email from BL
  const clientNameUpdates  = new Map<string, string>(); // clientId → latest name from BL

  const clientAddressKeys = new Map<string, Set<string>>();

  async function getAddressKeys(clientId: string): Promise<Set<string>> {
    if (clientAddressKeys.has(clientId)) return clientAddressKeys.get(clientId)!;
    const rows = await db.select({ street: clientAddresses.street, city: clientAddresses.city, postcode: clientAddresses.postcode })
      .from(clientAddresses).where(eq(clientAddresses.clientId, clientId));
    const keys = new Set(rows.map(r => `${r.street}|${r.city}|${r.postcode}`.toLowerCase()));
    clientAddressKeys.set(clientId, keys);
    return keys;
  }

  let processed = 0;
  for (const order of allOrders) {
    processed++;

    const rawPhone = (order.phone || order.delivery_phone || "").trim();
    if (!rawPhone) { result.skipped++; continue; }

    const normalized = normalizePhone(rawPhone);
    if (!normalized || normalized.length < 9) { result.skipped++; continue; }

    let clientId = phoneToClient.get(normalized);
    if (!clientId) {
      const fullname = (order.delivery_fullname || order.user_login || "").trim() || null;
      const [created] = await db.insert(clients).values({
        phone: normalized,
        name: fullname,
        email: order.email?.trim() || null,
        active: false,
      }).returning({ id: clients.id });
      clientId = created.id;
      phoneToClient.set(normalized, clientId);
      result.newClients++;
      emit(`[${processed}/${allOrders.length}] Nowy klient: ${normalized} (${fullname ?? "—"}) | łącznie nowych: ${result.newClients}`);
    } else {
      result.existingClients++;
      if (order.email?.trim()) clientEmailUpdates.set(clientId, order.email.trim());
      const fullnameForUpdate = (order.delivery_fullname || order.user_login || "").trim();
      if (fullnameForUpdate) clientNameUpdates.set(clientId, fullnameForUpdate);
    }

    const orderId = String(order.order_id);
    const total = order.products.reduce((s, p) => s + p.price_brutto * p.quantity, 0);
    const prods = order.products.map(p => ({ name: p.name, sku: p.sku, qty: p.quantity, price: p.price_brutto }));
    const isNew = !existingOrderIds.has(orderId);
    await db.insert(blOrderCache).values({
      clientId,
      blOrderId: orderId,
      statusId: order.order_status_id,
      statusName: statusMap.get(order.order_status_id) ?? null,
      products: prods,
      total: String(total.toFixed(2)),
      deliveryFullname: order.delivery_fullname || order.user_login || null,
      deliveryAddress: order.delivery_address,
      deliveryCity: order.delivery_city,
      deliveryPrice: order.delivery_price != null ? String(order.delivery_price.toFixed(2)) : null,
      deliveryMethod: order.delivery_method ?? null,
      trackingNumber: order.delivery_package_nr ?? null,
      orderDate: new Date(order.date_add * 1000),
      customSourceId: order.custom_source_id ?? null,
      syncedAt: new Date(),
    }).onConflictDoUpdate({
      target: blOrderCache.blOrderId,
      set: {
        statusId:      order.order_status_id,
        statusName:    statusMap.get(order.order_status_id) ?? null,
        trackingNumber: order.delivery_package_nr ?? null,
        deliveryMethod: order.delivery_method ?? null,
        syncedAt:      new Date(),
      },
    });
    if (isNew) {
      existingOrderIds.add(orderId);
      result.newOrders++;
    }

    const street   = order.delivery_address?.trim();
    const city     = order.delivery_city?.trim();
    const postcode = order.delivery_postcode?.trim();
    const fullname = (order.delivery_fullname || order.user_login || "").trim();
    if (street && city && postcode && fullname) {
      const key = `${street}|${city}|${postcode}`.toLowerCase();
      const keys = await getAddressKeys(clientId);
      if (!keys.has(key)) {
        await db.insert(clientAddresses).values({
          clientId,
          label: fullname,
          fullname,
          phone: normalized,
          email: order.email?.trim() || null,
          street,
          city,
          postcode,
          isDefault: keys.size === 0,
        });
        keys.add(key);
        result.newAddresses++;
      }
    }

    // Emit summary every 25 orders
    if (processed % 25 === 0) {
      emit(`[${processed}/${allOrders.length}] nowych klientów: ${result.newClients} | zamówień dodanych: ${result.newOrders} | adresów: ${result.newAddresses}`);
    }
  }

  // Sync email + name from BL for existing clients
  if (clientEmailUpdates.size > 0 || clientNameUpdates.size > 0) {
    emit(`Aktualizuję dane kontaktowe dla ${clientEmailUpdates.size} klientów...`);
    const allClientIds = Array.from(new Set([...Array.from(clientEmailUpdates.keys()), ...Array.from(clientNameUpdates.keys())]));
    for (const cid of allClientIds) {
      const patch: Record<string, unknown> = {};
      if (clientEmailUpdates.has(cid)) patch.email = clientEmailUpdates.get(cid);
      if (clientNameUpdates.has(cid))  patch.name  = clientNameUpdates.get(cid);
      await db.update(clients).set(patch).where(eq(clients.id, cid));
    }
    result.updatedContacts = allClientIds.length;
  }

  emit(`DONE:${JSON.stringify(result)}`);
  return result;
}
