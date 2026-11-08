"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  useMapContext,
} from "react-simple-maps";
import usStates from "us-atlas/states-10m.json";

type AirportPoint = {
  iataCode: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
};

type RouteGeoDisplayProps = {
  origin: AirportPoint;
  destination: AirportPoint;
};

const geography = usStates as Record<string, unknown>;

function hasCoordinates(
  airport: AirportPoint
): airport is AirportPoint & { latitude: number; longitude: number } {
  return airport.latitude !== null && airport.longitude !== null;
}

export function RouteGeoDisplay({ origin, destination }: RouteGeoDisplayProps) {
  if (!hasCoordinates(origin) || !hasCoordinates(destination)) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-border/60 bg-background/40 px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Map unavailable — one or both airports are missing coordinates.
        </p>
      </div>
    );
  }

  const from: [number, number] = [origin.longitude, origin.latitude];
  const to: [number, number] = [destination.longitude, destination.latitude];

  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-[#0a0b0e]">
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 1000 }}
        width={800}
        height={500}
        className="mx-auto h-auto w-full"
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={geography}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#1b1e27"
                stroke="#2a3040"
                strokeWidth={0.6}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: "#1f2430" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        <ProjectedRouteLine from={from} to={to} />

        <AirportMarker
          coordinates={from}
          iataCode={origin.iataCode}
          city={origin.city}
          align="start"
        />
        <AirportMarker
          coordinates={to}
          iataCode={destination.iataCode}
          city={destination.city}
          align="end"
        />
      </ComposableMap>
    </div>
  );
}

function ProjectedRouteLine({
  from,
  to,
}: {
  from: [number, number];
  to: [number, number];
}) {
  const { projection } = useMapContext();
  const start = projection(from);
  const end = projection(to);

  if (!start || !end) {
    return null;
  }

  return (
    <line
      x1={start[0]}
      y1={start[1]}
      x2={end[0]}
      y2={end[1]}
      stroke="#f5a623"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeDasharray="6 8"
      className="flight-route-dash"
      opacity={0.9}
    />
  );
}

function AirportMarker({
  coordinates,
  iataCode,
  city,
  align,
}: {
  coordinates: [number, number];
  iataCode: string;
  city: string;
  align: "start" | "end";
}) {
  const textAnchor = align === "start" ? "end" : "start";
  const dx = align === "start" ? -10 : 10;

  return (
    <Marker coordinates={coordinates}>
      <circle r={10} fill="none" stroke="#f5a623" strokeOpacity={0.45} />
      <circle r={4.5} fill="#f5a623" />
      <text
        textAnchor={textAnchor}
        x={dx}
        y={-10}
        style={{
          fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace",
          fontSize: 11,
          letterSpacing: "0.18em",
          fill: "#f5a623",
          fontWeight: 500,
        }}
      >
        {iataCode}
      </text>
      <text
        textAnchor={textAnchor}
        x={dx}
        y={4}
        style={{
          fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
          fontSize: 9,
          fill: "#9aa3b5",
        }}
      >
        {city}
      </text>
    </Marker>
  );
}
