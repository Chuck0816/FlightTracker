"use client";

import { useEffect, useState } from "react";
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

import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type {
  ApiError,
  ApiSuccess,
  RouteAirlineMetric,
  RouteDelayCauseMetric,
  RouteFareMetric,
  RouteMetricsBundle,
  RouteMetricsOverview,
  RouteMonthMetric,
} from "@/types/flights";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const tooltipContentStyle = {
  backgroundColor: "var(--popover)",
  borderColor: "var(--border)",
  borderRadius: "var(--radius-md)",
  fontSize: "0.75rem",
  color: "var(--popover-foreground)",
};

const tooltipLabelStyle = { color: "var(--muted-foreground)" };
const axisTickStyle = { fill: "var(--muted-foreground)", fontSize: 11 };

function formatPercent(value: number | null): string {
  if (value === null) {
    return "—";
  }
  return `${(value * 100).toFixed(1)}%`;
}

function formatMinutes(value: number | null): string {
  if (value === null) {
    return "—";
  }
  return `${value.toFixed(1)} min`;
}

function formatCurrency(value: number | null): string {
  if (value === null) {
    return "—";
  }
  return `$${value.toFixed(0)}`;
}

type RouteAnalyticsProps = {
  routeId: number;
};

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; bundle: RouteMetricsBundle };

export function RouteAnalytics({ routeId }: RouteAnalyticsProps) {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function loadMetrics() {
      setState({ status: "loading" });
      try {
        const response = await fetch(`/api/routes/${routeId}/metrics`);
        const payload = (await response.json()) as
          | ApiSuccess<RouteMetricsBundle>
          | ApiError;

        if (cancelled) {
          return;
        }

        if (!response.ok || !payload.success) {
          setState({
            status: "error",
            message: !payload.success
              ? payload.error
              : "Failed to load analytics",
          });
          return;
        }

        setState({ status: "loaded", bundle: payload.data });
      } catch {
        if (!cancelled) {
          setState({
            status: "error",
            message: "Failed to load analytics",
          });
        }
      }
    }

    loadMetrics();

    return () => {
      cancelled = true;
    };
  }, [routeId]);

  if (state.status === "loading") {
    return <AnalyticsPlaceholder message="Computing analytics…" pulse />;
  }

  if (state.status === "error") {
    return <AnalyticsPlaceholder message={state.message} />;
  }

  const { bundle } = state;

  if (bundle.status === "NOT_FOUND") {
    return <AnalyticsPlaceholder message="Route not found." />;
  }

  if (bundle.status === "NO_DATA") {
    return (
      <AnalyticsPlaceholder message="No flight records are available for this route yet." />
    );
  }

  if (bundle.status === "ERROR") {
    return (
      <AnalyticsPlaceholder message="Analytics could not be computed for this route. Try again later." />
    );
  }

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="airlines">Airlines</TabsTrigger>
        <TabsTrigger value="delays">Delay causes</TabsTrigger>
        <TabsTrigger value="fares">Fares</TabsTrigger>
      </TabsList>

      <TabsPanel value="overview">
        <OverviewPanel overview={bundle.overview} />
      </TabsPanel>
      <TabsPanel value="monthly">
        <MonthlyPanel monthly={bundle.monthly} />
      </TabsPanel>
      <TabsPanel value="airlines">
        <AirlinesPanel airlines={bundle.airlines} />
      </TabsPanel>
      <TabsPanel value="delays">
        <DelayCausesPanel delayCauses={bundle.delayCauses} />
      </TabsPanel>
      <TabsPanel value="fares">
        <FaresPanel fares={bundle.fares} />
      </TabsPanel>
    </Tabs>
  );
}

function AnalyticsPlaceholder({
  message,
  pulse = false,
}: {
  message: string;
  pulse?: boolean;
}) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border/70 bg-background/30 px-4 py-10 text-center">
      <div className={cn("space-y-2", pulse && "animate-pulse")}>
        <p className="font-mono text-[0.7rem] tracking-[0.25em] text-amber-400/80 uppercase">
          Analytics
        </p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border/70 bg-background/30 px-4 py-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
      <p className="font-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg font-medium tracking-wide text-amber-400">
        {value}
      </p>
    </div>
  );
}

