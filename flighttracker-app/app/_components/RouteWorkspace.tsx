"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, CircleAlert, Clock3, Plane, Tag } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { RouteMap } from "@/app/_components/RouteMap";
import { SaveRouteControl } from "@/app/_components/SaveRouteControl";
import type {
  AirportSummary,
  ApiError,
  ApiSuccess,
  RouteAirlineMetric,
  RouteDelayCauseMetric,
  RouteFareMetric,
  RouteMetricsBundle,
  RouteMetricsOverview,
  RouteMonthMetric,
} from "@/types/flights";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "monthly", label: "Monthly", icon: CalendarDays },
  { id: "airlines", label: "Airlines", icon: Plane },
  { id: "delays", label: "Delay causes", icon: Clock3 },
  { id: "fares", label: "Fares", icon: Tag },
] as const;

type TabId = (typeof tabs)[number]["id"];
type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; bundle: RouteMetricsBundle };

type RouteData = {
  id: number;
  distanceMiles: number | null;
  origin: AirportSummary;
  destination: AirportSummary;
};

const axisTickStyle = { fill: "var(--muted-foreground)", fontSize: 11 };
const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--popover-foreground)",
  fontSize: "12px",
};

export function RouteWorkspace({
  route,
  initialSaved,
  initialNote,
}: {
  route: RouteData;
  initialSaved: boolean;
  initialNote: string;
}) {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  useEffect(() => {
    let cancelled = false;
    async function loadMetrics() {
      setState({ status: "loading" });
      try {
        const response = await fetch(`/api/routes/${route.id}/metrics`);
        const payload = (await response.json()) as ApiSuccess<RouteMetricsBundle> | ApiError;
        if (cancelled) return;
        if (!response.ok || !payload.success) {
          setState({ status: "error", message: !payload.success ? payload.error : "Failed to load analytics" });
          return;
        }
        setState({ status: "loaded", bundle: payload.data });
      } catch {
        if (!cancelled) setState({ status: "error", message: "Failed to load analytics" });
      }
    }
    loadMetrics();
    return () => { cancelled = true; };
  }, [route.id]);

  const bundle = state.status === "loaded" ? state.bundle : null;
  const overview = bundle?.status === "HIT" || bundle?.status === "COMPUTED" ? bundle.overview : null;

  return (
    <div className="route-workspace">
      <section className="route-primary-grid" aria-labelledby="route-heading">
        <RouteMap origin={route.origin} destination={route.destination} />

        <aside className="route-information-panel">
          <div className="border-b border-border pb-5">
            <p className="eyebrow">Historical route profile</p>
            <h1 id="route-heading" className="mt-2 flex items-center gap-3 font-heading text-3xl font-medium tracking-tight sm:text-4xl">
              <span className="font-mono text-primary">{route.origin.iataCode}</span>
              <span className="text-muted-foreground" aria-hidden="true">→</span>
              <span className="font-mono text-primary">{route.destination.iataCode}</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Historical reliability and market performance for this U.S. domestic corridor.
            </p>
          </div>

          <div className="route-airport-pair">
            <AirportBlock label="Origin" airport={route.origin} />
            <div className="route-airport-connector" aria-hidden="true"><span /></div>
            <AirportBlock label="Destination" airport={route.destination} />
          </div>

          {state.status === "loading" ? (
            <MetricSummarySkeleton />
          ) : state.status === "error" ? (
            <div className="state-message state-message-error" role="alert">
              <CircleAlert className="h-4 w-4" aria-hidden="true" />
              <span>{state.message}</span>
            </div>
          ) : overview ? (
            <MetricSummary overview={overview} distanceMiles={route.distanceMiles} />
          ) : (
            <MetricSummaryEmpty bundle={bundle} distanceMiles={route.distanceMiles} />
          )}

          <div className="mt-auto space-y-3 border-t border-border pt-4">
            <SaveRouteControl routeId={route.id} initialSaved={initialSaved} initialNote={initialNote} />
            <p className="text-center font-mono text-[0.68rem] text-muted-foreground">Route ID {route.id}</p>
          </div>
        </aside>
      </section>

      <section id="analytics" className="analytics-workspace" aria-labelledby="analytics-heading">
        <div className="analytics-heading-row">
          <div>
            <p className="eyebrow">Analytics workspace</p>
            <h2 id="analytics-heading" className="mt-1 font-heading text-xl font-medium sm:text-2xl">
              Reliability, delays, airlines and fares
            </h2>
          </div>
          {overview ? (
            <p className="text-xs text-muted-foreground">
              {overview.firstYearObserved && overview.lastYearObserved
                ? `${overview.firstYearObserved}–${overview.lastYearObserved}`
                : "Historical period"}
              {` · ${overview.totalFlights.toLocaleString()} observed flights`}
            </p>
          ) : null}
        </div>

        <div className="analytics-tabs" role="tablist" aria-label="Route analytics views">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`analytics-panel-${id}`}
              id={`analytics-tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={activeTab === id ? "is-active" : ""}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`analytics-panel-${activeTab}`} aria-labelledby={`analytics-tab-${activeTab}`}>
          <AnalyticsContent state={state} activeTab={activeTab} />
        </div>
      </section>
    </div>
  );
}

function AirportBlock({ label, airport }: { label: string; airport: AirportSummary }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-mono text-xl font-medium text-foreground">{airport.iataCode}</span>
        <span className="text-sm text-muted-foreground">{airport.city}, {airport.stateCode}</span>
      </div>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{airport.name}</p>
    </div>
  );
}

function MetricSummary({ overview, distanceMiles }: { overview: RouteMetricsOverview; distanceMiles: number | null }) {
  const reliability = getReliabilityLabel(overview.onTimeArrivalRate);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Reliability signal</p>
          <p className="mt-1 text-sm text-foreground">{reliability.label}</p>
        </div>
        <span className={`status-badge ${reliability.tone}`}><span aria-hidden="true">●</span> {reliability.label}</span>
      </div>
      <dl className="metric-summary-grid">
        <SummaryMetric label="On-time arrival" value={formatPercent(overview.onTimeArrivalRate)} />
        <SummaryMetric label="Avg departure delay" value={formatMinutes(overview.avgDeptDelayMinutes)} />
        <SummaryMetric label="Avg arrival delay" value={formatMinutes(overview.avgArrDelayMinutes)} />
        <SummaryMetric label="Cancellation rate" value={formatPercent(overview.cancellationRate)} />
        <SummaryMetric label="Observed flights" value={overview.totalFlights.toLocaleString()} />
        <SummaryMetric label="Distance" value={distanceMiles === null ? "—" : `${distanceMiles.toLocaleString()} mi`} />
      </dl>
    </div>
  );
}

function MetricSummaryEmpty({ bundle, distanceMiles }: { bundle: RouteMetricsBundle | null; distanceMiles: number | null }) {
  const message = bundle?.status === "NO_DATA"
    ? "No historical flight records are available for this route yet."
    : bundle?.status === "NOT_FOUND"
      ? "Route analytics were not found."
      : "Analytics are temporarily unavailable.";
  return (
    <div className="space-y-3">
      <div className="state-message" role="status">{message}</div>
      <dl className="metric-summary-grid"><SummaryMetric label="Distance" value={distanceMiles === null ? "—" : `${distanceMiles.toLocaleString()} mi`} /></dl>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}

function MetricSummarySkeleton() {
  return <div className="metric-summary-grid" aria-label="Loading route summary" aria-busy="true">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="metric-skeleton"><span /><strong /></div>)}</div>;
}

function AnalyticsContent({ state, activeTab }: { state: FetchState; activeTab: TabId }) {
  if (state.status === "loading") return <AnalyticsSkeleton />;
  if (state.status === "error") return <AnalyticsState title="Analytics could not be loaded" message={state.message} error />;
  const { bundle } = state;
  if (bundle.status === "NOT_FOUND") return <AnalyticsState title="Route not found" message="No analytics record exists for this route." />;
  if (bundle.status === "NO_DATA") return <AnalyticsState title="No historical data" message="No flight records are available for this route yet." />;
  if (bundle.status === "ERROR") return <AnalyticsState title="Analytics unavailable" message="Metrics could not be computed. Try again later." error />;

  if (activeTab === "overview") return <OverviewPanel bundle={bundle} />;
  if (activeTab === "monthly") return <MonthlyPanel monthly={bundle.monthly} />;
  if (activeTab === "airlines") return <AirlinesPanel airlines={bundle.airlines} />;
  if (activeTab === "delays") return <DelayCausesPanel delayCauses={bundle.delayCauses} />;
  return <FaresPanel fares={bundle.fares} />;
}

function OverviewPanel({ bundle }: { bundle: RouteMetricsBundle }) {
  const overview = bundle.overview;
  return (
    <div className="space-y-5">
      {overview ? (
        <div className="overview-metric-strip">
          <SummaryMetric label="On-time arrival" value={formatPercent(overview.onTimeArrivalRate)} />
          <SummaryMetric label="Avg arrival delay" value={formatMinutes(overview.avgArrDelayMinutes)} />
          <SummaryMetric label="Cancellation rate" value={formatPercent(overview.cancellationRate)} />
          <SummaryMetric label="Average market fare" value={formatCurrency(overview.avgMarketFare)} />
          <SummaryMetric label="Top delay cause" value={overview.topDelayCauseName ?? "—"} />
        </div>
      ) : null}
      <div className="analytics-overview-grid">
        <MonthlyReliabilityChart monthly={bundle.monthly} />
        <DelayCauseSummary delayCauses={bundle.delayCauses} />
        <AirlineQuickCompare airlines={bundle.airlines} />
      </div>
    </div>
  );
}

function MonthlyPanel({ monthly }: { monthly: RouteMonthMetric[] }) {
  if (monthly.length === 0) return <AnalyticsState title="No monthly data" message="Monthly seasonality metrics are unavailable." />;
  return <div className="analytics-two-column"><MonthlyReliabilityChart monthly={monthly} /><MonthlyDelayChart monthly={monthly} /></div>;
}

function MonthlyReliabilityChart({ monthly }: { monthly: RouteMonthMetric[] }) {
  const data = useMemo(() => monthly.map((row) => ({ month: MONTH_LABELS[row.month - 1] ?? String(row.month), onTimeRate: row.onTimeArrivalRate === null ? null : row.onTimeArrivalRate * 100 })), [monthly]);
  if (monthly.length === 0) return <AnalyticsState title="Reliability by month" message="No monthly reliability data." compact />;
  return (
    <figure className="analytics-figure">
      <figcaption><span>Monthly reliability</span><small>On-time arrival rate</small></figcaption>
      <div className="chart-frame" role="img" aria-label="Line chart of on-time arrival rate by month">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 12, right: 14, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis dataKey="month" tick={axisTickStyle} tickLine={false} axisLine={false} />
            <YAxis tick={axisTickStyle} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1)}%`, "On-time arrival"]} />
            <Line type="monotone" dataKey="onTimeRate" stroke="var(--chart-1)" strokeWidth={2.2} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

