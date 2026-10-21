import { useState } from "react";
import { toast } from "sonner";
import { API } from "@/lib/constants/links";
import { MESSAGES } from "@/lib/constants/messages";
import { ERRORS } from "@/lib/error";
import type { PhotoDownload, UploadInfo } from "@/types/photo";
import type { ApiResponse } from "@/types/return";

function saveFrom(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
}

export function usePhotoDownload(): PhotoDownload {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const download = async (id: string, fileName: string) => {
    setPendingId(id);
    try {
      const response = await fetch(API.upload(id, { download: true }));
      const body = (await response.json()) as ApiResponse<UploadInfo>;
      if (!body.success) throw new Error(body.error.message);

      saveFrom(body.data.url);
      toast.success(MESSAGES.photo.downloading(fileName));
    } catch {
      toast.error(ERRORS.photo.downloadFailed);
    } finally {
      setPendingId(null);
    }
  };

  return { pendingId, download };
}
