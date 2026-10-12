import { requireUser } from "@/lib/auth";
import { logout } from "../actions";
import { AccountNav } from "./account-nav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="container-x pt-6 md:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">My account</p>
          <h1 className="mt-2 font-display text-3xl md:text-5xl font-semibold">Hello, {user.name.split(" ")[0]}</h1>
        </div>
        <form action={logout}>
          <button className="btn btn-light">Log out</button>
        </form>
      </div>
      <div className="mt-8 grid lg:grid-cols-[220px_1fr] gap-6 items-start">
        <AccountNav isAdmin={user.role === "ADMIN"} />
        <div>{children}</div>
      </div>
    </div>
  );
}