function MonthlyDelayChart({ monthly }: { monthly: RouteMonthMetric[] }) {
  const data = monthly.map((row) => ({ month: MONTH_LABELS[row.month - 1] ?? String(row.month), departure: row.avgDeptDelayMinutes, arrival: row.avgArrDelayMinutes }));
  return (
    <figure className="analytics-figure">
      <figcaption><span>Average delay by month</span><small>Minutes · departure vs. arrival</small></figcaption>
      <div className="chart-frame" role="img" aria-label="Line chart comparing departure and arrival delay by month">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 12, right: 14, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis dataKey="month" tick={axisTickStyle} tickLine={false} axisLine={false} />
            <YAxis tick={axisTickStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}m`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${Number(value).toFixed(1)} min`, String(name)]} />
            <Line type="monotone" dataKey="departure" name="Departure" stroke="var(--chart-2)" strokeWidth={2} dot={false} connectNulls />
            <Line type="monotone" dataKey="arrival" name="Arrival" stroke="var(--chart-1)" strokeWidth={2} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-legend"><span><i className="chart-key chart-key-primary" /> Arrival</span><span><i className="chart-key chart-key-secondary" /> Departure</span></div>
    </figure>
  );
}

function AirlineQuickCompare({ airlines }: { airlines: RouteAirlineMetric[] }) {
  if (airlines.length === 0) return <AnalyticsState title="Airline comparison" message="No airline-level data." compact />;
  const ranked = [...airlines].sort((a, b) => (b.onTimeArrivalRate ?? 0) - (a.onTimeArrivalRate ?? 0)).slice(0, 5);
  return (
    <section className="analytics-figure"><div className="section-caption"><span>Airline comparison</span><small>Ranked by on-time arrival</small></div><div className="quick-ranking">{ranked.map((row, index) => <div key={row.airlineCode}><span className="rank-number">{index + 1}</span><span><strong>{row.airlineCode}</strong><small>{row.airlineName ?? "Carrier"}</small></span><b>{formatPercent(row.onTimeArrivalRate)}</b></div>)}</div></section>
  );
}

