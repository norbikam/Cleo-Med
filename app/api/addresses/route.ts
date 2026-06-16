import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientAddresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });

  const addresses = await db
    .select()
    .from(clientAddresses)
    .where(eq(clientAddresses.clientId, session.clientId))
    .orderBy(clientAddresses.createdAt);

  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });

  const body = await req.json();
  const { label, fullname, company, email, phone, courierType,
          lockerCode, lockerName, street, city, postcode, isDefault } = body;

  if (!fullname || !email || !phone || !courierType || !street || !city || !postcode) {
    return NextResponse.json({ error: "Wypełnij wszystkie wymagane pola." }, { status: 400 });
  }

  const effectiveLabel = label || fullname;

  if (isDefault) {
    await db.update(clientAddresses).set({ isDefault: false })
      .where(eq(clientAddresses.clientId, session.clientId));
  }

  const [addr] = await db.insert(clientAddresses).values({
    clientId: session.clientId,
    label: effectiveLabel, fullname, company, email, phone,
    courierType, lockerCode, lockerName,
    street, city, postcode,
    isDefault: !!isDefault,
  }).returning();

  return NextResponse.json({ address: addr });
}
