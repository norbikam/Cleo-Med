import Nav from "@/components/Nav";
import AnnouncementBar from "@/components/AnnouncementBar";
import { CartProvider } from "@/lib/cart/context";
import { getSession } from "@/lib/auth/session";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  return (
    <CartProvider>
      <AnnouncementBar />

      <div className="min-h-screen flex flex-col">
        <Nav isAdmin={isAdmin} />
        <main className="flex-1">{children}</main>
      </div>
    </CartProvider>
  );
}
