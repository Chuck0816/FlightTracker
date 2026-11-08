import {NextResponse} from "next/server";

import { searchAirports } from "@/db/queries/airports/searchAirports";
import type {
    AirportSummary,
    ApiError,
    ApiSuccess
} from "@/types/flights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;
const MIN_KEYWORD_LENGTH = 2;


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
        const url = new URL(request.url); // url object for search
        const keyword = url.searchParams.get("q")?.trim()??""; //q is the end of query, otherwise return ""
        const limit = parseLimit(url.searchParams.get("limit"));
        // /api/search?q=  united%20airlines  
        if (keyword.length < MIN_KEYWORD_LENGTH) {
            return NextResponse.json<ApiError>(
                {
                    success: false,
                    error: `q must contain at least  ${MIN_KEYWORD_LENGTH} characters`,
                },
                {status: 400} // 400 request error
            );
        }
        const airports = await searchAirports(keyword, limit);

        return NextResponse.json<ApiSuccess<AirportSummary[]>>({
            success: true,
            data: airports,
        });
    } catch (error) {
        console.error("Airport search failed:", error);

        return NextResponse.json<ApiError>(
            {
                success: false,
                error: "Failed to search Airports"
            },
            {status: 500} // 500 server error
        );
    }
}
