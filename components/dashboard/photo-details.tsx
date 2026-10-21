import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import {
  ExpandedPhoto,
  thumbnailSelector,
} from "@/components/dashboard/score-photo";
import { ScoreRing } from "@/components/common/score-ring";
import { Button } from "@/components/ui/button";
import { usePhotoFlight } from "@/lib/hooks/use-photo-flight";
import { cn } from "@/lib/utils";
import type { PhotoViewerDialog } from "@/types/photo";

const DESCRIPTION_ID = "photo-details-description";

export function PhotoDetails({
  photo,
  open,
  onOpenChange,
  onFlightStart,
  onClosed,
}: PhotoViewerDialog) {
  const {
    phase,
    photoRef,
    closed,
    panelVisible,
    photoVisible,
    backdropVisible,
    flyIn,
    close,
    reset,
  } = usePhotoFlight({
    hasPhoto: Boolean(photo?.photoUrl),
    getOrigin: () =>
      photo
        ? (document
            .querySelector(thumbnailSelector(photo.id))
            ?.getBoundingClientRect() ?? null)
        : null,
    onFlightStart,
    onClose: () => onOpenChange(false),
  });

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      onOpenChangeComplete={(isOpen) => {
        if (isOpen) return;
        reset();
        onClosed();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/45 transition-opacity duration-300 supports-backdrop-filter:backdrop-blur-sm",
            !backdropVisible && "opacity-0",
            closed && "invisible",
          )}
        />
        <DialogPrimitive.Popup
          aria-describedby={DESCRIPTION_ID}
          data-phase={phase}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-215 -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[14px] border bg-popover text-popover-foreground shadow-[0_24px_60px_-12px_rgb(0_0_0/0.3)] transition-[background-color,border-color,box-shadow] duration-200 outline-none md:grid-cols-2 md:overflow-hidden",
            !panelVisible && "border-transparent bg-transparent shadow-none",
            closed && "invisible",
          )}
        >
          {photo && (
            <>
              <div
                className={cn(
                  "flex items-center justify-center p-6 transition-colors duration-200 md:p-8",
                  panelVisible && "bg-muted/60",
                )}
              >
                <ExpandedPhoto
                  ref={photoRef}
                  photoUrl={photo.photoUrl}
                  alt={`Photo ${photo.fileName}`}
                  box={photo.boundingBox}
                  faceConfidence={photo.faceConfidence}
                  visible={photoVisible}
                  boxVisible={panelVisible}
                  onReady={flyIn}
                />
              </div>

              <div
                data-testid="photo-details-panel"
                className={cn(
                  "flex flex-col gap-5 p-6 transition-opacity duration-200 md:overflow-y-auto md:p-7",
                  !panelVisible && "opacity-0",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[13px] text-muted-foreground">
                      {photo.uploaded}
                    </p>
                    <DialogPrimitive.Title className="mt-1 truncate text-lg font-semibold">
                      {photo.fileName}
                    </DialogPrimitive.Title>
                  </div>
                  <DialogPrimitive.Close
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="-mt-1 -mr-2 shrink-0"
                      />
                    }
                  >
                    <XIcon aria-hidden />
                    <span className="sr-only">Close</span>
                  </DialogPrimitive.Close>
                </div>

                <div className="flex items-center gap-5">
                  <ScoreRing
                    score={photo.score}
                    size="lg"
                    surfaceClassName="bg-popover"
                  />
                  <div>
                    <h3 className="font-heading text-[22px] font-semibold tracking-tight">
                      {photo.label}
                    </h3>
                    <DialogPrimitive.Description
                      id={DESCRIPTION_ID}
                      className="mt-1 text-sm leading-normal text-muted-foreground"
                    >
                      {photo.comparison}
                    </DialogPrimitive.Description>
                  </div>
                </div>

                <dl className="divide-y rounded-[10px] border">
                  {photo.attributes.map((attribute) => (
                    <div
                      key={attribute.name}
                      className="flex items-center justify-between gap-4 px-3.5 py-2.5 text-sm"
                    >
                      <dt className="text-muted-foreground">
                        {attribute.name}
                      </dt>
                      <dd className="flex items-baseline gap-2.5">
                        <span className="font-medium">{attribute.value}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {attribute.confidence}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="text-xs leading-normal text-muted-foreground">
                  {photo.faceCount > 1 &&
                    `${photo.faceCount} faces found; the score is for the largest one. `}
                  Score = smile confidence, weighted by HAPPY emotion and mouth
                  openness. Automated estimate, for fun only.
                </p>

                <DialogPrimitive.Close
                  render={
                    <Button size="lg" className="mt-auto w-full rounded-lg" />
                  }
                >
                  Done
                </DialogPrimitive.Close>
              </div>
            </>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
