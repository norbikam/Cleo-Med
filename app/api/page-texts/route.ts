import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageTexts } from "@/lib/db/schema";

export async function GET() {
  try {
    const rows = await db.select().from(pageTexts);
    const texts: Record<string, string> = {};
    for (const r of rows) texts[r.key] = r.value;
    return NextResponse.json({ texts });
  } catch {
    return NextResponse.json({ texts: {} });
  }
}
