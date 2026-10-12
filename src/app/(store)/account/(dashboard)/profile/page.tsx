import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PasswordForm, ProfileForm } from "./forms";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <div className="grid xl:grid-cols-2 gap-4 items-start">
      <div className="card p-6 md:p-8">
        <h2 className="font-display text-xl font-semibold">Profile</h2>
        <p className="text-sm text-muted mt-1">{user.email}</p>
        <ProfileForm name={user.name} phone={user.phone ?? ""} />
      </div>
      <div className="card p-6 md:p-8">
        <h2 className="font-display text-xl font-semibold">Change password</h2>
        <PasswordForm />
      </div>
    </div>
  );
}
