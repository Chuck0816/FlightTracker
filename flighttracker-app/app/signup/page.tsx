import Link from "next/link";

import { AuthContextPanel } from "@/app/_components/AuthContextPanel";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="auth-layout flex-1">
      <AuthContextPanel />
      <section className="auth-panel" aria-labelledby="signup-heading">
        <div className="auth-panel-inner">
          <div className="mb-7">
            <p className="eyebrow">Create your workspace</p>
            <h1 id="signup-heading" className="mt-2 font-heading text-3xl font-medium tracking-tight text-foreground">Create account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Save routes and return to the corridors you monitor.</p>
          </div>
          <SignupForm />
          <p className="mt-5 text-center text-sm text-muted-foreground">Already registered?{" "}<Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
}
