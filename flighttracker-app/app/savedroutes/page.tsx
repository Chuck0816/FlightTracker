import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Bookmark, MapPinned } from "lucide-react";

import { auth } from "@/auth";
import { RemoveSavedRouteButton } from "@/components/RemoveSavedRouteButton";
import { buildRouteSlug } from "@/lib/routeSlug";
import { getSavedRoutesForUser } from "@/lib/savedRoutes";

export default async function SavedRoutesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const savedRoutes = await getSavedRoutesForUser(Number(session.user.id));

  return (
    <main className="app-page">
      <div className="app-page-medium">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Personal workspace</p>
            <h1>Saved routes</h1>
          </div>
          <p>Return to important corridors and keep the context you added when saving them.</p>
        </div>

        {savedRoutes.length === 0 ? (
          <section className="analytics-state min-h-80">
            <Bookmark className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <div>
              <h2 className="font-heading text-lg font-medium text-foreground">No saved routes yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">Search for a corridor, open its analytics workspace, and save it with an optional note.</p>
              <Link href="/search" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Search routes <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </section>
        ) : (
          <section className="overflow-hidden rounded-xl border border-border bg-card" aria-label="Saved route list">
            <div className="hidden grid-cols-[11rem_1fr_4rem] gap-5 border-b border-border bg-background/25 px-5 py-3 text-xs text-muted-foreground sm:grid">
              <span>Route</span><span>Note</span><span className="sr-only">Actions</span>
            </div>
            <div>
              {savedRoutes.map((savedRoute) => (
                <div key={savedRoute.routeId} className="group relative grid grid-cols-[1fr_auto] gap-3 border-b border-border px-4 py-4 transition-colors last:border-b-0 hover:bg-accent/35 sm:grid-cols-[11rem_1fr_4rem] sm:items-center sm:gap-5 sm:px-5">
                  <Link href={`/${buildRouteSlug(savedRoute.routeId)}`} className="absolute inset-0 z-0" aria-label={`View ${savedRoute.origin} to ${savedRoute.destination}`} />
                  <div className="pointer-events-none relative z-0 flex items-center gap-2 font-mono text-base font-medium tracking-[0.12em] text-foreground">
                    <MapPinned className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>{savedRoute.origin}</span><span className="text-muted-foreground">→</span><span>{savedRoute.destination}</span>
                  </div>
                  <p className={`pointer-events-none relative z-0 col-start-1 row-start-2 truncate text-sm sm:col-start-2 sm:row-start-1 ${savedRoute.note?.trim() ? "text-muted-foreground" : "italic text-muted-foreground/55"}`}>
                    {savedRoute.note?.trim() || "No note added"}
                  </p>
                  <div className="relative z-10 col-start-2 row-span-2 row-start-1 flex items-center justify-end sm:col-start-3 sm:row-span-1">
                    <RemoveSavedRouteButton routeId={savedRoute.routeId} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
