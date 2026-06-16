import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientAddresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });

  const body = await req.json();
  const { fullname, street, city, postcode, phone, email, courierType, lockerCode, lockerName, isDefault } = body;
  if (!fullname || !street || !city || !postcode)
    return NextResponse.json({ error: "Wypełnij wymagane pola." }, { status: 400 });

  if (isDefault) {
    await db.update(clientAddresses).set({ isDefault: false })
      .where(eq(clientAddresses.clientId, params.id));
  }

  const [addr] = await db.insert(clientAddresses).values({
    clientId: params.id,
    label: fullname,
    fullname,
    phone: phone || null,
    email: email || null,
    courierType: courierType || null,
    lockerCode: lockerCode || null,
    lockerName: lockerName || null,
    street,
    city,
    postcode,
    isDefault: !!isDefault,
  }).returning();

  return NextResponse.json({ address: addr });
}
