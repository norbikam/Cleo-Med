import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") notFound();

  return (
    <div style={{ minHeight:"100vh", background:"var(--obsidian)" }}>
      <AdminNav />
      <main style={{ paddingTop:"64px" }}>{children}</main>
    </div>
  );
}
