import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });

  const [client] = await db
    .select({ id: clients.id, phone: clients.phone, name: clients.name, email: clients.email, role: clients.role })
    .from(clients)
    .where(eq(clients.id, session.clientId))
    .limit(1);

  return NextResponse.json({ client });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });

  const { name } = await req.json();

  const [updated] = await db
    .update(clients)
    .set({ name, updatedAt: new Date() })
    .where(eq(clients.id, session.clientId))
    .returning({ id: clients.id, name: clients.name });

  return NextResponse.json({ client: updated });
}
