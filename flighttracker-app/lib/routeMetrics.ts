import { ensureRouteDetails } from "@/db/queries/metrics/ensureRouteDetails";
import { getRouteAirlineMetrics } from "@/db/queries/metrics/getRouteAirlineMetrics";
import { getRouteDelayCauseMetrics } from "@/db/queries/metrics/getRouteDelayCauseMetrics";
import { getRouteFareMetrics } from "@/db/queries/metrics/getRouteFareMetrics";
import { getRouteMetrics } from "@/db/queries/metrics/getRouteMetrics";
import { getRouteMonthMetrics } from "@/db/queries/metrics/getRouteMonthMetrics";
import type { RouteMetricsBundle } from "@/types/flights";

const EMPTY_BUNDLE_FOR_STATUS = (
  status: RouteMetricsBundle["status"]
): RouteMetricsBundle => ({
  status,
  overview: null,
  monthly: [],
  airlines: [],
  delayCauses: [],
  fares: [],
});

export async function getRouteMetricsBundle(
  routeId: number
): Promise<RouteMetricsBundle> {
  const { status } = await ensureRouteDetails(routeId);

  if (status === "NOT_FOUND" || status === "NO_DATA" || status === "ERROR") {
    return EMPTY_BUNDLE_FOR_STATUS(status);
  }

  const [overview, monthly, airlines, delayCauses, fares] = await Promise.all([
    getRouteMetrics(routeId),
    getRouteMonthMetrics(routeId),
    getRouteAirlineMetrics(routeId),
    getRouteDelayCauseMetrics(routeId),
    getRouteFareMetrics(routeId),
  ]);

  return {
    status,
    overview,
    monthly,
    airlines,
    delayCauses,
    fares,
  };
}
