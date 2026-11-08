import pool from "@/db/connection";
import type { RowDataPacket } from "mysql2";

import type { RouteFareMetric } from "@/types/flights";

type RouteFareMetricRow = RowDataPacket & {
  year: number;
  quarter: number;
  averageFare: string;
  lowestAirlineFare: string | null;
  lowestFareAirlineCode: string | null;
  lowestFareAirlineName: string | null;
};

export async function getRouteFareMetrics(
  routeId: number
): Promise<RouteFareMetric[]> {
  const [rows] = await pool.query<RouteFareMetricRow[]>(
    `
      SELECT
        Year AS year,
        Quarter AS quarter,
        AverageFare AS averageFare,
        LowestAirlineFare AS lowestAirlineFare,
        LowestFareAirlineCode AS lowestFareAirlineCode,
        LowestFareAirlineName AS lowestFareAirlineName
      FROM routefaremetrics
      WHERE RouteId = ?
      ORDER BY Year, Quarter
    `,
    [routeId]
  );

  return rows.map((row) => ({
    year: row.year,
    quarter: row.quarter,
    averageFare: Number(row.averageFare),
    lowestAirlineFare:
      row.lowestAirlineFare === null ? null : Number(row.lowestAirlineFare),
    lowestFareAirlineCode: row.lowestFareAirlineCode,
    lowestFareAirlineName: row.lowestFareAirlineName,
  }));
}
