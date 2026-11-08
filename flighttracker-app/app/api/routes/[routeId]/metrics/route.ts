import { NextResponse } from "next/server";

import { getRouteMetricsBundle } from "@/lib/routeMetrics";
import type { ApiError, ApiSuccess, RouteMetricsBundle } from "@/types/flights";

export const runtime = "nodejs";

type RouteContext = {
    params: Promise<{
        routeId: string;
    }>;
};

export async function GET(
    _request: Request,
    context: RouteContext
) {
    try {
        const { routeId } = await context.params;
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

        const bundle = await getRouteMetricsBundle(parsedRouteId);

        if (bundle.status === "NOT_FOUND") {
            return NextResponse.json<ApiError>(
                {
                    success: false,
                    error: "Route not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiSuccess<RouteMetricsBundle>>({
            success: true,
            data: bundle,
        });
    } catch (error) {
        console.error("Server Error, failed to get route metrics", error);
        return NextResponse.json<ApiError>(
            {
                success: false,
                error: "Failed to get route metrics",
            },
            { status: 500 }
        );
    }
}
