import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blOrderCache } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { setOrderStatus } from "@/lib/baselinker/orders";

// Prepaid statuses → pack statuses (same as COD equivalents)
const PREPAID_TO_PACK: Record<number, number> = {
  140150: 136060, // prepaid Paczkomat → pack Paczkomat
  136316: 139666, // prepaid InPost    → pack InPost
  136317: 136061, // prepaid DPD       → pack DPD
  140149: 139993, // prepaid DPDPunkt  → pack DPDPunkt
  140151: 139667, // prepaid InPostWeekend → pack InPostWeekend
};

// Fallback: if statusId isn't in the map, derive pack status from deliveryMethod
const METHOD_TO_PACK: Record<string, number> = {
  "DPD Kurier":                 136061,
  "InPost Kurier":              139666,
  "Paczkomat InPost":           136060,
  "DPD Punkt":                  139993,
  "InPost Weekend (Paczkomat)": 139667,
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });

  const { blOrderId } = await req.json();
  if (!blOrderId)
    return NextResponse.json({ error: "Brak ID zamówienia." }, { status: 400 });

  const [order] = await db
    .select({
      id:             blOrderCache.id,
      statusId:       blOrderCache.statusId,
      statusName:     blOrderCache.statusName,
      deliveryMethod: blOrderCache.deliveryMethod,
      paymentConfirmationUrl: blOrderCache.paymentConfirmationUrl,
    })
    .from(blOrderCache)
    .where(eq(blOrderCache.blOrderId, String(blOrderId)))
    .limit(1);

  if (!order)
    return NextResponse.json({ error: "Nie znaleziono zamówienia." }, { status: 404 });

  if (!order.paymentConfirmationUrl)
    return NextResponse.json({ error: "Klient nie przesłał jeszcze potwierdzenia." }, { status: 400 });

  // Determine pack status
  const packStatusId =
    (order.statusId ? PREPAID_TO_PACK[order.statusId] : undefined) ??
    METHOD_TO_PACK[order.deliveryMethod ?? ""] ??
    136061; // fallback: DPD pack

  // Update BaseLinker
  await setOrderStatus(String(blOrderId), packStatusId);

  // Update local cache: same statusName format as COD orders
  const packStatusName = "Do spakowania — " + (order.deliveryMethod ?? "");

  await db
    .update(blOrderCache)
    .set({ statusId: packStatusId, statusName: packStatusName })
    .where(eq(blOrderCache.id, order.id));

  return NextResponse.json({ ok: true, statusId: packStatusId, statusName: packStatusName });
}
