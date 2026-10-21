import { ImageUp, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormAlert } from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LINKS } from "@/lib/constants/links";
import { MAX_PHOTO_BYTES, PHOTO_MIME_TYPES } from "@/lib/constants/scoring";
import { cn, formatBytes } from "@/lib/utils";
import type { UploadState } from "@/types/upload";

export function UploadDialog({ upload }: { upload: UploadState }) {
  const { photo, pending, error } = upload;

  return (
    <Dialog open={upload.open} onOpenChange={upload.onOpenChange}>
      <DialogContent className="gap-5 rounded-[14px] sm:max-w-130">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Upload a photo
          </DialogTitle>
          <DialogDescription>
            We&apos;ll find the face and score the smile.
          </DialogDescription>
        </DialogHeader>

        <label
          onDragOver={upload.onDragOver}
          onDragLeave={upload.onDragLeave}
          onDrop={upload.onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border-[1.5px] border-dashed border-ring bg-muted/40 px-6 py-9 text-center transition-colors focus-within:ring-3 focus-within:ring-ring/30 hover:bg-muted/70",
            upload.dragging && "border-primary bg-muted",
          )}
        >
          <input
            type="file"
            accept={PHOTO_MIME_TYPES.join(",")}
            className="sr-only"
            disabled={pending}
            onChange={(event) => {
              upload.onPhotoChange(event.target.files?.[0] ?? null);
              event.target.value = "";
            }}
          />
          <span className="flex size-11 items-center justify-center rounded-[10px] border bg-background">
            <ImageUp aria-hidden className="size-5" />
          </span>
          <span className="text-sm font-medium">
            Drag a photo here, or <span className="underline">browse</span>
          </span>
          <span className="text-xs text-muted-foreground">
            JPG or PNG, up to {formatBytes(MAX_PHOTO_BYTES)}. One face works
            best.
          </span>
        </label>

        {photo && (
          <div className="flex items-center gap-3 rounded-[10px] border p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen file */}
            <img
              src={photo.previewUrl}
              alt=""
              className="size-11 rounded-lg object-cover"
            />
            <div className="flex min-w-0 flex-1 justify-between gap-3 text-[13px]">
              <span className="truncate font-medium">{photo.name}</span>
              <span className="shrink-0 text-muted-foreground">
                {photo.size}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${photo.name}`}
              disabled={pending}
              onClick={() => upload.onPhotoChange(null)}
            >
              <Trash2 aria-hidden />
            </Button>
          </div>
        )}

        <label className="flex items-start gap-2.5 text-[13px] leading-snug text-muted-foreground">
          <input
            type="checkbox"
            checked={upload.consent}
            disabled={pending}
            onChange={(event) => upload.onConsentChange(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-primary"
          />
          <span>
            I confirm I have permission to upload this photo, and I agree to it
            being analyzed under the{" "}
            <Link
              href={LINKS.public.privacy}
              target="_blank"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {error && <FormAlert message={error} />}

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" size="lg" className="rounded-lg" />
            }
            disabled={pending}
          >
            Cancel
          </DialogClose>
          <Button
            size="lg"
            className="rounded-lg"
            disabled={!upload.canSubmit}
            onClick={upload.onSubmit}
          >
            <Sparkles aria-hidden />
            {pending ? "Scoring…" : "Score smile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
