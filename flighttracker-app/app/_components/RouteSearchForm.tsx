"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, CircleAlert, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildRouteSlug } from "@/lib/routeSlug";
import type { ApiError, ApiSuccess, RouteSummary } from "@/types/flights";

const IATA_CODE_PATTERN = /^[A-Za-z]{3}$/;

export function RouteSearchForm({
  authenticated = true,
  initialOrigin = "",
  initialDestination = "",
  compact = false,
}: {
  authenticated?: boolean;
  initialOrigin?: string;
  initialDestination?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function swapAirports() {
    setOrigin(destination);
    setDestination(origin);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const originCode = origin.trim().toUpperCase();
    const destinationCode = destination.trim().toUpperCase();

    if (!IATA_CODE_PATTERN.test(originCode)) {
      setError("Departure airport must be a valid 3-letter IATA code");
      return;
    }
    if (!IATA_CODE_PATTERN.test(destinationCode)) {
      setError("Arrival airport must be a valid 3-letter IATA code");
      return;
    }
    if (originCode === destinationCode) {
      setError("Departure and arrival airports must be different");
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        origin: originCode,
        destination: destinationCode,
        limit: "1",
      });
      const response = await fetch(`/api/routes/search?${params.toString()}`);
      const data = (await response.json()) as ApiSuccess<RouteSummary[]> | ApiError;

      if (!response.ok || !data.success) {
        setError(data.success === false ? data.error : "Failed to search routes");
        return;
      }
      if (data.data.length === 0) {
        setError("No route found for this corridor.");
        return;
      }

      const destinationPath = `/${buildRouteSlug(data.data[0].id)}`;
      router.push(
        authenticated
          ? destinationPath
          : `/login?callbackUrl=${encodeURIComponent(destinationPath)}`
      );
    } catch {
      setError("Failed to search routes");
    } finally {
      setIsLoading(false);
    }
  }

  const canSubmit =
    IATA_CODE_PATTERN.test(origin.trim()) &&
    IATA_CODE_PATTERN.test(destination.trim()) &&
    origin.trim().toUpperCase() !== destination.trim().toUpperCase();

  return (
    <form className="route-search-form" onSubmit={handleSubmit} aria-label="Search domestic routes">
      <div className={compact ? "grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-end" : "grid gap-4 md:grid-cols-[1fr_auto_1fr_auto] md:items-end"}>
        <AirportField
          id={compact ? "home-origin" : "origin"}
          label="Origin"
          value={origin}
          placeholder="ORD"
          onChange={setOrigin}
          onClear={() => setOrigin("")}
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={swapAirports}
          disabled={!origin && !destination}
          aria-label="Swap origin and destination"
          className="h-11 w-11 justify-self-center border-border bg-secondary text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-primary md:mb-0"
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
        </Button>

        <AirportField
          id={compact ? "home-destination" : "destination"}
          label="Destination"
          value={destination}
          placeholder="LAX"
          onChange={setDestination}
          onClear={() => setDestination("")}
        />

        <Button
          type="submit"
          disabled={isLoading || !canSubmit}
          className="h-11 min-w-36 bg-primary px-5 text-primary-foreground hover:bg-primary/90"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          {isLoading ? "Searching…" : "Analyze route"}
        </Button>
      </div>

      <div className="mt-3 flex min-h-6 flex-wrap items-center justify-between gap-2" aria-live="polite">
        {error ? (
          <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
            <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Enter two different U.S. airport IATA codes.
          </p>
        )}
        <Link href="/search/airports" className="text-xs font-medium text-primary hover:text-primary/80 hover:underline">
          Find an airport code
        </Link>
      </div>
    </form>
  );
}

function AirportField({
  id,
  label,
  value,
  placeholder,
  onChange,
  onClear,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={label.toLowerCase()}
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          placeholder={placeholder}
          maxLength={3}
          className="h-11 bg-background/55 pr-10 font-mono text-base tracking-[0.16em] uppercase"
          autoComplete="off"
          required
        />
        {value ? (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Clear ${label.toLowerCase()}`}
            className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
