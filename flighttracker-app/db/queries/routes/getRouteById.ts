import pool from "@/db/connection";
import type { RowDataPacket } from "mysql2"; // RowDataPacket: one row from mysql

import type { RouteSummary } from "@/types/flights"; 

type RouteDetailRow = RowDataPacket & {
  id: number;
  distanceMiles: number | null;

  originId: number;
  originIataCode: string;
  originName: string;
  originCity: string;
  originStateCode: string;
  originStateName: string;
  originLatitude: number | null;
  originLongitude: number | null;

  destinationId: number;
  destinationIataCode: string;
  destinationName: string;
  destinationCity: string;
  destinationStateCode: string;
  destinationStateName: string;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
};


export async function getRouteById(
    routeId: number
): Promise<RouteSummary | null> {
    const [rows] = await pool.query<RouteDetailRow[]>( // query returns two values: rows, which contains the data, and fields, which contains the metadata.

        `
        SELECT
        r.Id AS id,
        r.DistanceMiles AS distanceMiles,

        originAirport.Id AS originId,
        originAirport.IataCode AS originIataCode,
        originAirport.Name AS originName,
        originCity.Name AS originCity,
        originState.StateCode AS originStateCode,
        originState.StateName AS originStateName,
        originAirport.Latitude AS originLatitude,
        originAirport.Longitude AS originLongitude,

        destinationAirport.Id AS destinationId,
        destinationAirport.IataCode AS destinationIataCode,
        destinationAirport.Name AS destinationName,
        destinationCity.Name AS destinationCity,
        destinationState.StateCode AS destinationStateCode,
        destinationState.StateName AS destinationStateName,
        destinationAirport.Latitude AS destinationLatitude,
        destinationAirport.Longitude AS destinationLongitude

      FROM routes AS r

      INNER JOIN airports AS originAirport
        ON originAirport.Id = r.OriginAirportId
      INNER JOIN cities AS originCity
        ON originCity.Id = originAirport.CityId
      INNER JOIN states AS originState
        ON originState.StateCode = originCity.StateCode

      INNER JOIN airports AS destinationAirport
        ON destinationAirport.Id = r.DestinationAirportId
      INNER JOIN cities AS destinationCity
        ON destinationCity.Id = destinationAirport.CityId
      INNER JOIN states AS destinationState
        ON destinationState.StateCode = destinationCity.StateCode

      WHERE r.Id = ?
      LIMIT 1
    `,
    [routeId]
    );
    const row = rows[0];
    if (!row) {
        return null;
    }
    return {
        id: row.id,
        distanceMiles:
            row.distanceMiles === null ? null : Number(row.distanceMiles),
        origin: {
            id: row.originId,
            iataCode: row.originIataCode,
            name: row.originName,
            city: row.originCity,
            stateCode: row.originStateCode,
            stateName: row.originStateName,
            latitude:
            row.originLatitude === null
                ? null
                : Number(row.originLatitude),
            longitude:
            row.originLongitude === null
                ? null
                : Number(row.originLongitude),
        },
        destination: {
            id: row.destinationId,
            iataCode: row.destinationIataCode,
            name: row.destinationName,
            city: row.destinationCity,
            stateCode: row.destinationStateCode,
            stateName: row.destinationStateName,
            latitude:
            row.destinationLatitude === null
                ? null
                : Number(row.destinationLatitude),
            longitude:
            row.destinationLongitude === null
                ? null
                : Number(row.destinationLongitude),
        },
    };
}
