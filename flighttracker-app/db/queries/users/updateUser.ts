import pool from "@/db/connection";
import type { ResultSetHeader } from "mysql2";

export async function updateUserPassword(
  userId: string,
  passwordHashed: string
) {
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE users SET PasswordHash = ?, UpdatedTimestamp = NOW() WHERE Id = ?",
    [passwordHashed, userId]
  );

  return result.affectedRows;
}