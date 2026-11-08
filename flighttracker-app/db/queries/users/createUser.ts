import pool from '@/db/connection';
import type { ResultSetHeader } from 'mysql2';


export async function createUser(email: string, passwordHashed: string, username: string) {
  const [result] = await pool.query<ResultSetHeader>('INSERT INTO users (UserName, Email, PasswordHash) VALUES (?, ?, ?)', [username, email, passwordHashed]);
  return result?.insertId;
}   
