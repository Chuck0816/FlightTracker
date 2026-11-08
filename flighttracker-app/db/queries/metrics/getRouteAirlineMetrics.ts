import pool from "@/db/connection";
import type { RowDataPacket } from "mysql2";

import type { RouteAirlineMetric } from "@/types/flights";

type RouteAirlineMetricRow = RowDataPacket & {
  airlineCode: string;
  airlineName: string | null;
  totalFlights: number;
  avgDeptDelayMinutes: string | null;
  avgArrDelayMinutes: string | null;
  onTimeArrivalRate: string | null;
  cancellationRate: string;
  diversionRate: string;
};

export async function getRouteAirlineMetrics(
  routeId: number
): Promise<RouteAirlineMetric[]> {
  const [rows] = await pool.query<RouteAirlineMetricRow[]>(
    `
      SELECT
        AirlineCode AS airlineCode,
        AirlineName AS airlineName,
        TotalFlights AS totalFlights,
        AvgDeptDelayMinutes AS avgDeptDelayMinutes,
        AvgArrDelayMinutes AS avgArrDelayMinutes,
        OnTimeArrivalRate AS onTimeArrivalRate,
        CancellationRate AS cancellationRate,
        DiversionRate AS diversionRate
      FROM routeairlinemetrics
      WHERE RouteId = ?
      ORDER BY OnTimeArrivalRate DESC
    `,
    [routeId]
  );

  return rows.map((row) => ({
    airlineCode: row.airlineCode,
    airlineName: row.airlineName,
    totalFlights: row.totalFlights,
    avgDeptDelayMinutes:
      row.avgDeptDelayMinutes === null ? null : Number(row.avgDeptDelayMinutes),
    avgArrDelayMinutes:
      row.avgArrDelayMinutes === null ? null : Number(row.avgArrDelayMinutes),
    onTimeArrivalRate:
      row.onTimeArrivalRate === null ? null : Number(row.onTimeArrivalRate),
    cancellationRate: Number(row.cancellationRate),
    diversionRate: Number(row.diversionRate),
  }));
}
