import { useRef, useState } from "react";
import { API } from "@/lib/constants/links";
import type { PhotoUrls, UploadInfo } from "@/types/photo";
import type { ApiResponse } from "@/types/return";
import type { ScoreEntry } from "@/types/score";

const RETRY_AFTER_MS = 60_000;

async function fetchPhotoUrl(id: string) {
  try {
    const response = await fetch(API.upload(id));
    const body = (await response.json()) as ApiResponse<UploadInfo>;
    return body.success ? body.data.url : null;
  } catch {
    return null;
  }
}

export function usePhotoUrls(entries: readonly ScoreEntry[]): PhotoUrls {
  const [refreshed, setRefreshed] = useState<Record<string, string | null>>({});
  const lastTried = useRef(new Map<string, number>());

  const refresh = async (id: string) => {
    const last = lastTried.current.get(id);
    if (last !== undefined && Date.now() - last < RETRY_AFTER_MS) return false;
    lastTried.current.set(id, Date.now());

    const url = await fetchPhotoUrl(id);
    setRefreshed((current) => ({ ...current, [id]: url }));
    return url !== null;
  };

  return {
    entries: entries.map((entry) =>
      entry.id in refreshed
        ? { ...entry, photoUrl: refreshed[entry.id] }
        : entry,
    ),
    refresh,
  };
}