function DelayCauseSummary({ delayCauses }: { delayCauses: RouteDelayCauseMetric[] }) {
  if (delayCauses.length === 0) return <AnalyticsState title="Delay causes" message="No delay cause data." compact />;
  const max = Math.max(...delayCauses.map((row) => row.totalDelayMinutes), 1);
  return (
    <section className="analytics-figure"><div className="section-caption"><span>Delay causes</span><small>Total attributed delay minutes</small></div><div className="cause-list">{delayCauses.slice(0, 5).map((row) => <div key={row.delayCauseCode}><span>{row.delayCauseName ?? row.delayCauseCode}</span><i><b style={{ width: `${Math.max(4, (row.totalDelayMinutes / max) * 100)}%` }} /></i><strong>{row.totalDelayMinutes.toLocaleString()}</strong></div>)}</div></section>
  );
}

function AirlinesPanel({ airlines }: { airlines: RouteAirlineMetric[] }) {
  if (airlines.length === 0) return <AnalyticsState title="No airline data" message="No airline-level metrics are available." />;
  const data = airlines.map((row) => ({ airline: row.airlineCode, onTimeRate: (row.onTimeArrivalRate ?? 0) * 100 }));
  return <div className="space-y-5"><figure className="analytics-figure"><figcaption><span>On-time arrival by airline</span><small>Percentage of completed flights</small></figcaption><div className="chart-frame" role="img" aria-label="Bar chart comparing airline on-time arrival rates"><ResponsiveContainer width="100%" height={250}><BarChart data={data} margin={{ top: 12, right: 14, left: -10, bottom: 0 }}><CartesianGrid vertical={false} stroke="var(--chart-grid)" /><XAxis dataKey="airline" tick={axisTickStyle} tickLine={false} axisLine={false} /><YAxis tick={axisTickStyle} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1)}%`, "On-time arrival"]} /><Bar dataKey="onTimeRate" fill="var(--chart-1)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></figure><AirlineTable airlines={airlines} /></div>;
}

function AirlineTable({ airlines }: { airlines: RouteAirlineMetric[] }) {
  return <div className="data-table-wrap"><table className="data-table"><caption className="sr-only">Detailed airline reliability comparison</caption><thead><tr><th>Airline</th><th>Flights</th><th>On-time</th><th>Dept delay</th><th>Arr delay</th><th>Cancelled</th><th>Diverted</th></tr></thead><tbody>{airlines.map((row) => <tr key={row.airlineCode}><td><strong>{row.airlineCode}</strong><span>{row.airlineName ?? ""}</span></td><td>{row.totalFlights.toLocaleString()}</td><td>{formatPercent(row.onTimeArrivalRate)}</td><td>{formatMinutes(row.avgDeptDelayMinutes)}</td><td>{formatMinutes(row.avgArrDelayMinutes)}</td><td>{formatPercent(row.cancellationRate)}</td><td>{formatPercent(row.diversionRate)}</td></tr>)}</tbody></table></div>;
}

function DelayCausesPanel({ delayCauses }: { delayCauses: RouteDelayCauseMetric[] }) {
  if (delayCauses.length === 0) return <AnalyticsState title="No delay causes" message="No delay cause metrics are available." />;
  const data = delayCauses.map((row) => ({ cause: row.delayCauseName ?? row.delayCauseCode, totalDelayMinutes: row.totalDelayMinutes }));
  return <div className="space-y-5"><figure className="analytics-figure"><figcaption><span>Delay cause impact</span><small>Total attributed delay minutes</small></figcaption><div className="chart-frame" role="img" aria-label="Bar chart of total delay minutes by cause"><ResponsiveContainer width="100%" height={270}><BarChart data={data} margin={{ top: 12, right: 14, left: 0, bottom: 28 }}><CartesianGrid vertical={false} stroke="var(--chart-grid)" /><XAxis dataKey="cause" tick={axisTickStyle} tickLine={false} axisLine={false} interval={0} angle={-18} textAnchor="end" height={55} /><YAxis tick={axisTickStyle} tickLine={false} axisLine={false} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toLocaleString()} min`, "Total delay"]} /><Bar dataKey="totalDelayMinutes" fill="var(--warning)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></figure><div className="data-table-wrap"><table className="data-table"><caption className="sr-only">Delay cause details</caption><thead><tr><th>Cause</th><th>Delayed flights</th><th>Total delay</th><th>Average delay</th></tr></thead><tbody>{delayCauses.map((row) => <tr key={row.delayCauseCode}><td><strong>{row.delayCauseName ?? row.delayCauseCode}</strong></td><td>{row.delayedFlights.toLocaleString()}</td><td>{row.totalDelayMinutes.toLocaleString()} min</td><td>{formatMinutes(row.avgDelayMinutes)}</td></tr>)}</tbody></table></div></div>;
}

