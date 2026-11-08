import pool from "@/db/connection";
import type { RowDataPacket } from "mysql2";

import type { RouteDelayCauseMetric } from "@/types/flights";

type RouteDelayCauseMetricRow = RowDataPacket & {
  delayCauseCode: string;
  delayCauseName: string | null;
  delayedFlights: number;
  totalDelayMinutes: string | number;
  avgDelayMinutes: string | null;
};

export async function getRouteDelayCauseMetrics(
  routeId: number
): Promise<RouteDelayCauseMetric[]> {
  const [rows] = await pool.query<RouteDelayCauseMetricRow[]>(
    `
      SELECT
        DelayCauseCode AS delayCauseCode,
        DelayCauseName AS delayCauseName,
        DelayedFlights AS delayedFlights,
        TotalDelayMinutes AS totalDelayMinutes,
        AvgDelayMinutes AS avgDelayMinutes
      FROM routedelaycausemetrics
      WHERE RouteId = ?
      ORDER BY TotalDelayMinutes DESC
    `,
    [routeId]
  );

  return rows.map((row) => ({
    delayCauseCode: row.delayCauseCode,
    delayCauseName: row.delayCauseName,
    delayedFlights: row.delayedFlights,
    totalDelayMinutes: Number(row.totalDelayMinutes),
    avgDelayMinutes: row.avgDelayMinutes === null ? null : Number(row.avgDelayMinutes),
  }));
}
