import { redirect } from "next/navigation";
import { LogOut, Mail, UserRound } from "lucide-react";

import { DeleteAccountButton, PasswordPopover } from "@/app/profile/ProfileActions";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const username = session.user.username ?? session.user.name ?? "Unknown";
  const email = session.user.email ?? "Not available";

  return (
    <main className="app-page">
      <div className="app-page-narrow">
        <div className="page-heading">
          <div><p className="eyebrow">Account settings</p><h1>Profile</h1></div>
          <p>Manage your account details, password, and authenticated session.</p>
        </div>

        <section className="overflow-hidden rounded-xl border border-border bg-card" aria-labelledby="profile-details-heading">
          <div className="border-b border-border px-5 py-4 sm:px-6">
            <h2 id="profile-details-heading" className="font-heading text-lg font-medium">Account details</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your identity in the route analytics workspace.</p>
          </div>
          <dl>
            <div className="grid gap-2 border-b border-border px-5 py-4 sm:grid-cols-[10rem_1fr] sm:items-center sm:px-6">
              <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"><UserRound className="h-4 w-4" aria-hidden="true" />Username</dt>
              <dd className="text-sm font-medium text-foreground">{username}</dd>
            </div>
            <div className="grid gap-2 border-b border-border px-5 py-4 sm:grid-cols-[10rem_1fr] sm:items-center sm:px-6">
              <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"><Mail className="h-4 w-4" aria-hidden="true" />Email</dt>
              <dd className="break-all text-sm font-medium text-foreground">{email}</dd>
            </div>
          </dl>
          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <PasswordPopover />
            <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
              <Button type="submit" variant="outline" className="h-10 min-w-32 border-border bg-secondary text-foreground hover:border-primary/35 hover:bg-accent">
                <LogOut className="h-4 w-4" aria-hidden="true" />Log out
              </Button>
            </form>
          </div>
        </section>

        <section className="mt-5 rounded-xl border border-destructive/25 bg-card" aria-labelledby="delete-account-heading">
          <div className="border-b border-destructive/15 px-5 py-4 sm:px-6">
            <h2 id="delete-account-heading" className="font-heading text-lg font-medium text-foreground">Delete account</h2>
            <p className="mt-1 text-sm text-muted-foreground">Permanently remove your account and sign out. This cannot be undone.</p>
          </div>
          <div className="px-5 py-5 sm:px-6"><DeleteAccountButton /></div>
        </section>
      </div>
    </main>
  );
}
