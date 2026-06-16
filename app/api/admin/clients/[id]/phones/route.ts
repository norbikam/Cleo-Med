import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientPhones } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { normalizePhone } from "@/lib/utils/phone";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const { phone, label } = await req.json();
  if (!phone) return NextResponse.json({ error: "Podaj numer telefonu." }, { status: 400 });

  const normalized = normalizePhone(phone);

  const [inserted] = await db
    .insert(clientPhones)
    .values({ clientId: params.id, phone: normalized, label })
    .returning();

  return NextResponse.json({ phone: inserted });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const { phoneId } = await req.json();
  await db.delete(clientPhones).where(eq(clientPhones.id, phoneId));

  return NextResponse.json({ ok: true });
}
