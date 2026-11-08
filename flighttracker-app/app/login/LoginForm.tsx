"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  errorCode?: string;
  authError?: string;
  callbackUrl?: string;
};

function getErrorMessage(errorCode?: string, authError?: string): string | null {
  if (errorCode === "incorrect_password") {
    return "Incorrect password";
  }

  if (errorCode === "no_account") {
    return "No account found with this email";
  }

  if (authError === "CredentialsSignin") {
    return "Sign in failed. Check your credentials and try again.";
  }

  return null;
}

export function LoginForm({
  errorCode,
  authError,
  callbackUrl = "/search",
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errorMessage = getErrorMessage(errorCode, authError);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    await signIn("credentials", {
      email,
      password,
      redirect: true,
      redirectTo: callbackUrl,
    });
  }

  return (
    <Card className="auth-card border-border bg-card shadow-none">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Credentials</CardTitle>
        <CardDescription>
          Enter your credentials to continue to route search.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {errorMessage ? (
            <div
              role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {errorMessage}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="pilot@airline.com"
              className="h-11 bg-background/55"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
            >
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="h-11 bg-background/55"
            />
          </div>

          <Button
            type="submit"
            className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
