import { getSavedRoutes } from "@/db/queries/routes/getSavedRoutes";
import type { SavedRouteSummary } from "@/types/flights";

export async function getSavedRoutesForUser(
  userId: number
): Promise<SavedRouteSummary[]> {
  const rows = await getSavedRoutes(userId);

  return rows.map((row) => ({
    routeId: row.routeId,
    note: row.note,
    origin: row.origin,
    destination: row.destination,
  }));
}
