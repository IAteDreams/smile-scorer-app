import { useRef, useState } from "react";
import { toast } from "sonner";
import { API } from "@/lib/constants/links";
import { ERRORS } from "@/lib/error";
import type { PhotoUrls, UploadInfo } from "@/types/photo";
import type { ApiResponse } from "@/types/return";
import type { ScoreEntry } from "@/types/score";

const RETRY_AFTER_MS = 60_000;

type FreshUrls = Pick<ScoreEntry, "photoUrl" | "thumbnailUrl">;

const MISSING: FreshUrls = { photoUrl: null, thumbnailUrl: null };

async function fetchPhotoUrls(id: string): Promise<FreshUrls | null> {
  try {
    const response = await fetch(API.upload(id));
    const body = (await response.json()) as ApiResponse<UploadInfo>;
    return body.success
      ? { photoUrl: body.data.url, thumbnailUrl: body.data.thumbnailUrl }
      : null;
  } catch {
    return null;
  }
}

export function usePhotoUrls(entries: readonly ScoreEntry[]): PhotoUrls {
  const [refreshed, setRefreshed] = useState<Record<string, FreshUrls>>({});
  const lastTried = useRef(new Map<string, number>());

  const refresh = async (id: string) => {
    const last = lastTried.current.get(id);
    if (last !== undefined && Date.now() - last < RETRY_AFTER_MS) return false;
    lastTried.current.set(id, Date.now());

    const urls = await fetchPhotoUrls(id);
    setRefreshed((current) => ({ ...current, [id]: urls ?? MISSING }));
    if (urls === null) {
      toast.error(ERRORS.photo.unavailable, { id: "photo-unavailable" });
    }
    return urls !== null;
  };

  return {
    entries: entries.map((entry) =>
      entry.id in refreshed ? { ...entry, ...refreshed[entry.id] } : entry,
    ),
    refresh,
  };
}
