"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Map, MapPin, Route } from "lucide-react";

const primaryLinks = [
  { href: "/", label: "Explore", icon: Map, exact: true },
  { href: "/search", label: "Routes", icon: Route },
  { href: "/search/airports", label: "Airports", icon: MapPin },
] as const;

export function NavLinks({
  authenticated,
  mobile = false,
}: {
  authenticated: boolean;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const links = authenticated
    ? [...primaryLinks, { href: "/savedroutes", label: "Saved", icon: Bookmark }]
    : primaryLinks;

  return (
    <div className={mobile ? "grid gap-1" : "flex items-center gap-1"}>
      {links.map((link) => {
        const isRouteDetail = /^\/\d+$/.test(pathname);
        const active =
          link.href === "/search"
            ? pathname === "/search" || isRouteDetail
            : "exact" in link && link.exact
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              mobile
                ? `flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors ${
                    active
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  }`
                : `relative flex h-9 items-center gap-2 rounded-md px-3 text-sm transition-colors ${
                    active
                      ? "bg-accent text-foreground after:absolute after:inset-x-3 after:-bottom-[10px] after:h-px after:bg-primary"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  }`
            }
          >
            <Icon className="h-4 w-4 stroke-[1.7]" aria-hidden="true" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
