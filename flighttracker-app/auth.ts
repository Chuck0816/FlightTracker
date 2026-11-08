import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "@/auth.config";
import { authenticateUser, checkUserExists } from "@/db/queries/users/loginUser";
import { verifyPassword } from "@/utils/hashPassword";

/**
 * Full Auth.js config — includes DB-backed Credentials provider.
 * Composes the edge-safe base from auth.config.ts; only used in
 * Node.js contexts (route handlers, server components, server actions).
 */
class AuthFailure extends CredentialsSignin {
  code: string;

  constructor(code: string) {
    super();
    this.code = code;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials.email as string | undefined)?.trim();
        const password = credentials.password as string | undefined;

        if (!email || !password) {
          return null;
        }

        const user = await authenticateUser(email);

        if (user && await verifyPassword(password, String(user.PasswordHash))) {
          return {
            id: String(user.Id),
            name: user.UserName,
            email: user.Email,
          };
        }

        const exists = await checkUserExists(email);
        throw new AuthFailure(exists ? "incorrect_password" : "no_account");
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
});
