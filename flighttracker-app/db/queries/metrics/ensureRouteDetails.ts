import pool from "@/db/connection";
import type { ProcedureCallPacket, RowDataPacket } from "mysql2";

import type { RouteCacheStatus } from "@/types/flights";

type RouteCacheStatusRow = RowDataPacket & {
  RouteId: number;
  CacheStatus: RouteCacheStatus;
  ComputedAt: Date | null;
};

export type RouteDetailsCacheResult = {
  routeId: number;
  status: RouteCacheStatus;
  computedAt: string | null;
};

export async function ensureRouteDetails(
  routeId: number
): Promise<RouteDetailsCacheResult> {
  const [results] = await pool.query<
    ProcedureCallPacket<RouteCacheStatusRow[]>
  >("CALL GetOrCreateRouteDetails(?)", [routeId]);

  const [rows] = results;
  const row = rows[0];

  if (!row) {
    throw new Error("GetOrCreateRouteDetails returned no rows");
  }

  return {
    routeId: row.RouteId,
    status: row.CacheStatus,
    computedAt: row.ComputedAt ? new Date(row.ComputedAt).toISOString() : null,
  };
}
