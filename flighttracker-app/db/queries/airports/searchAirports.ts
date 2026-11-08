import pool from "@/db/connection";
import type { RowDataPacket } from "mysql2";
import type {AirportSummary} from "@/types/flights";

type AirportSearchRow = RowDataPacket & {
    id: number;
    iataCode: string;
    name: string;
    city: string;
    stateCode: string;
    stateName: string;
    latitude: number | null;
    longitude: number | null
};

export async function searchAirports(
    keyword: string,
    limit: number
): Promise<AirportSummary[]> { // promise return a AirportSummary[] dict
    const normalizedKeyword = keyword.trim()
    const likeKeyword = `%${normalizedKeyword}%`; // % means any chars
    const [rows] = await pool.query<AirportSearchRow[]>(
    `
        SELECT
        a.Id AS id,
        a.IataCode AS iataCode,
        a.Name AS name,
        c.Name AS city,
        s.StateCode AS stateCode,
        s.StateName AS stateName,
        a.Latitude AS latitude,
        a.Longitude AS longitude
      FROM airports AS a
      INNER JOIN cities AS c
        ON c.Id = a.CityId
      INNER JOIN states AS s
        ON s.StateCode = c.StateCode
      WHERE
        UPPER(a.IataCode) = UPPER(?)
        OR LOWER(a.IataCode) LIKE LOWER(?)
        OR LOWER(a.Name) LIKE LOWER(?)
        OR LOWER(c.Name) LIKE LOWER(?)
        OR LOWER(s.StateCode) LIKE LOWER(?)
        OR LOWER(s.StateName) LIKE LOWER(?)
      ORDER BY
        CASE
          WHEN UPPER(a.IataCode) = UPPER(?) THEN 0 
          WHEN UPPER(a.IataCode) LIKE CONCAT(UPPER(?), '%') THEN 1
          WHEN LOWER(c.Name) = LOWER(?) THEN 2
          WHEN LOWER(a.Name) LIKE CONCAT(LOWER(?), '%') THEN 3
          ELSE 4
        END,
        a.IataCode ASC
      LIMIT ?
    `,
    [ // pass these parameters into ? above
      normalizedKeyword,
      likeKeyword,
      likeKeyword,
      likeKeyword,
      likeKeyword,
      likeKeyword,
      normalizedKeyword,
      normalizedKeyword,
      normalizedKeyword,
      normalizedKeyword,
      limit,
    ]
  );


  return rows.map((row) => ({ 
// It applies the same transformation 
// to every element in the array and returns a new array
    id: row.id,
    iataCode: row.iataCode,
    name: row.name,
    city: row.city,
    stateCode: row.stateCode,
    stateName: row.stateName,
    latitude:
      row.latitude === null ? null : Number(row.latitude),
    longitude:
      row.longitude === null ? null : Number(row.longitude),
  }));
}

/*
AirportSummary: Used for API endpoints
AirportSearchRow: Result from Mysql
*/

    
  
  
  
  
  
  
  
  
