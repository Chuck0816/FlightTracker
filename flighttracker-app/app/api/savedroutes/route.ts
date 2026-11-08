import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { newSavedRoute } from "@/db/queries/routes/newSavedRoute";
import { getSavedRoutesForUser } from "@/lib/savedRoutes";
import type {
  ApiError,
  ApiSuccess,
  SavedRouteSummary,
} from "@/types/flights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_NOTE_LENGTH = 255;

type CreateSavedRouteBody = {
  routeId?: unknown;
  note?: unknown;
};

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json<ApiError>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const savedRoutes = await getSavedRoutesForUser(Number(session.user.id));

    return NextResponse.json<ApiSuccess<SavedRouteSummary[]>>({
      success: true,
      data: savedRoutes,
    });
  } catch (error) {
    console.error("Failed to fetch saved routes:", error);
    return NextResponse.json<ApiError>(
      { success: false, error: "Failed to fetch saved routes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json<ApiError>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = (await request.json()) as CreateSavedRouteBody;
  const { routeId, note } = body;

  const parsedRouteId = Number(routeId);
  if (!Number.isSafeInteger(parsedRouteId) || parsedRouteId <= 0) {
    return NextResponse.json<ApiError>(
      { success: false, error: "routeId must be a positive integer" },
      { status: 400 }
    );
  }

  if (note !== undefined && note !== null && typeof note !== "string") {
    return NextResponse.json<ApiError>(
      { success: false, error: "note must be a string" },
      { status: 400 }
    );
  }

  const trimmedNote =
    typeof note === "string" ? note.trim().slice(0, MAX_NOTE_LENGTH) : "";

  try {
    await newSavedRoute(
      Number(session.user.id),
      parsedRouteId,
      trimmedNote
    );

    return NextResponse.json<ApiSuccess<{ routeId: number }>>(
      { success: true, data: { routeId: parsedRouteId } },
      { status: 201 }
    );
  } catch (error) {
    const err = error as { code?: string; message?: string };

    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json<ApiError>(
        { success: false, error: "Route already saved" },
        { status: 409 }
      );
    }

    if (err.code === "ER_NO_REFERENCED_ROW" || err.code === "ER_NO_REFERENCED_ROW_2") {
      return NextResponse.json<ApiError>(
        { success: false, error: "Route not found" },
        { status: 404 }
      );
    }

    console.error("Failed to save route:", err.message ?? error);
    return NextResponse.json<ApiError>(
      { success: false, error: "Failed to save route" },
      { status: 500 }
    );
  }
}
