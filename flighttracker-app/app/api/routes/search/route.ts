import { NextResponse } from "next/server";

import { searchRoutes } from "@/db/queries/routes/searchRoutes";
import type {
  ApiError,
  ApiSuccess,
  RouteSummary,
} from "@/types/flights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 10;

const MAX_LIMIT = 20;

const IATA_CODE_PATTERN = /^[A-Za-z]{3}$/;
// Define a JavaScript regular expression. 
// [A-Za-z] matches an uppercase or lowercase letter, 
// and {3} requires exactly three letters.

function parseLimit(value: string | null): number {
  if (value === null) {
    return DEFAULT_LIMIT;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsed, MAX_LIMIT);
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const origin = // GET /api/routes?origin=ORD&destination=LAX&limit=10, limit=10: max 10 rows can be returned. 
          url.searchParams.get("origin") // return ord, otherwise null
          ?.trim() // ? means only execute when not null
          .toUpperCase()??""; // if null, use empty string as default value. 
        const destination = url.searchParams.get("destination")?.trim().toUpperCase() ?? "";

        const limit = parseLimit(url.searchParams.get("limit"));

        if (!IATA_CODE_PATTERN.test(origin)) { 
        // Use JavaScript's regular expression test method to check whether the string matches the pattern.
            return NextResponse.json<ApiError>(
                {
                    success: false,
                    error: "origin must be a valid 3 letter IATA code",
                },
                {status: 400}
            );
        }

        if (!IATA_CODE_PATTERN.test(destination)) {
            return NextResponse.json<ApiError>(
            {
                success: false,
                error: "destination must be a valid 3-letter IATA code",
            },
            { status: 400 }
            );
        }
        if (origin === destination) {
          return NextResponse.json<ApiError>(
            {
                success: false,
                error: "origin and destination must be different",
            },
            { status: 400 }
        );
}

        const routes = await searchRoutes(origin, destination, limit);

        return NextResponse.json<ApiSuccess<RouteSummary[]>>({
            success: true,
            data: routes,
        });
    } catch (error) {
        console.error("Route search failed:", error);
        return NextResponse.json<ApiError>(
            {
                success: false,
                error: "Server errror, failed to search routes",
            },
            {status: 500}
        );
    }
}

