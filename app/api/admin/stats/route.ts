import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, blOrderCache } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { count, sum, desc, eq, ne, and, gte, sql } from "drizzle-orm";

const SHOP_SOURCE_ID = 18291;

function startOf(unit: "day" | "week" | "month"): Date {
  const d = new Date();
  if (unit === "day") {
    d.setHours(0, 0, 0, 0);
  } else if (unit === "week") {
    const day = d.getDay(); // 0=Sun
    d.setDate(d.getDate() - ((day + 6) % 7)); // Monday
    d.setHours(0, 0, 0, 0);
  } else {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

async function periodStats(from: Date) {
  const shopFilter = eq(blOrderCache.customSourceId, SHOP_SOURCE_ID);
  const [{ orders }] = await db
    .select({ orders: count() })
    .from(blOrderCache)
    .where(and(shopFilter, gte(blOrderCache.orderDate, from)));

  const [{ rev }] = await db
    .select({ rev: sum(blOrderCache.total) })
    .from(blOrderCache)
    .where(and(shopFilter, gte(blOrderCache.orderDate, from)));

  return { orders: Number(orders), revenue: rev ? Number(rev).toFixed(2) : "0.00" };
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const shopFilter = eq(blOrderCache.customSourceId, SHOP_SOURCE_ID);

  const [{ total }] = await db
    .select({ total: count() })
    .from(clients)
    .where(ne(clients.role, "admin"));

  const [{ active }] = await db
    .select({ active: count() })
    .from(clients)
    .where(and(ne(clients.role, "admin"), eq(clients.active, true)));

  const [{ totalOrders }] = await db
    .select({ totalOrders: count() })
    .from(blOrderCache)
    .where(shopFilter);

  const [{ revenue }] = await db
    .select({ revenue: sum(blOrderCache.total) })
    .from(blOrderCache)
    .where(shopFilter);

  const [daily, weekly, monthly] = await Promise.all([
    periodStats(startOf("day")),
    periodStats(startOf("week")),
    periodStats(startOf("month")),
  ]);

  const recentClients = await db
    .select({ id: clients.id, name: clients.name, phone: clients.phone, email: clients.email, active: clients.active, createdAt: clients.createdAt })
    .from(clients)
    .where(ne(clients.role, "admin"))
    .orderBy(desc(clients.createdAt))
    .limit(5);

  return NextResponse.json({
    totalClients: Number(total),
    activeClients: Number(active),
    totalOrders: Number(totalOrders),
    revenue: revenue ? Number(revenue).toFixed(2) : "0.00",
    daily,
    weekly,
    monthly,
    recentClients,
  });
}
