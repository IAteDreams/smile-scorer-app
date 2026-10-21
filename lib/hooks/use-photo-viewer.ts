import { useState } from "react";
import { toPhotoDetails } from "@/lib/dashboard";
import type { PhotoViewer, PhotoViewerOptions } from "@/types/photo";
import type { ScoreEntry } from "@/types/score";

export function usePhotoViewer(
  entries: readonly ScoreEntry[],
  { now, timeZone, onPhotoError = async () => false }: PhotoViewerOptions,
): PhotoViewer {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [flying, setFlying] = useState(false);

  const selected = entries.find((entry) => entry.id === selectedId);

  return {
    selectedId,
    hiddenId: flying ? selectedId : null,
    show: (id: string) => {
      setSelectedId(id);
      setOpen(true);
    },
    onPhotoError,
    dialog: {
      photo: selected ? toPhotoDetails(selected, entries, now, timeZone) : null,
      open,
      onOpenChange: (next: boolean) => {
        setOpen(next);
        if (!next) setFlying(false);
      },
      onFlightStart: () => setFlying(true),
      onClosed: () => setSelectedId(null),
      onPhotoError: () =>
        selectedId ? onPhotoError(selectedId) : Promise.resolve(false),
    },
  };
}
