import Link from "next/link";
import { Menu, Plane, UserRound } from "lucide-react";

import { auth } from "@/auth";
import { NavLinks } from "@/app/_components/NavLinks";

export async function AppNav() {
  const session = await auth();
  const authenticated = Boolean(session?.user);
  const username = session?.user?.username ?? session?.user?.name ?? "Profile";

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-md">
      <nav className="mx-auto flex h-14 w-full items-center gap-4 px-4 sm:px-6 lg:px-8" aria-label="Primary navigation">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-medium tracking-tight text-foreground"
          aria-label="Flight Tracker home"
        >
          <span className="grid h-8 w-8 place-items-center rounded-md border border-primary/45 bg-primary/10 text-primary">
            <Plane className="h-4 w-4 -rotate-12 stroke-[1.8]" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">Flight Tracker</span>
        </Link>

        <div className="hidden flex-1 items-center md:flex">
          <NavLinks authenticated={authenticated} />
        </div>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {authenticated ? (
            <Link
              href="/profile"
              className="flex h-9 items-center gap-2 rounded-md border border-border bg-secondary/60 px-3 text-sm text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground"
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              <span className="max-w-32 truncate">{username}</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
              <Link href="/signup" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Create account
              </Link>
            </>
          )}
        </div>

        <details className="mobile-nav relative ml-auto md:hidden">
          <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-md border border-border bg-secondary text-muted-foreground">
            <Menu className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Open navigation</span>
          </summary>
          <div className="absolute right-0 top-12 w-64 rounded-lg border border-border bg-popover p-2 shadow-xl shadow-black/20">
            <NavLinks authenticated={authenticated} mobile />
            <div className="my-2 h-px bg-border" />
            {authenticated ? (
              <Link href="/profile" className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                <UserRound className="h-4 w-4" aria-hidden="true" />
                <span className="truncate">{username}</span>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-1">
                <Link href="/login" className="rounded-md border border-border px-3 py-2 text-center text-sm text-muted-foreground">Sign in</Link>
                <Link href="/signup" className="rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground">Sign up</Link>
              </div>
            )}
          </div>
        </details>
      </nav>
    </header>
  );
}
