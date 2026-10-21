import Image from "next/image";
import type { Ref } from "react";
import { FaceBox, type FaceBoxRect } from "@/components/common/face-box";
import { cn } from "@/lib/utils";

const STRIPES =
  "bg-[repeating-linear-gradient(135deg,var(--muted)_0_5px,var(--border)_5px_10px)]";

export const thumbnailSelector = (id: string) => `[data-thumbnail="${id}"]`;

type PhotoThumbnailProps = {
  id: string;
  photoUrl: string | null;
  hidden: boolean;
  onError?: () => void;
};

export function PhotoThumbnail({
  id,
  photoUrl,
  hidden,
  onError,
}: PhotoThumbnailProps) {
  return (
    <div
      data-thumbnail={id}
      className={cn(
        "relative size-11 overflow-hidden rounded-lg border",
        photoUrl ? "bg-muted" : STRIPES,
      )}
    >
      {photoUrl && (
        <Image
          src={photoUrl}
          alt=""
          fill
          unoptimized
          onError={onError}
          sizes="44px"
          className={cn(
            "object-cover object-[center_40%]",
            hidden && "invisible",
          )}
        />
      )}
    </div>
  );
}

type ExpandedPhotoProps = {
  photoUrl: string | null;
  alt: string;
  box: FaceBoxRect;
  faceConfidence: string;
  ref?: Ref<HTMLDivElement>;
  visible: boolean;
  boxVisible: boolean;
  onReady: (image: HTMLImageElement | null) => void;
  onError: () => void;
};

export function ExpandedPhoto({
  photoUrl,
  alt,
  box,
  faceConfidence,
  ref,
  visible,
  boxVisible,
  onReady,
  onError,
}: ExpandedPhotoProps) {
  if (!photoUrl) {
    return (
      <div
        className={cn(
          "flex aspect-square w-full items-center justify-center rounded-lg font-mono text-xs text-muted-foreground",
          STRIPES,
        )}
      >
        Photo unavailable
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-visible={visible || undefined}
      className={cn("relative", !visible && "opacity-0")}
    >
      <Image
        src={photoUrl}
        alt={alt}
        unoptimized
        width={0}
        height={0}
        sizes="(min-width: 768px) 430px, 100vw"
        onLoad={(event) => onReady(event.currentTarget)}
        onError={onError}
        className="h-auto max-h-[45dvh] w-auto max-w-full rounded-lg md:max-h-[70dvh]"
      />
      <FaceBox
        box={box}
        confidence={faceConfidence}
        className={cn(
          "shadow-[0_0_0_1px_rgb(0_0_0/0.15)] transition-opacity duration-200",
          !boxVisible && "opacity-0",
        )}
      />
    </div>
  );
}
