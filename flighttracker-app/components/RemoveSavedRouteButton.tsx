"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RemoveSavedRouteButton({ routeId }: { routeId: number }) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove() {
    setError(null);
    setIsRemoving(true);

    try {
      const response = await fetch(`/api/savedroutes/${routeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Failed to remove saved route");
        setIsRemoving(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Failed to remove saved route");
      setIsRemoving(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleRemove}
        disabled={isRemoving}
        aria-label="Remove saved route"
        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-4 w-4 stroke-[1.5]" />
      </Button>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
