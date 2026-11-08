import { Compass, Database, MapPinned } from "lucide-react";

import { RouteSearchForm } from "@/app/_components/RouteSearchForm";

export default function SearchPage() {
  return (
    <main className="app-page">
      <div className="app-page-medium">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Route explorer</p>
            <h1>Search a domestic route</h1>
          </div>
          <p>
            Enter an origin and destination IATA code to open the map and historical
            analytics workspace for that corridor.
          </p>
        </div>

        <RouteSearchForm />

        <section className="mt-5 grid overflow-hidden rounded-xl border border-border bg-card md:grid-cols-3" aria-label="Route search capabilities">
          <SearchCapability icon={MapPinned} title="Route geography" text="See the two airports and corridor on a U.S. map." />
          <SearchCapability icon={Compass} title="Reliability context" text="Review delays, cancellations, and seasonal performance." />
          <SearchCapability icon={Database} title="Historical analysis" text="Metrics reflect observed records, not live aircraft positions." />
        </section>
      </div>
    </main>
  );
}

function SearchCapability({ icon: Icon, title, text }: { icon: typeof Compass; title: string; text: string }) {
  return (
    <div className="border-b border-border p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      <h2 className="mt-3 text-sm font-medium text-foreground">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}
