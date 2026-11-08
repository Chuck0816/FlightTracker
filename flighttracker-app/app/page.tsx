import Link from "next/link";
import { ArrowRight, BarChart3, Clock3, ShieldCheck } from "lucide-react";

import { auth } from "@/auth";
import { RouteMap } from "@/app/_components/RouteMap";
import { RouteSearchForm } from "@/app/_components/RouteSearchForm";
import { getSavedRoutesForUser } from "@/lib/savedRoutes";
import { buildRouteSlug } from "@/lib/routeSlug";

const exampleOrigin = {
  iataCode: "ORD",
  city: "Chicago",
  stateCode: "IL",
  latitude: 41.9786,
  longitude: -87.9048,
};

const exampleDestination = {
  iataCode: "LAX",
  city: "Los Angeles",
  stateCode: "CA",
  latitude: 33.942501,
  longitude: -118.407997,
};

export default async function HomePage() {
  const session = await auth();
  const savedRoutes = session?.user
    ? (await getSavedRoutesForUser(Number(session.user.id))).slice(0, 3)
    : [];

  return (
    <main className="app-page">
      <div className="app-page-wide space-y-4">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(390px,0.75fr)] xl:items-end">
          <div>
            <p className="eyebrow">U.S. domestic route intelligence</p>
            <h1 className="mt-2 max-w-4xl font-heading text-3xl font-medium tracking-[-0.04em] text-foreground sm:text-4xl lg:text-5xl">
              Explore a route. Understand how it performs.
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground xl:justify-self-end">
            Search airport pairs, inspect the route geography, and compare historical
            reliability, delays, cancellations, airlines, and fares in one workspace.
          </p>
        </section>

        <RouteSearchForm
          authenticated={Boolean(session?.user)}
          initialOrigin="ORD"
          initialDestination="LAX"
          compact
        />

        <section className="grid overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.62fr)]">
          <RouteMap
            origin={exampleOrigin}
            destination={exampleDestination}
            label="Example corridor · ORD to LAX"
            compact
          />

          <aside className="flex flex-col border-t border-border bg-card p-5 lg:border-l lg:border-t-0 lg:p-6">
            <div>
              <p className="eyebrow">Workspace preview</p>
              <div className="mt-2 flex items-center gap-3 font-mono text-2xl tracking-wide">
                <span className="text-primary">ORD</span>
                <ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <span className="text-primary">LAX</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Chicago O&apos;Hare International to Los Angeles International.
                Search this corridor to load its actual historical metrics.
              </p>
            </div>

            <div className="mt-6 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3 lg:grid-cols-1">
              <PreviewMetric icon={ShieldCheck} label="Reliability" description="On-time and cancellation rates" />
              <PreviewMetric icon={Clock3} label="Delay analysis" description="Monthly trends and causes" />
              <PreviewMetric icon={BarChart3} label="Market context" description="Airline and fare comparison" />
            </div>

            <div className="mt-auto pt-6">
              <Link
                href={session?.user ? "/search" : "/login?callbackUrl=%2Fsearch"}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {session?.user ? "Open route search" : "Sign in to analyze routes"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </section>

        {savedRoutes.length > 0 ? (
          <section className="workspace-surface overflow-hidden" aria-labelledby="saved-home-heading">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <p className="eyebrow">Your workspace</p>
                <h2 id="saved-home-heading" className="mt-1 font-heading text-lg font-medium">Saved routes</h2>
              </div>
              <Link href="/savedroutes" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            <div className="grid md:grid-cols-3">
              {savedRoutes.map((savedRoute) => (
                <Link
                  key={savedRoute.routeId}
                  href={`/${buildRouteSlug(savedRoute.routeId)}`}
                  className="group border-b border-border p-5 transition-colors hover:bg-accent/45 md:border-b-0 md:border-r md:last:border-r-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-lg tracking-[0.12em] text-foreground">
                      {savedRoute.origin} <span className="text-muted-foreground">→</span> {savedRoute.destination}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
                  </div>
                  <p className="mt-2 truncate text-sm text-muted-foreground">{savedRoute.note?.trim() || "No note added"}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function PreviewMetric({
  icon: Icon,
  label,
  description,
}: {
  icon: typeof ShieldCheck;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 bg-card px-4 py-3.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
