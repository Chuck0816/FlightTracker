"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type SaveRouteButtonProps = {
  routeId: number;
  initialSaved: boolean;
  initialNote: string;
};

export function SaveRouteButton({
  routeId,
  initialSaved,
  initialNote,
}: SaveRouteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [note, setNote] = useState(initialNote);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/savedroutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routeId, note }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Failed to save route");
        return;
      }

      setIsSaved(true);
      setOpen(false);
      router.refresh();
    } catch {
      setError("Failed to save route");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemove() {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/savedroutes/${routeId}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Failed to remove saved route");
        return;
      }

      setIsSaved(false);
      setOpen(false);
      router.refresh();
    } catch {
      setError("Failed to remove saved route");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          isSaved ? (
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
            />
          ) : (
            <Button
              size="sm"
              className="bg-amber-500 text-black hover:bg-amber-400"
            />
          )
        }
      >
        {isSaved ? "✓ Saved" : "Save route"}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}
        {isSaved ? (
          <div className="space-y-3">
            <p className="text-sm text-foreground">
              This route is saved.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={isSubmitting}
              className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {isSubmitting ? "Removing..." : "Remove from saved routes"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label
                htmlFor="save-route-note"
                className="font-mono text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase"
              >
                Note (optional)
              </Label>
              <Input
                id="save-route-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="e.g. Checking for a business trip"
                maxLength={255}
              />
            </div>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full bg-amber-500 text-black hover:bg-amber-400"
            >
              {isSubmitting ? "Saving..." : "Save this route"}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
