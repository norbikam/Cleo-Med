import Nav from "@/components/Nav";
import { CartProvider } from "@/lib/cart/context";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">{children}</main>
      </div>
    </CartProvider>
  );
}