function OverviewPanel({
  overview,
}: {
  overview: RouteMetricsOverview | null;
}) {
  if (!overview) {
    return <EmptyPanel message="No overview metrics available." />;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        <StatCard
          label="On-time arrival"
          value={formatPercent(overview.onTimeArrivalRate)}
        />
        <StatCard
          label="Avg departure delay"
          value={formatMinutes(overview.avgDeptDelayMinutes)}
        />
        <StatCard
          label="Avg arrival delay"
          value={formatMinutes(overview.avgArrDelayMinutes)}
        />
        <StatCard
          label="Cancellation rate"
          value={formatPercent(overview.cancellationRate)}
        />
        <StatCard
          label="Diversion rate"
          value={formatPercent(overview.diversionRate)}
        />
        <StatCard
          label="Total flights"
          value={overview.totalFlights.toLocaleString()}
        />
        <StatCard
          label="Avg market fare"
          value={formatCurrency(overview.avgMarketFare)}
        />
        <StatCard
          label="Years observed"
          value={
            overview.firstYearObserved && overview.lastYearObserved
              ? `${overview.firstYearObserved}–${overview.lastYearObserved}`
              : "—"
          }
        />
      </div>
      {overview.topDelayCauseName ? (
        <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
          <p className="font-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">
            Top delay cause
          </p>
          <p className="mt-1 text-sm text-foreground">
            {overview.topDelayCauseName}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function MonthlyPanel({ monthly }: { monthly: RouteMonthMetric[] }) {
  if (monthly.length === 0) {
    return <EmptyPanel message="No monthly seasonality data available." />;
  }

  const chartData = monthly.map((row) => ({
    month: MONTH_LABELS[row.month - 1] ?? String(row.month),
    onTimeRate:
      row.onTimeArrivalRate === null ? null : row.onTimeArrivalRate * 100,
    avgDeptDelay: row.avgDeptDelayMinutes,
    avgArrDelay: row.avgArrDelayMinutes,
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 font-mono text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
          On-time arrival rate by month
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={axisTickStyle} />
            <YAxis
              tick={axisTickStyle}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={tooltipContentStyle}
              labelStyle={tooltipLabelStyle}
              formatter={(value) => [`${Number(value).toFixed(1)}%`, "On-time rate"]}
            />
            <Line
              type="monotone"
              dataKey="onTimeRate"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <p className="mb-2 font-mono text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
          Average delay by month
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={axisTickStyle} />
            <YAxis
              tick={axisTickStyle}
              tickFormatter={(value) => `${value}m`}
            />
            <Tooltip
              contentStyle={tooltipContentStyle}
              labelStyle={tooltipLabelStyle}
              formatter={(value, name) => [
                `${Number(value).toFixed(1)} min`,
                String(name),
              ]}
            />
            <Line
              type="monotone"
              dataKey="avgDeptDelay"
              name="Departure"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="avgArrDelay"
              name="Arrival"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AirlinesPanel({ airlines }: { airlines: RouteAirlineMetric[] }) {
  if (airlines.length === 0) {
    return <EmptyPanel message="No airline-level data available." />;
  }

  const chartData = airlines.map((row) => ({
    airline: row.airlineCode,
    onTimeRate:
      row.onTimeArrivalRate === null ? 0 : row.onTimeArrivalRate * 100,
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="airline" tick={axisTickStyle} />
          <YAxis
            tick={axisTickStyle}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={tooltipContentStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value) => [`${Number(value).toFixed(1)}%`, "On-time rate"]}
          />
          <Bar dataKey="onTimeRate" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="overflow-x-auto rounded-lg border border-border/60">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-background/40 font-mono text-[0.6rem] tracking-[0.15em] text-muted-foreground uppercase">
              <th className="px-3 py-2">Airline</th>
              <th className="px-3 py-2">Flights</th>
              <th className="px-3 py-2">On-time</th>
              <th className="px-3 py-2">Avg dept delay</th>
              <th className="px-3 py-2">Avg arr delay</th>
              <th className="px-3 py-2">Cancelled</th>
              <th className="px-3 py-2">Diverted</th>
            </tr>
          </thead>
          <tbody>
            {airlines.map((row) => (
              <tr
                key={row.airlineCode}
                className="border-b border-border/40 last:border-0 hover:bg-background/40"
              >
                <td className="px-3 py-2 text-foreground">
                  <span className="font-mono text-amber-400">
                    {row.airlineCode}
                  </span>
                  {row.airlineName ? (
                    <span className="text-muted-foreground"> · {row.airlineName}</span>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-foreground">
                  {row.totalFlights.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-foreground">
                  {formatPercent(row.onTimeArrivalRate)}
                </td>
                <td className="px-3 py-2 text-foreground">
                  {formatMinutes(row.avgDeptDelayMinutes)}
                </td>
                <td className="px-3 py-2 text-foreground">
                  {formatMinutes(row.avgArrDelayMinutes)}
                </td>
                <td className="px-3 py-2 text-foreground">
                  {formatPercent(row.cancellationRate)}
                </td>
                <td className="px-3 py-2 text-foreground">
                  {formatPercent(row.diversionRate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DelayCausesPanel({
  delayCauses,
}: {
  delayCauses: RouteDelayCauseMetric[];
}) {
  if (delayCauses.length === 0) {
    return <EmptyPanel message="No delay cause data available." />;
  }

  const chartData = delayCauses.map((row) => ({
    cause: row.delayCauseName ?? row.delayCauseCode,
    totalDelayMinutes: row.totalDelayMinutes,
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="cause" tick={axisTickStyle} interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis tick={axisTickStyle} />
          <Tooltip
            contentStyle={tooltipContentStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value) => [
              `${Number(value).toLocaleString()} min`,
              "Total delay",
            ]}
          />
          <Bar dataKey="totalDelayMinutes" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="overflow-x-auto rounded-lg border border-border/60">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-background/40 font-mono text-[0.6rem] tracking-[0.15em] text-muted-foreground uppercase">
              <th className="px-3 py-2">Cause</th>
              <th className="px-3 py-2">Delayed flights</th>
              <th className="px-3 py-2">Total delay</th>
              <th className="px-3 py-2">Avg delay</th>
            </tr>
          </thead>
          <tbody>
            {delayCauses.map((row) => (
              <tr
                key={row.delayCauseCode}
                className="border-b border-border/40 last:border-0 hover:bg-background/40"
              >
                <td className="px-3 py-2 text-foreground">
                  {row.delayCauseName ?? row.delayCauseCode}
                </td>
                <td className="px-3 py-2 text-foreground">
                  {row.delayedFlights.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-foreground">
                  {row.totalDelayMinutes.toLocaleString()} min
                </td>
                <td className="px-3 py-2 text-foreground">
                  {formatMinutes(row.avgDelayMinutes)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FaresPanel({ fares }: { fares: RouteFareMetric[] }) {
  if (fares.length === 0) {
    return <EmptyPanel message="No fare data available for this route." />;
  }

  const chartData = fares.map((row) => ({
    period: `${row.year} Q${row.quarter}`,
    averageFare: row.averageFare,
    lowestAirlineFare: row.lowestAirlineFare,
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="period" tick={axisTickStyle} interval="preserveStartEnd" />
          <YAxis tick={axisTickStyle} tickFormatter={(value) => `$${value}`} />
          <Tooltip
            contentStyle={tooltipContentStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value, name) => [`$${Number(value).toFixed(0)}`, String(name)]}
          />
          <Line
            type="monotone"
            dataKey="averageFare"
            name="Average fare"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="lowestAirlineFare"
            name="Lowest airline fare"
            stroke="var(--chart-2)"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="overflow-x-auto rounded-lg border border-border/60">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-background/40 font-mono text-[0.6rem] tracking-[0.15em] text-muted-foreground uppercase">
              <th className="px-3 py-2">Period</th>
              <th className="px-3 py-2">Average fare</th>
              <th className="px-3 py-2">Lowest fare</th>
              <th className="px-3 py-2">Lowest fare airline</th>
            </tr>
          </thead>
          <tbody>
            {fares.map((row) => (
              <tr
                key={`${row.year}-${row.quarter}`}
                className="border-b border-border/40 last:border-0 hover:bg-background/40"
              >
                <td className="px-3 py-2 text-foreground">
                  {row.year} Q{row.quarter}
                </td>
                <td className="px-3 py-2 text-foreground">
                  {formatCurrency(row.averageFare)}
                </td>
                <td className="px-3 py-2 text-foreground">
                  {formatCurrency(row.lowestAirlineFare)}
                </td>
                <td className="px-3 py-2 text-foreground">
                  {row.lowestFareAirlineName ?? row.lowestFareAirlineCode ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
