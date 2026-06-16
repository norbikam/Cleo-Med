import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { syncOrdersForClient } from "@/lib/sync/orders";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });

  const count = await syncOrdersForClient(session.clientId);
  return NextResponse.json({ ok: true, synced: count });
}
