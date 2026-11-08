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
  stateCode?: string;
  latitude: number | null;
  longitude: number | null;
};

const geography = usStates as Record<string, unknown>;

function hasCoordinates(
  airport: AirportPoint
): airport is AirportPoint & { latitude: number; longitude: number } {
  return airport.latitude !== null && airport.longitude !== null;
}

export function RouteMap({
  origin,
  destination,
  label = "Historical route map",
  compact = false,
}: {
  origin: AirportPoint;
  destination: AirportPoint;
  label?: string;
  compact?: boolean;
}) {
  if (!hasCoordinates(origin) || !hasCoordinates(destination)) {
    return (
      <div className="route-map-empty" role="status">
        <div>
          <p className="font-medium text-foreground">Map unavailable</p>
          <p className="mt-1 text-sm text-muted-foreground">
            One or both airports are missing coordinate data.
          </p>
        </div>
      </div>
    );
  }

  const from: [number, number] = [origin.longitude, origin.latitude];
  const to: [number, number] = [destination.longitude, destination.latitude];

  return (
    <div className={`route-map-shell ${compact ? "route-map-compact" : ""}`}>
      <div className="route-map-heading">
        <div>
          <p className="eyebrow">Route geography</p>
          <p className="mt-1 text-sm text-foreground">{label}</p>
        </div>
        <div className="route-map-legend" aria-label="Map legend">
          <span><i className="origin-dot" aria-hidden="true" /> Origin</span>
          <span><i className="destination-dot" aria-hidden="true" /> Destination</span>
        </div>
      </div>
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 1000 }}
        width={800}
        height={500}
        className="route-map-canvas"
        role="img"
        aria-label={`${origin.iataCode} to ${destination.iataCode} route map`}
      >
        <Geographies geography={geography}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="var(--map-land)"
                stroke="var(--map-border)"
                strokeWidth={0.65}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: "var(--map-land-hover)" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
        <ProjectedRouteLine from={from} to={to} />
        <AirportMarker airport={origin} coordinates={from} align="start" kind="origin" />
        <AirportMarker airport={destination} coordinates={to} align="end" kind="destination" />
      </ComposableMap>
      <p className="sr-only">
        A geographic visualization connecting {origin.city}, {origin.stateCode ?? ""} and {destination.city}, {destination.stateCode ?? ""}.
      </p>
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

  if (!start || !end) return null;

  const midX = (start[0] + end[0]) / 2;
  const controlY = Math.min(start[1], end[1]) - Math.max(45, Math.abs(end[0] - start[0]) * 0.15);
  const path = `M ${start[0]} ${start[1]} Q ${midX} ${controlY} ${end[0]} ${end[1]}`;

  return (
    <g>
      <path d={path} fill="none" stroke="var(--route-glow)" strokeWidth={7} opacity={0.18} />
      <path d={path} fill="none" stroke="var(--route-line)" strokeWidth={2.2} strokeLinecap="round" className="route-line-draw" />
    </g>
  );
}

function AirportMarker({
  airport,
  coordinates,
  align,
  kind,
}: {
  airport: AirportPoint;
  coordinates: [number, number];
  align: "start" | "end";
  kind: "origin" | "destination";
}) {
  const textAnchor = align === "start" ? "end" : "start";
  const dx = align === "start" ? -12 : 12;

  return (
    <Marker coordinates={coordinates}>
      <circle r={12} fill="var(--marker-ring)" opacity={0.18} />
      <circle r={5} fill={kind === "origin" ? "var(--positive)" : "var(--primary)"} stroke="var(--map-background)" strokeWidth={2} />
      <text textAnchor={textAnchor} x={dx} y={-8} className="route-map-code">
        {airport.iataCode}
      </text>
      <text textAnchor={textAnchor} x={dx} y={7} className="route-map-city">
        {airport.city}
      </text>
    </Marker>
  );
}
