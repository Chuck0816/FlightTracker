import { NextResponse } from 'next/server';
import { createUser } from '@/db/queries/users/createUser';
import { hashPassword } from '@/utils/hashPassword';

export const dynamic = "force-dynamic";

type CreateUserBody = {
  email?: unknown;
  password?: unknown;
  username?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateUserBody;
    const { email, password, username } = body;

    if (!isNonEmptyString(email) || !isNonEmptyString(password) || !isNonEmptyString(username)) {
      return NextResponse.json(
        { success: false, error: 'email, password, and username are required' },
        { status: 400 }
      );
    }

    const passwordHashed = await hashPassword(password);
    const userId = await createUser(email.trim(), passwordHashed, username.trim());

    return NextResponse.json({ success: true, userId }, { status: 201 });
  } catch (error) {
    const err = error as { code?: string; message?: string };
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, error: 'User with this email or username already exists' },
        { status: 409 }
      );
    }
    console.error('User not created:', err.message);
    return NextResponse.json(
      { success: false, error: 'Failed to create user'},
      { status: 500 }
    );
  }
}
