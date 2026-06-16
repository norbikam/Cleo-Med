import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageTexts } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }
  const rows = await db.select().from(pageTexts);
  return NextResponse.json({ texts: rows });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }
  const { key, value } = await req.json();
  if (!key || value == null) return NextResponse.json({ error: "Podaj key i value." }, { status: 400 });

  await db
    .insert(pageTexts)
    .values({ key, value })
    .onConflictDoUpdate({ target: pageTexts.key, set: { value, updatedAt: new Date() } });

  return NextResponse.json({ ok: true });
}
