import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: NextRequest) {
  const { password, remember } = await req.json();
  const correct = process.env.GATE_PASSWORD ?? "Sara2006";

  if (password !== correct) {
    return NextResponse.json({ error: "Nieprawidłowe hasło." }, { status: 401 });
  }

  const maxAge = remember ? 60 * 60 * 24 : 60 * 60 * 4;
  const token  = await new SignJWT({ gate: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(remember ? "24h" : "4h")
    .sign(secret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("gm_gate", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return res;
}
