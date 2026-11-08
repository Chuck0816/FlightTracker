const ROUTE_SLUG_PATTERN = /^(\d+)$/;

/**
 * Builds a URL slug from a route id.
 * Example: `buildRouteSlug(42)` → `"42"`
 */
export function buildRouteSlug(routeId: number): string {
  return `${routeId}`;
}

/**
 * Parses a `routeId` slug into a route id.
 * Returns null when the slug does not match the expected pattern.
 */
export function parseRouteSlug(slug: string): { routeId: number } | null {
  const match = ROUTE_SLUG_PATTERN.exec(slug);
  if (!match) {
    return null;
  }

  const routeId = Number(match[1]);

  if (!Number.isSafeInteger(routeId) || routeId <= 0) {
    return null;
  }

  return { routeId };
}
