import pool from '@/db/connection';
import type { ResultSetHeader } from 'mysql2';


export async function deleteSavedRoute(UserId: number, RouteId: number) {
  const [result] = await pool.query<ResultSetHeader>('DELETE FROM savedroutes WHERE UserId = ? AND RouteId = ?', [UserId, RouteId]);
  return result;
}   
