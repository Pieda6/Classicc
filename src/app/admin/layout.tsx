import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · CLASSICC Admin" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr] lg:bg-[linear-gradient(to_right,#111110_250px,transparent_250px)]">
      <AdminNav name={user.name} email={user.email} />
      <div className="min-w-0 p-4 md:p-8">{children}</div>
    </div>
  );
}
