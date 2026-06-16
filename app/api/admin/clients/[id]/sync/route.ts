import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { syncOrdersForClient } from "@/lib/sync/orders";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const count = await syncOrdersForClient(params.id);
  return NextResponse.json({ ok: true, synced: count });
}
