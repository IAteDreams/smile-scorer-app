import { useState } from "react";
import { toast } from "sonner";
import { API } from "@/lib/constants/links";
import { MESSAGES } from "@/lib/constants/messages";
import { ERRORS } from "@/lib/error";
import { photoSchema } from "@/lib/schemas/score";
import { formatBytes } from "@/lib/utils";
import type { ApiResponse } from "@/types/return";
import type { ScoreResult } from "@/types/score";
import type { UploadOptions, UploadState } from "@/types/upload";

export function useUpload({ onScored }: UploadOptions): UploadState {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showPreview = (next: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(next ? URL.createObjectURL(next) : null);
  };

  const choose = (next: File | null) => {
    setError(null);
    if (next) {
      const parsed = photoSchema.safeParse(next);
      if (!parsed.success) {
        setError(
          parsed.error.issues[0]?.message ?? ERRORS.validation.photoType,
        );
        return;
      }
    }
    setFile(next);
    showPreview(next);
  };

  const reset = () => {
    setFile(null);
    showPreview(null);
    setConsent(false);
    setDragging(false);
    setError(null);
  };

  const submit = async () => {
    if (!file || !consent || pending) return;
    setPending(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("photo", file);
      const response = await fetch(API.score, { method: "POST", body: form });
      const body = (await response.json()) as ApiResponse<ScoreResult>;
      if (!body.success) {
        setError(body.error.message);
        return;
      }

      const { score, label } = body.data;
      toast.success(MESSAGES.photo.scored(file.name, score, label));
      setOpen(false);
      reset();
      await onScored(body.data);
    } catch {
      setError(ERRORS.score.uploadFailed);
    } finally {
      setPending(false);
    }
  };

  return {
    open,
    onOpenChange: (next: boolean) => {
      if (pending) return;
      setOpen(next);
      if (!next) reset();
    },
    show: () => setOpen(true),
    photo:
      file && previewUrl
        ? { name: file.name, size: formatBytes(file.size), previewUrl }
        : null,
    onPhotoChange: choose,
    consent,
    onConsentChange: setConsent,
    dragging,
    onDragOver: (event) => {
      event.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (event) => {
      event.preventDefault();
      setDragging(false);
      choose(event.dataTransfer.files[0] ?? null);
    },
    pending,
    error,
    canSubmit: file !== null && consent && !pending,
    onSubmit: () => void submit(),
  };
}
