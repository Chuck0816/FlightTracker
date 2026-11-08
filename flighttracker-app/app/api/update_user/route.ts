import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { updateUserPassword } from "@/db/queries/users/updateUser";
import { hashPassword } from "@/utils/hashPassword";

export const dynamic = "force-dynamic";

type UpdatePasswordBody = {
  password?: unknown; // password might not exist
};

function isNonEmptyString(value: unknown): value is string { // if the function returns true, value is considered as true
  return typeof value === "string" && value.trim().length > 0;
}

export async function PATCH(request: Request) {
  const session = await auth(); // check log in status
  /*
  session might look like:
  {
    user: {
        id: "user-123",
        email: "abc@example.com"
    }
  }
  */

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = (await request.json()) as UpdatePasswordBody; // request.json() converts json response into javascript object
  const password = body.password;

  if (!isNonEmptyString(password)) {
    return NextResponse.json(
      { success: false, error: "password is required" },
      { status: 400 }
    );
  }

  const passwordHashed = await hashPassword(password);
  const affectedRows = await updateUserPassword(
    session.user.id,
    passwordHashed
  );

  if (affectedRows === 0) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
