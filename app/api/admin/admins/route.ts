import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { normalizePhone } from "@/lib/utils/phone";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const admins = await db
    .select({ id: clients.id, phone: clients.phone, name: clients.name, email: clients.email, active: clients.active, createdAt: clients.createdAt })
    .from(clients)
    .where(eq(clients.role, "admin"));

  return NextResponse.json({ admins });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const { phone, name, email } = await req.json();
  if (!phone) return NextResponse.json({ error: "Podaj numer telefonu." }, { status: 400 });

  const normalized = normalizePhone(phone);

  const [existing] = await db.select({ id: clients.id, role: clients.role }).from(clients).where(eq(clients.phone, normalized)).limit(1);

  if (existing) {
    if (existing.role === "admin") return NextResponse.json({ error: "Ten numer jest już administratorem." }, { status: 409 });
    await db.update(clients).set({ role: "admin", name: name || existing.id, updatedAt: new Date() }).where(eq(clients.id, existing.id));
    return NextResponse.json({ ok: true, promoted: true });
  }

  const [admin] = await db.insert(clients).values({
    phone: normalized,
    name: name || null,
    email: email || null,
    role: "admin",
    active: true,
  }).returning({ id: clients.id });

  return NextResponse.json({ ok: true, id: admin.id });
}
