import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { deleteSavedRoute } from "@/db/queries/routes/deleteSavedRoute";
import type { ApiError, ApiSuccess } from "@/types/flights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    routeId: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json<ApiError>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { routeId } = await context.params;
  const parsedRouteId = Number(routeId);

  if (!Number.isSafeInteger(parsedRouteId) || parsedRouteId <= 0) {
    return NextResponse.json<ApiError>(
      { success: false, error: "routeId must be a positive integer" },
      { status: 400 }
    );
  }

  try {
    const result = await deleteSavedRoute(
      Number(session.user.id),
      parsedRouteId
    );

    if (result.affectedRows === 0) {
      return NextResponse.json<ApiError>(
        { success: false, error: "Saved route not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiSuccess<null>>({ success: true, data: null });
  } catch (error) {
    console.error("Failed to delete saved route:", error);
    return NextResponse.json<ApiError>(
      { success: false, error: "Failed to delete saved route" },
      { status: 500 }
    );
  }
}
