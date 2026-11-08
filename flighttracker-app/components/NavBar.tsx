import Link from "next/link";

import { auth } from "@/auth";

const navLinks = [
  { href: "/search/", label: "Search Routes" },
  { href: "/search/airports", label: "Search Airports" },
  { href: "/savedroutes", label: "Saved Routes" },
] as const;

export async function NavBar() {
  const session = await auth();
  const username =
    session?.user?.username ?? session?.user?.name ?? null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto sm:gap-4">
          <Link
            href={session?.user ? "/search" : "/"}
            className="mr-2 shrink-0 font-mono text-[0.65rem] tracking-[0.25em] text-amber-400 uppercase"
          >
            FRT
          </Link>
          {session?.user
            ? navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))
            : null}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {session?.user ? (
            <>
              <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                {username}
              </span>
              <Link
                href="/profile"
                className="text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-amber-400"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
