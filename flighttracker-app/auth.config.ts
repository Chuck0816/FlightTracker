import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config — no DB imports.
 * Used by middleware.ts so the Edge runtime never bundles mysql2.
 * Full Credentials provider + authorize() logic lives in auth.ts.
 */
const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const pathname = nextUrl.pathname;
      const isProtected =
        pathname.startsWith("/profile") ||
        pathname.startsWith("/search") ||
        pathname.startsWith("/savedroutes");

      if (isProtected) {
        return !!auth;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
