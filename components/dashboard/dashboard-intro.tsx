import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type DashboardIntroProps = {
  title: string;
  summary: string;
  onUpload?: () => void;
};

export function DashboardIntro({
  title,
  summary,
  onUpload,
}: DashboardIntroProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-heading text-[28px] font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
      </div>
      <Button size="lg" className="rounded-lg" onClick={onUpload}>
        <Upload aria-hidden />
        Upload photo
      </Button>
    </div>
  );
}
