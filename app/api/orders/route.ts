import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, blOrderCache, clientAddresses } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { addOrder } from "@/lib/baselinker/orders";
import { deductLocalStock } from "@/lib/baselinker/products";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });

  const orders = await db
    .select()
    .from(blOrderCache)
    .where(eq(blOrderCache.clientId, session.clientId))
    .orderBy(desc(blOrderCache.orderDate));

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  try {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });

  const body = await req.json();
  const { addressId, newAddress, items, paymentMethod, userComments, weekendDelivery, weekendLocker, discountCode, discountAmount, freeShipping } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Koszyk jest pusty." }, { status: 400 });
  }

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, session.clientId))
    .limit(1);

  const COURIER_LABELS: Record<string, string> = {
    DPD:          "DPD Kurier",
    InPost:       "InPost Kurier",
    Paczkomat:    "Paczkomat InPost",
    DPDPunkt:     "DPD Punkt",
    InPostWeekend:"InPost Weekend (Paczkomat)",
  };

  let delivery: {
    fullname: string; company: string | null;
    address: string; city: string; postcode: string;
    phone: string; email: string | null; courierType: string | null;
  };

  if (addressId) {
    const [addr] = await db
      .select()
      .from(clientAddresses)
      .where(eq(clientAddresses.id, addressId))
      .limit(1);
    if (!addr || addr.clientId !== session.clientId) {
      return NextResponse.json({ error: "Nieprawidłowy adres." }, { status: 400 });
    }
    delivery = {
      fullname:    addr.fullname,
      company:     addr.company,
      address:     addr.street,
      city:        addr.city,
      postcode:    addr.postcode,
      phone:       addr.phone ?? client.phone,
      email:       addr.email ?? client.email,
      courierType: addr.courierType,
    };
  } else if (newAddress) {
    delivery = {
      fullname:    newAddress.fullname,
      company:     newAddress.company ?? null,
      address:     newAddress.street,
      city:        newAddress.city,
      postcode:    newAddress.postcode,
      phone:       newAddress.phone ?? client.phone,
      email:       newAddress.email ?? client.email,
      courierType: newAddress.courierType ?? null,
    };
  } else {
    return NextResponse.json({ error: "Podaj adres dostawy." }, { status: 400 });
  }

  // Override delivery address with weekend locker if provided
  if (weekendDelivery && weekendLocker) {
    delivery.address  = weekendLocker.street;
    delivery.postcode = weekendLocker.postcode;
    delivery.city     = weekendLocker.city;
  }

  type OrderItem = { id: string; name: string; sku: string; price: number; qty: number; variantId?: string };
  const blProducts = items.map((item: OrderItem) => ({
    storage: "db",
    storage_id: 0,
    product_id: item.id,
    variant_id: item.variantId ? Number(item.variantId) : 0,
    name: item.name,
    sku: item.sku,
    price_brutto: item.price,
    quantity: item.qty,
  }));

  const isCod = paymentMethod === "cod";
  const methodLabel = isCod ? "Za pobraniem" : paymentMethod === "blik" ? "BLIK" : "Przelew bankowy";

  const STATUS_MAP: Record<string, Record<string, number>> = {
    cod: {
      Paczkomat:     136060,
      InPost:        139666,
      DPD:           136061,
      DPDPunkt:      139993,
      InPostWeekend: 139667,
    },
    prepaid: {
      Paczkomat:     140150,
      InPost:        136316,
      DPD:           136317,
      DPDPunkt:      140149,
      InPostWeekend: 140151,
    },
  };

  const paymentKey     = isCod ? "cod" : "prepaid";
  const baseCourierKey = delivery.courierType ?? "DPD";
  const courierKey     = weekendDelivery ? "InPostWeekend" : baseCourierKey;
  const statusId       = STATUS_MAP[paymentKey][courierKey] ?? STATUS_MAP[paymentKey]["DPD"];
  const deliveryMethod = COURIER_LABELS[courierKey] ?? "DPD Kurier";
  const deliveryPrice  = (client.freeShipping || freeShipping) ? 0 : courierKey === "InPostWeekend" ? 25 : 20;

  const allProducts = [...blProducts];
  if (discountAmount && discountAmount > 0) {
    allProducts.push({
      storage:    "db",
      storage_id: 0,
      product_id: "discount",
      variant_id: 0,
      name:       `Kod rabatowy: ${discountCode ?? ""}`,
      sku:        "",
      price_brutto: -parseFloat(String(discountAmount)),
      quantity:   1,
    });
  }

  const orderId = await addOrder({
    order_status_id:    statusId,
    custom_source_id:   18291,
    delivery_fullname:  delivery.fullname,
    delivery_address:   delivery.address,
    delivery_city:      delivery.city,
    delivery_postcode:  delivery.postcode,
    delivery_method:    deliveryMethod,
    delivery_price:     deliveryPrice,
    user_login:         delivery.fullname,
    phone:              delivery.phone,
    email:              delivery.email ?? undefined,
    invoice_fullname:   delivery.fullname,
    ...(delivery.company ? { invoice_company: delivery.company } : {}),
    invoice_address:    delivery.address,
    invoice_postcode:   delivery.postcode,
    invoice_city:       delivery.city,
    payment_method:     methodLabel,
    payment_method_cod: isCod ? 1 : 0,
    ...(userComments ? { user_comments: userComments, extra_field_1: userComments } : {}),
    ...(weekendDelivery && weekendLocker ? {
      delivery_point_id:       weekendLocker.code,
      delivery_point_name:     weekendLocker.label,
      delivery_point_address:  weekendLocker.street,
      delivery_point_postcode: weekendLocker.postcode,
      delivery_point_city:     weekendLocker.city,
    } : {}),
    products:           allProducts,
  });

  const orderTotal = items.reduce(
    (sum: number, i: { price: number; qty: number }) => sum + i.price * i.qty, 0
  ) - (discountAmount ? parseFloat(String(discountAmount)) : 0);

  await db.insert(blOrderCache).values({
    clientId:        session.clientId,
    blOrderId:       String(orderId),
    statusId:        statusId,
    statusName:      methodLabel + " — " + (COURIER_LABELS[courierKey] ?? courierKey),
    products:        blProducts.map((p: { name: string; sku: string; quantity: number; price_brutto: number }) => ({ name: p.name, sku: p.sku, qty: p.quantity, price: p.price_brutto })),
    total:           String(orderTotal.toFixed(2)),
    deliveryFullname: delivery.fullname,
    deliveryAddress:  delivery.address,
    deliveryCity:     delivery.city,
    deliveryPrice:   String(deliveryPrice.toFixed(2)),
    deliveryMethod:  deliveryMethod,
    userComments:    userComments ?? null,
    customSourceId:  18291,
    orderDate:       new Date(),
    syncedAt:        new Date(),
  }).onConflictDoUpdate({
    target: blOrderCache.blOrderId,
    set: { syncedAt: new Date() },
  });

  await deductLocalStock(items.map((i: OrderItem) => ({ id: i.id, qty: i.qty, variantId: i.variantId })));

  return NextResponse.json({ ok: true, orderId });
  } catch (err) {
    console.error("[orders POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
