"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function handleToggle() {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, left: rect.left });
    }
    setIsOpen((open) => !open);
  }

  return (
    <div className="inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="inline-flex min-h-10 items-center text-sm font-medium text-primary underline-offset-4 hover:text-primary/80 hover:underline"
      >
        Change password
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              style={{ top: position.top, left: position.left }}
              className="fixed z-50 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-popover p-4 shadow-xl shadow-black/20"
            >
              <UpdatePasswordForm />
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/update_user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Failed to update password");
        return;
      }

      setSuccess("Password updated");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}
      {success ? (
        <div role="status" className="rounded-md border border-positive/30 bg-positive/10 px-3 py-2 text-sm text-positive">
          {success}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          New password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className="h-11 bg-background/55"
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="confirmPassword"
          className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
        >
          Confirm new password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="••••••••"
          className="h-11 bg-background/55"
        />
      </div>

      <Button
        type="submit"
        className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}

export function DeleteAccountButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "This will permanently delete your account. This cannot be undone. Continue?"
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch("/api/delete_user", { method: "DELETE" });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Failed to delete account");
        setIsDeleting(false);
        return;
      }

      await signOut({ redirect: false });
      router.push("/login");
    } catch {
      setError("Failed to delete account");
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}
      <Button
        type="button"
        variant="outline"
        onClick={handleDelete}
        disabled={isDeleting}
        className="h-10 w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        {isDeleting ? "Deleting account..." : "Delete account"}
      </Button>
    </div>
  );
}
