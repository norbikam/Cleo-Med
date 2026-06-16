import { NextResponse } from "next/server";
import { getSession, deleteSession, clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  const session = await getSession();
  if (session) {
    await deleteSession(session.tokenHash);
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
