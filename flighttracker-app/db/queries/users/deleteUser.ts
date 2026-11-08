import pool from "@/db/connection";
import type { ResultSetHeader } from "mysql2";

export async function deleteUser(userId: string) {
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM users WHERE Id = ?",
    [userId]
  );

  return result.affectedRows;
}