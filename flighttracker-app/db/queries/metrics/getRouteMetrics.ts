import pool from "@/db/connection";
import type { RowDataPacket } from "mysql2";

import type { RouteMetricsOverview } from "@/types/flights";

type RouteMetricsRow = RowDataPacket & {
  routeId: number;
  totalFlights: number;
  completedFlights: number;
  avgDeptDelayMinutes: string | null;
  avgArrDelayMinutes: string | null;
  onTimeArrivalRate: string | null;
  cancellationRate: string;
  diversionRate: string;
  firstYearObserved: number | null;
  lastYearObserved: number | null;
  topDelayCauseName: string | null;
  avgMarketFare: string | null;
  computedAt: Date;
};

export async function getRouteMetrics(
  routeId: number
): Promise<RouteMetricsOverview | null> {
  const [rows] = await pool.query<RouteMetricsRow[]>(
    `
      SELECT
        RouteId AS routeId,
        TotalFlights AS totalFlights,
        CompletedFlights AS completedFlights,
        AvgDeptDelayMinutes AS avgDeptDelayMinutes,
        AvgArrDelayMinutes AS avgArrDelayMinutes,
        OnTimeArrivalRate AS onTimeArrivalRate,
        CancellationRate AS cancellationRate,
        DiversionRate AS diversionRate,
        FirstYearObserved AS firstYearObserved,
        LastYearObserved AS lastYearObserved,
        TopDelayCauseName AS topDelayCauseName,
        AvgMarketFare AS avgMarketFare,
        ComputedAt AS computedAt
      FROM routemetrics
      WHERE RouteId = ?
      LIMIT 1
    `,
    [routeId]
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    routeId: row.routeId,
    totalFlights: row.totalFlights,
    completedFlights: row.completedFlights,
    avgDeptDelayMinutes:
      row.avgDeptDelayMinutes === null ? null : Number(row.avgDeptDelayMinutes),
    avgArrDelayMinutes:
      row.avgArrDelayMinutes === null ? null : Number(row.avgArrDelayMinutes),
    onTimeArrivalRate:
      row.onTimeArrivalRate === null ? null : Number(row.onTimeArrivalRate),
    cancellationRate: Number(row.cancellationRate),
    diversionRate: Number(row.diversionRate),
    firstYearObserved: row.firstYearObserved,
    lastYearObserved: row.lastYearObserved,
    topDelayCauseName: row.topDelayCauseName,
    avgMarketFare: row.avgMarketFare === null ? null : Number(row.avgMarketFare),
    computedAt: new Date(row.computedAt).toISOString(),
  };
}
