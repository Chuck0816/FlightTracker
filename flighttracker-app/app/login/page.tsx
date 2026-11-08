import Link from "next/link";

import { AuthContextPanel } from "@/app/_components/AuthContextPanel";
import { LoginForm } from "@/app/login/LoginForm";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    code?: string;
    callbackUrl?: string;
  }>;
};

function getSafeCallbackUrl(callbackUrl?: string): string {
  if (!callbackUrl) {
    return "/search";
  }

  // Relative path (Auth.js may also send an absolute same-origin URL)
  if (callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }

  try {
    const url = new URL(callbackUrl);
    return `${url.pathname}${url.search}${url.hash}` || "/search";
  } catch {
    return "/search";
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="auth-layout flex-1">
      <AuthContextPanel />
      <section className="auth-panel" aria-labelledby="login-heading">
        <div className="auth-panel-inner">
          <div className="mb-7">
            <p className="eyebrow">Account access</p>
            <h1 id="login-heading" className="mt-2 font-heading text-3xl font-medium tracking-tight text-foreground">Sign in</h1>
            <p className="mt-2 text-sm text-muted-foreground">Continue to route search, analytics, and saved routes.</p>
          </div>
          <LoginForm errorCode={params.code} authError={params.error} callbackUrl={getSafeCallbackUrl(params.callbackUrl)} />
          <p className="mt-5 text-center text-sm text-muted-foreground">No account?{" "}<Link href="/signup" className="font-medium text-primary hover:underline">Create one</Link></p>
        </div>
      </section>
    </main>
  );
}
