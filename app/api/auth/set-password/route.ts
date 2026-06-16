import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { normalizePhone } from "@/lib/utils/phone";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { phone, password } = await req.json();
  if (!phone || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Hasło musi mieć co najmniej 8 znaków." },
      { status: 400 }
    );
  }

  const normalized = normalizePhone(phone);
  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.phone, normalized))
    .limit(1);

  if (!client) {
    return NextResponse.json({ error: "Konto nie istnieje." }, { status: 404 });
  }

  if (client.passwordHash) {
    return NextResponse.json(
      { error: "Hasło zostało już ustawione." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db
    .update(clients)
    .set({ passwordHash, active: true, updatedAt: new Date() })
    .where(eq(clients.id, client.id));

  const jwt = await createSession(client.id, client.role);
  await setSessionCookie(jwt);

  return NextResponse.json({ ok: true });
}
