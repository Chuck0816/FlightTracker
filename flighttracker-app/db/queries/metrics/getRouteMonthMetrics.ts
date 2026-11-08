import pool from "@/db/connection";
import type { RowDataPacket } from "mysql2";

import type { RouteMonthMetric } from "@/types/flights";

type RouteMonthMetricRow = RowDataPacket & {
  month: number;
  yearsObserved: number;
  totalFlights: number;
  avgDeptDelayMinutes: string | null;
  avgArrDelayMinutes: string | null;
  onTimeArrivalRate: string | null;
  cancellationRate: string;
  diversionRate: string;
};

export async function getRouteMonthMetrics(
  routeId: number
): Promise<RouteMonthMetric[]> {
  const [rows] = await pool.query<RouteMonthMetricRow[]>(
    `
      SELECT
        Month AS month,
        YearsObserved AS yearsObserved,
        TotalFlights AS totalFlights,
        AvgDeptDelayMinutes AS avgDeptDelayMinutes,
        AvgArrDelayMinutes AS avgArrDelayMinutes,
        OnTimeArrivalRate AS onTimeArrivalRate,
        CancellationRate AS cancellationRate,
        DiversionRate AS diversionRate
      FROM routemonthmetrics
      WHERE RouteId = ?
      ORDER BY Month
    `,
    [routeId]
  );

  return rows.map((row) => ({
    month: row.month,
    yearsObserved: row.yearsObserved,
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
