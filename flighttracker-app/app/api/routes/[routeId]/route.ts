import { NextResponse } from "next/server";
import { getRouteById } from "@/db/queries/routes/getRouteById";

import type {
    ApiError,
    ApiSuccess,
    RouteSummary,
} from "@/types/flights";

export const runtime = "nodejs"; // nodejs framwork
export const dynamic = "force-dynamic";

type RouteContext = { // params: abbrev of IATA, such as "ORD"
    params: Promise<{
        routeId: string;
    }>;
};

export async function GET(
    _request: Request,
    context: RouteContext
) {
    try {
        const {routeId} = await context.params; // {routeId} : retrive routeId attribute from params
        const parsedRouteId = Number(routeId);

        if (
            !Number.isSafeInteger(parsedRouteId) ||
            parsedRouteId <= 0
        ) {
            return NextResponse.json<ApiError>(
                {
                    success: false,
                    error: "routeId must be a positive integer",
                },
                { status: 400 }
            );
        }
        const route = await getRouteById(parsedRouteId);

        if (!route) {
            return NextResponse.json<ApiError>(
                {
                    success: false,
                    error: "Route not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiSuccess<RouteSummary>>({
            success: true,
            data: route,
        });
    } catch (error) {
        console.error("Server Error, failed to get the route", error);
        return NextResponse.json<ApiError>(
            {
                success: false,
                error: "Failed to get route",
            },
            {status: 500}
        );
    }
}



