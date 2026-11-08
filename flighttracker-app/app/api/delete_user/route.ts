// Delete User API, API endpoint: fetch/api/delete_user
/* call from frontend
fetch("/api/delete_user", {
  method: "DELETE",
});
*/ 

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { deleteUser } from "@/db/queries/users/deleteUser";

export const dynamic = "force-dynamic";

export async function DELETE() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const affectedRows = await deleteUser(session.user.id);

  if (affectedRows === 0) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}