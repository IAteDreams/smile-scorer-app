import type { RefObject } from "react";

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

export type PhotoViewerOptions = {
  now: number;
  timeZone: string;
};

/** The dialog props `usePhotoViewer` hands to `PhotoDetails`. */
export type PhotoViewerDialog = {
  photo: PhotoDetailsData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlightStart: () => void;
  onClosed: () => void;
};

/** What `usePhotoViewer` returns: which photo is open and its dialog props. */
export type PhotoViewer = {
  selectedId: string | null;
  hiddenId: string | null;
  show: (id: string) => void;
  dialog: PhotoViewerDialog;
};

/** The part of the viewer a list of thumbnails needs. */
export type PhotoPicker = Pick<PhotoViewer, "hiddenId" | "show">;
