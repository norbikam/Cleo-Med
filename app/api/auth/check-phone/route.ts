import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, clientPhones } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { normalizePhone } from "@/lib/utils/phone";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: "Podaj numer telefonu." }, { status: 400 });

  const normalized = normalizePhone(phone);

  const [byMain] = await db
    .select()
    .from(clients)
    .where(eq(clients.phone, normalized))
    .limit(1);

  let client = byMain;

  if (!client) {
    const [byExtra] = await db
      .select({ clientId: clientPhones.clientId })
      .from(clientPhones)
      .where(eq(clientPhones.phone, normalized))
      .limit(1);

    if (byExtra) {
      const [found] = await db
        .select()
        .from(clients)
        .where(eq(clients.id, byExtra.clientId))
        .limit(1);
      client = found;
    }
  }

  if (!client) return NextResponse.json({ exists: false });

  return NextResponse.json({ exists: true, hasPassword: !!client.passwordHash });
}
