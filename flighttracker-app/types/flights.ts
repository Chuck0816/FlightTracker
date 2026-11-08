export type AirportSummary = {
  id: number;
  iataCode: string;
  name: string;
  city: string;
  stateCode: string;
  stateName: string;
  latitude: number | null;
  longitude: number | null;
};


export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type RouteSummary = {
  id: number;
  distanceMiles: number | null;
  origin: AirportSummary;
  destination: AirportSummary;
};

export type ApiError = {
  success: false;
  error: string;
};

export type SavedRouteSummary = {
  routeId: number;
  note: string | null;
  origin: string;
  destination: string;
};

export type RouteCacheStatus =
  | "HIT"
  | "COMPUTED"
  | "NOT_FOUND"
  | "NO_DATA"
  | "ERROR";

export type RouteMetricsOverview = {
  routeId: number;
  totalFlights: number;
  completedFlights: number;
  avgDeptDelayMinutes: number | null;
  avgArrDelayMinutes: number | null;
  onTimeArrivalRate: number | null;
  cancellationRate: number;
  diversionRate: number;
  firstYearObserved: number | null;
  lastYearObserved: number | null;
  topDelayCauseName: string | null;
  avgMarketFare: number | null;
  computedAt: string;
};

export type RouteMonthMetric = {
  month: number;
  yearsObserved: number;
  totalFlights: number;
  avgDeptDelayMinutes: number | null;
  avgArrDelayMinutes: number | null;
  onTimeArrivalRate: number | null;
  cancellationRate: number;
  diversionRate: number;
};

export type RouteAirlineMetric = {
  airlineCode: string;
  airlineName: string | null;
  totalFlights: number;
  avgDeptDelayMinutes: number | null;
  avgArrDelayMinutes: number | null;
  onTimeArrivalRate: number | null;
  cancellationRate: number;
  diversionRate: number;
};

export type RouteDelayCauseMetric = {
  delayCauseCode: string;
  delayCauseName: string | null;
  delayedFlights: number;
  totalDelayMinutes: number;
  avgDelayMinutes: number | null;
};

export type RouteFareMetric = {
  year: number;
  quarter: number;
  averageFare: number;
  lowestAirlineFare: number | null;
  lowestFareAirlineCode: string | null;
  lowestFareAirlineName: string | null;
};

export type RouteMetricsBundle = {
  status: RouteCacheStatus;
  overview: RouteMetricsOverview | null;
  monthly: RouteMonthMetric[];
  airlines: RouteAirlineMetric[];
  delayCauses: RouteDelayCauseMetric[];
  fares: RouteFareMetric[];
};