function FaresPanel({ fares }: { fares: RouteFareMetric[] }) {
  if (fares.length === 0) return <AnalyticsState title="No fare history" message="Fare analytics are unavailable for this route." />;
  const data = fares.map((row) => ({ period: `${row.year} Q${row.quarter}`, averageFare: row.averageFare, lowestAirlineFare: row.lowestAirlineFare }));
  return <div className="space-y-5"><figure className="analytics-figure"><figcaption><span>Historical fare trend</span><small>Average market and lowest airline fare</small></figcaption><div className="chart-frame" role="img" aria-label="Line chart showing fare history by quarter"><ResponsiveContainer width="100%" height={270}><LineChart data={data} margin={{ top: 12, right: 14, left: -8, bottom: 0 }}><CartesianGrid vertical={false} stroke="var(--chart-grid)" /><XAxis dataKey="period" tick={axisTickStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" /><YAxis tick={axisTickStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} /><Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`$${Number(value).toFixed(0)}`, String(name)]} /><Line type="monotone" dataKey="averageFare" name="Average fare" stroke="var(--chart-1)" strokeWidth={2.2} dot={false} /><Line type="monotone" dataKey="lowestAirlineFare" name="Lowest airline fare" stroke="var(--chart-2)" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls /></LineChart></ResponsiveContainer></div><div className="chart-legend"><span><i className="chart-key chart-key-primary" /> Average fare</span><span><i className="chart-key chart-key-secondary" /> Lowest airline fare</span></div></figure><div className="data-table-wrap"><table className="data-table"><caption className="sr-only">Historical fare details</caption><thead><tr><th>Period</th><th>Average fare</th><th>Lowest fare</th><th>Lowest fare airline</th></tr></thead><tbody>{fares.map((row) => <tr key={`${row.year}-${row.quarter}`}><td><strong>{row.year} Q{row.quarter}</strong></td><td>{formatCurrency(row.averageFare)}</td><td>{formatCurrency(row.lowestAirlineFare)}</td><td>{row.lowestFareAirlineName ?? row.lowestFareAirlineCode ?? "—"}</td></tr>)}</tbody></table></div></div>;
}

function AnalyticsSkeleton() {
  return <div className="analytics-skeleton" aria-label="Loading route analytics" aria-busy="true"><div /><div /><div /></div>;
}

function AnalyticsState({ title, message, error = false, compact = false }: { title: string; message: string; error?: boolean; compact?: boolean }) {
  return <div className={`analytics-state ${compact ? "is-compact" : ""}`} role={error ? "alert" : "status"}>{error ? <CircleAlert className="h-5 w-5 text-destructive" aria-hidden="true" /> : <BarChart3 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}<div><p className="font-medium text-foreground">{title}</p><p className="mt-1 text-sm text-muted-foreground">{message}</p></div></div>;
}

function getReliabilityLabel(rate: number | null) {
  if (rate === null) return { label: "Unknown", tone: "status-neutral" };
  if (rate >= 0.8) return { label: "Strong", tone: "status-positive" };
  if (rate >= 0.65) return { label: "Mixed", tone: "status-warning" };
  return { label: "Higher disruption", tone: "status-negative" };
}

function formatPercent(value: number | null): string { return value === null ? "—" : `${(value * 100).toFixed(1)}%`; }
function formatMinutes(value: number | null): string { return value === null ? "—" : `${value.toFixed(1)} min`; }
function formatCurrency(value: number | null): string { return value === null ? "—" : `$${value.toFixed(0)}`; }
