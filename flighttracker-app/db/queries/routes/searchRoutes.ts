import pool from "@/db/connection"
import type { RowDataPacket } from "mysql2";
import type { RouteSummary } from "@/types/flights";

type RouteSearchRow = RowDataPacket & {
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

function mapRouteRow(row: RouteSearchRow): RouteSummary {
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

export async function searchRoutes(
    originIataCode: string,
    destinationIataCode: string,
    limit: number
): Promise<RouteSummary[]> {
    const [rows] = await pool.query<RouteSearchRow[]>(
        `
        Select 
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
        From routes As r

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

        WHERE
            UPPER(originAirport.IataCode) = UPPER(?)
            AND UPPER(destinationAirport.IataCode) = UPPER(?)
        
        ORDER BY r.Id ASC
        LIMIT ?
    `,
    [originIataCode, destinationIataCode, limit]
  );
  return rows.map(mapRouteRow); // rows.map((row) => mapRouteRow(row));
}