"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, CircleAlert, MapPin, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AirportSummary, ApiError, ApiSuccess } from "@/types/flights";

const MIN_KEYWORD_LENGTH = 2;

export default function AirportSearchPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<AirportSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResults(null);

    const trimmed = keyword.trim();
    if (trimmed.length < MIN_KEYWORD_LENGTH) {
      setError(`Query must contain at least ${MIN_KEYWORD_LENGTH} characters`);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch(`/api/airports/search?q=${encodeURIComponent(trimmed)}&limit=10`);
      const data = (await response.json()) as ApiSuccess<AirportSummary[]> | ApiError;
      if (!response.ok || !data.success) {
        setError(data.success === false ? data.error : "Failed to search airports");
        return;
      }
      setResults(data.data);
    } catch {
      setError("Failed to search airports");
    } finally {
      setIsLoading(false);
    }
  }

  function clearSearch() {
    setKeyword("");
    setResults(null);
    setError(null);
    setHasSearched(false);
  }

  return (
    <main className="app-page">
      <div className="app-page-medium">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Airport directory</p>
            <h1>Find an airport code</h1>
          </div>
          <p>Search by airport name, city, or IATA code, then use the code in Route Explorer.</p>
        </div>

        <form onSubmit={handleSubmit} className="route-search-form" aria-label="Search airports">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="keyword" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Airport or city</Label>
              <div className="relative">
                <Input id="keyword" name="keyword" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="ORD, Chicago, or O'Hare" autoComplete="off" required className="h-11 bg-background/55 pl-10 pr-10" />
                <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                {keyword ? <button type="button" onClick={clearSearch} aria-label="Clear airport search" className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"><X className="h-4 w-4" aria-hidden="true" /></button> : null}
              </div>
            </div>
            <Button type="submit" disabled={isLoading || keyword.trim().length < MIN_KEYWORD_LENGTH} className="h-11 min-w-40 bg-primary text-primary-foreground hover:bg-primary/90">
              <Search className="h-4 w-4" aria-hidden="true" />
              {isLoading ? "Searching…" : "Search airports"}
            </Button>
          </div>
          <div className="mt-3 min-h-6" aria-live="polite">
            {error ? <p role="alert" className="flex items-center gap-2 text-sm text-destructive"><CircleAlert className="h-4 w-4" aria-hidden="true" />{error}</p> : <p className="text-xs text-muted-foreground">Use at least two characters. Results come from the existing airport directory.</p>}
          </div>
        </form>

        <section className="mt-5" aria-labelledby="airport-results-heading">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Directory results</p>
              <h2 id="airport-results-heading" className="mt-1 font-heading text-lg font-medium">
                {!hasSearched ? "Search to begin" : isLoading ? "Searching airports" : `${results?.length ?? 0} airport${results?.length === 1 ? "" : "s"} found`}
              </h2>
            </div>
            <Link href="/search" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">Route search <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>

          {isLoading ? (
            <div className="grid gap-3" aria-label="Loading airport results" aria-busy="true">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-lg border border-border bg-card" />)}</div>
          ) : results && results.length > 0 ? (
            <ul className="overflow-hidden rounded-xl border border-border bg-card">
              {results.map((airport) => (
                <li key={airport.id} className="grid gap-3 border-b border-border px-4 py-4 last:border-b-0 sm:grid-cols-[6rem_1fr_auto] sm:items-center sm:px-5">
                  <div className="flex items-center gap-3 sm:block">
                    <span className="font-mono text-xl font-medium tracking-[0.14em] text-primary">{airport.iataCode}</span>
                    <span className="text-xs text-muted-foreground sm:mt-1 sm:block">{airport.city}, {airport.stateCode}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{airport.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{airport.stateName}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Building2 className="h-4 w-4" aria-hidden="true" /> Airport</div>
                </li>
              ))}
            </ul>
          ) : hasSearched && results?.length === 0 ? (
            <div className="analytics-state"><Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" /><div><p className="font-medium text-foreground">No airports found</p><p className="mt-1 text-sm text-muted-foreground">Try a city, airport name, or a different spelling.</p></div></div>
          ) : (
            <div className="analytics-state"><MapPin className="h-5 w-5 text-muted-foreground" aria-hidden="true" /><div><p className="font-medium text-foreground">Search the airport directory</p><p className="mt-1 text-sm text-muted-foreground">Results will appear here without leaving the page.</p></div></div>
          )}
        </section>
      </div>
    </main>
  );
}
