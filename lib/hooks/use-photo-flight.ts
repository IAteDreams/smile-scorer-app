import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { flyPhoto } from "@/lib/photo-flight";
import type {
  FlightPhase,
  PhotoFlight,
  PhotoFlightOptions,
} from "@/types/photo";

export function usePhotoFlight({
  hasPhoto,
  getOrigin,
  onFlightStart,
  onClose,
}: PhotoFlightOptions): PhotoFlight {
  const [phase, setPhase] = useState<FlightPhase>("loading");
  const photoRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  const closed = phase === "closed";
  const panelVisible = !closed && (phase === "open" || !hasPhoto);

  const flyIn = async (image: HTMLImageElement | null) => {
    await image?.decode?.().catch(() => {});
    if (closingRef.current) return;
    onFlightStart();
    setPhase("flying-in");
    const origin = getOrigin();
    if (photoRef.current && origin) {
      await flyPhoto(photoRef.current, origin, "in").catch(() => {});
    }
    if (!closingRef.current) setPhase("open");
  };

  const close = async () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setPhase("flying-out");
    const origin = getOrigin();
    if (photoRef.current && origin && hasPhoto) {
      await flyPhoto(photoRef.current, origin, "out").catch(() => {});
    }
    flushSync(() => {
      setPhase("closed");
      onClose();
    });
  };

  const reset = () => {
    closingRef.current = false;
    setPhase("loading");
  };

  return {
    phase,
    photoRef,
    closed,
    panelVisible,
    photoVisible: phase !== "loading",
    backdropVisible: phase === "flying-in" || panelVisible,
    flyIn,
    close,
    reset,
  };
}
