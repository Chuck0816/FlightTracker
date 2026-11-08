import pool from '@/db/connection';
import type { RowDataPacket } from 'mysql2';

export async function authenticateUser(email: string) {
  const [result] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM users WHERE Email = ? LIMIT 1",
    [email]
  );

  return result?.[0] ?? null;
}

export async function checkUserExists(email: string) {
  const [result] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM users WHERE Email = ? LIMIT 1",
    [email]
  );

  return result.length > 0;
}
