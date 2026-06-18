import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blOrderCache } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED  = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });

  const file      = form.get("file") as File | null;
  const blOrderId = form.get("orderId") as string | null;

  if (!file || !blOrderId)
    return NextResponse.json({ error: "Brak pliku lub ID zamówienia." }, { status: 400 });

  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: "Obsługiwane formaty: JPG, PNG, WEBP, HEIC." }, { status: 400 });

  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "Plik jest za duży (max 8 MB)." }, { status: 400 });

  const [order] = await db
    .select({ id: blOrderCache.id })
    .from(blOrderCache)
    .where(and(
      eq(blOrderCache.blOrderId, blOrderId),
      eq(blOrderCache.clientId, session.clientId),
    ))
    .limit(1);

  if (!order) return NextResponse.json({ error: "Nie znaleziono zamówienia." }, { status: 404 });

  const bytes  = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  await db
    .update(blOrderCache)
    .set({
      paymentConfirmationUrl: dataUrl,
      paymentConfirmationAt:  new Date(),
    })
    .where(eq(blOrderCache.id, order.id));

  return NextResponse.json({ ok: true });
}
