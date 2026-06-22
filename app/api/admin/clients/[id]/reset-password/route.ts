import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const [client] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.id, params.id))
    .limit(1);

  if (!client) return NextResponse.json({ error: "Klient nie znaleziony." }, { status: 404 });

  await db
    .update(clients)
    .set({ passwordHash: null, updatedAt: new Date() })
    .where(eq(clients.id, params.id));

  return NextResponse.json({ ok: true });
}
