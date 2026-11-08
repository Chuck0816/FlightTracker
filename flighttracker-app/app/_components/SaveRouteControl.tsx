"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function SaveRouteControl({
  routeId,
  initialSaved,
  initialNote,
}: {
  routeId: number;
  initialSaved: boolean;
  initialNote: string;
}) {
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
      const response = await fetch(`/api/savedroutes/${routeId}`, { method: "DELETE" });
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
          <Button
            variant={isSaved ? "outline" : "default"}
            className={isSaved
              ? "h-10 w-full border-positive/35 bg-positive/8 text-positive hover:bg-positive/12 hover:text-positive"
              : "h-10 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            }
          />
        }
      >
        {isSaved ? <BookmarkCheck className="h-4 w-4" aria-hidden="true" /> : <Bookmark className="h-4 w-4" aria-hidden="true" />}
        {isSaved ? "Saved route" : "Save route"}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 border-border bg-popover">
        {error ? <div role="alert" className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
        {isSaved ? (
          <div className="space-y-3">
            <p className="text-sm text-foreground">This route is in your saved list.</p>
            {initialNote ? <p className="text-xs text-muted-foreground">Note: {initialNote}</p> : null}
            <Button type="button" variant="outline" onClick={handleRemove} disabled={isSubmitting} className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive">
              {isSubmitting ? "Removing…" : "Remove saved route"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="save-route-note" className="text-xs font-medium text-muted-foreground">Note (optional)</Label>
              <Input id="save-route-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. Business trip" maxLength={255} />
            </div>
            <Button type="button" onClick={handleSave} disabled={isSubmitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {isSubmitting ? "Saving…" : "Save this route"}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
