import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blOrderCache, clients } from "@/lib/db/schema";
import { desc, eq, isNotNull, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });

  const filter = req.nextUrl.searchParams.get("filter") ?? "all";

  const rows = await db
    .select({
      id:                    blOrderCache.id,
      blOrderId:             blOrderCache.blOrderId,
      clientId:              blOrderCache.clientId,
      clientName:            clients.name,
      clientPhone:           clients.phone,
      statusId:              blOrderCache.statusId,
      statusName:            blOrderCache.statusName,
      orderDate:             blOrderCache.orderDate,
      total:                 blOrderCache.total,
      deliveryMethod:        blOrderCache.deliveryMethod,
      userComments:          blOrderCache.userComments,
      paymentConfirmationUrl: blOrderCache.paymentConfirmationUrl,
      paymentConfirmationAt:  blOrderCache.paymentConfirmationAt,
    })
    .from(blOrderCache)
    .leftJoin(clients, eq(blOrderCache.clientId, clients.id))
    .orderBy(desc(blOrderCache.orderDate));

  const isCod = (r: typeof rows[number]) =>
    r.statusName?.startsWith("Za pobraniem") ?? false;

  const filtered = filter === "confirmed"
    ? rows.filter(r => r.paymentConfirmationUrl)
    : filter === "pending"
    ? rows.filter(r => !r.paymentConfirmationUrl && !isCod(r))
    : rows;

  return NextResponse.json({ orders: filtered });
}
