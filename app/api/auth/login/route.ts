import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, clientPhones } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { normalizePhone } from "@/lib/utils/phone";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Zbyt wiele prób. Spróbuj za 15 minut." },
      { status: 429 }
    );
  }

  const { phone, password } = await req.json();
  if (!phone || !password) {
    return NextResponse.json({ error: "Podaj numer telefonu i hasło." }, { status: 400 });
  }

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

  if (!client) {
    return NextResponse.json({ error: "Nieprawidłowy numer lub hasło." }, { status: 401 });
  }

  if (!client.active) {
    return NextResponse.json({ error: "Konto jest nieaktywne." }, { status: 403 });
  }

  if (!client.passwordHash) {
    return NextResponse.json({ needsPassword: true }, { status: 200 });
  }

  const valid = await bcrypt.compare(password, client.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Nieprawidłowy numer lub hasło." }, { status: 401 });
  }

  const jwt = await createSession(client.id, client.role);
  await setSessionCookie(jwt);

  return NextResponse.json({ ok: true, role: client.role });
}
