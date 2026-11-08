import pool from '@/db/connection';
import type { ResultSetHeader } from 'mysql2';


export async function newSavedRoute(UserId: number, RouteId: number, Note: string) {
  const [result] = await pool.query<ResultSetHeader>('INSERT INTO savedroutes (UserId, RouteId, Note) VALUES (?, ?, ?)', [UserId, RouteId, Note]);
  return result;
}
