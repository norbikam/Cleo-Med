import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, clientPhones } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { eq, desc } from "drizzle-orm";
import { normalizePhone } from "@/lib/utils/phone";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });

  const all = await db
    .select({
      id: clients.id,
      phone: clients.phone,
      name: clients.name,
      email: clients.email,
      role: clients.role,
      active: clients.active,
      createdAt: clients.createdAt,
    })
    .from(clients)
    .orderBy(desc(clients.createdAt));

  return NextResponse.json({ clients: all });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });

  const { phone, name, email } = await req.json();
  if (!phone?.trim()) return NextResponse.json({ error: "Numer telefonu jest wymagany." }, { status: 400 });

  const normalized = normalizePhone(phone.trim());

  const [existing] = await db.select({ id: clients.id }).from(clients).where(eq(clients.phone, normalized)).limit(1);
  if (existing) return NextResponse.json({ error: "Klient z tym numerem już istnieje." }, { status: 409 });

  const [existingExtra] = await db.select({ id: clientPhones.id }).from(clientPhones).where(eq(clientPhones.phone, normalized)).limit(1);
  if (existingExtra) return NextResponse.json({ error: "Ten numer jest już przypisany do innego klienta." }, { status: 409 });

  const [created] = await db
    .insert(clients)
    .values({
      phone: normalized,
      name: name?.trim() || null,
      email: email?.trim() || null,
      active: false,
    })
    .returning({ id: clients.id, phone: clients.phone, name: clients.name, email: clients.email, role: clients.role, active: clients.active, createdAt: clients.createdAt });

  return NextResponse.json({ client: created }, { status: 201 });
}
