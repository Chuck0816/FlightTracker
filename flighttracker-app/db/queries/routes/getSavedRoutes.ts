import pool from "@/db/connection";
import type { RowDataPacket } from "mysql2";

export type SavedRouteRow = RowDataPacket & {
  routeId: number;
  note: string | null;
  origin: string;
  destination: string;
};

export async function getSavedRoutes(userId: number) {
  const [rows] = await pool.query<SavedRouteRow[]>(
    `SELECT
       s.RouteId AS routeId,
       s.Note AS note,
       o.IataCode AS origin,
       d.IataCode AS destination
     FROM savedroutes AS s
     JOIN routes AS r ON r.Id = s.RouteId
     JOIN airports AS o ON o.Id = r.OriginAirportId
     JOIN airports AS d ON d.Id = r.DestinationAirportId
     WHERE s.UserId = ?`,
    [userId]
  );

  return rows;
}
