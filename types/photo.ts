import type { RefObject } from "react";
import type { ScoreEntry, ScoreTotals } from "@/types/score";

export type Rect = { left: number; top: number; width: number; height: number };

export type FlightPhase =
  "loading" | "flying-in" | "open" | "flying-out" | "closed";

export type PhotoFlightOptions = {
  hasPhoto: boolean;
  getOrigin: () => Rect | null;
  onFlightStart: () => void;
  onClose: () => void;
};

/** What `usePhotoFlight` returns: the animation phase and its controls. */
export type PhotoFlight = {
  phase: FlightPhase;
  photoRef: RefObject<HTMLDivElement | null>;
  closed: boolean;
  panelVisible: boolean;
  photoVisible: boolean;
  backdropVisible: boolean;
  flyIn: (image: HTMLImageElement | null) => Promise<void>;
  close: () => Promise<void>;
  reset: () => void;
};

export type FaceAttribute = {
  name: string;
  value: string;
  confidence: string;
};

/** Everything the expanded photo dialog shows, ready to render. */
export type PhotoDetailsData = {
  id: string;
  fileName: string;
  uploaded: string;
  photoUrl: string | null;
  score: number;
  label: string;
  comparison: string;
  faceCount: number;
  faceConfidence: string;
  boundingBox: Rect;
  attributes: FaceAttribute[];
};

/** What `GET /api/upload/[id]` returns. */
export type UploadInfo = {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  url: string;
  thumbnailUrl: string | null;
};

/** Fetches a new signed URL for a photo; resolves false if it could not. */
export type PhotoUrlRefresh = (id: string) => Promise<boolean>;

/** What `usePhotoDownload` returns: the photo being fetched and the action. */
export type PhotoDownload = {
  pendingId: string | null;
  download: (id: string, fileName: string) => Promise<void>;
};

/** What `usePhotoUrls` returns: entries with refreshed URLs applied. */
export type PhotoUrls = {
  entries: ScoreEntry[];
  refresh: PhotoUrlRefresh;
};

export type PhotoViewerOptions = {
  now: number;
  timeZone: string;
  totals: ScoreTotals;
  onPhotoError?: PhotoUrlRefresh;
};

/** The dialog props `usePhotoViewer` hands to `PhotoDetails`. */
export type PhotoViewerDialog = {
  photo: PhotoDetailsData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlightStart: () => void;
  onClosed: () => void;
  onPhotoError: () => Promise<boolean>;
  downloading: boolean;
  onDownload: () => void;
};

/** What `usePhotoViewer` returns: which photo is open and its dialog props. */
export type PhotoViewer = {
  selectedId: string | null;
  hiddenId: string | null;
  show: (id: string) => void;
  onPhotoError: PhotoUrlRefresh;
  dialog: PhotoViewerDialog;
};

/** The part of the viewer a list of thumbnails needs. */
export type PhotoPicker = Pick<
  PhotoViewer,
  "hiddenId" | "show" | "onPhotoError"
>;
