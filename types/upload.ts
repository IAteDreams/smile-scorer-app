import type { DragEvent } from "react";
import type { ScoreResult } from "@/types/score";

export type UploadOptions = {
  onScored: (result: ScoreResult) => void | Promise<void>;
};

/** The chosen photo, ready to show in the upload dialog. */
export type ChosenPhoto = {
  name: string;
  size: string;
  previewUrl: string;
};

/** What `useUpload` returns: everything the upload dialog shows and does. */
export type UploadState = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  show: () => void;
  photo: ChosenPhoto | null;
  onPhotoChange: (file: File | null) => void;
  consent: boolean;
  onConsentChange: (consent: boolean) => void;
  dragging: boolean;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  pending: boolean;
  error: string | null;
  canSubmit: boolean;
  onSubmit: () => void;
};
