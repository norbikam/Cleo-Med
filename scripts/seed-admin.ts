import * as dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(process.cwd(), ".env.local") });

async function main() {
  const password = process.argv[2];
  if (!password || password.length < 8) {
    console.error("Użycie: npm run seed:admin <hasło> (min. 8 znaków)");
    process.exit(1);
  }

  const rawPhone = process.env.ADMIN_PHONE;
  const dbUrl = process.env.DATABASE_URL;

  if (!rawPhone) { console.error("Brak ADMIN_PHONE w .env.local"); process.exit(1); }
  if (!dbUrl)    { console.error("Brak DATABASE_URL w .env.local");  process.exit(1); }

  const { default: postgres } = await import("postgres");
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const { clients } = await import("../lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const { default: bcrypt } = await import("bcryptjs");
  const { normalizePhone } = await import("../lib/utils/phone");

  const sql = postgres(dbUrl, { prepare: false });
  const db = drizzle(sql);

  const phone = normalizePhone(rawPhone);
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await db.select().from(clients).where(eq(clients.phone, phone)).limit(1);

  if (existing.length > 0) {
    await db.update(clients)
      .set({ passwordHash, role: "admin", active: true, updatedAt: new Date() })
      .where(eq(clients.phone, phone));
    console.log(`Zaktualizowano konto admina: ${phone}`);
  } else {
    await db.insert(clients).values({ phone, passwordHash, role: "admin", active: true });
    console.log(`Utworzono konto admina: ${phone}`);
  }

  await sql.end();
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
