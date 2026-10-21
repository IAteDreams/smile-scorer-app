import { ChartLine, ImageUp, ScanFace, type LucideIcon } from "lucide-react";
import { LINKS } from "@/lib/constants/links";

export const MARKETING_NAV = [
  { label: "How it works", href: LINKS.public.howItWorks },
] as const;

export const HOW_IT_WORKS_STEPS: readonly {
  icon: LucideIcon;
  title: string;
  body: string;
}[] = [
  {
    icon: ImageUp,
    title: "Upload a photo",
    body: "Drop in a JPG or PNG up to 5 MB. Works best with one clear, well-lit face.",
  },
  {
    icon: ScanFace,
    title: "We read your expression",
    body: "Rekognition finds your face and measures smile confidence, emotion and mouth position.",
  },
  {
    icon: ChartLine,
    title: "Track your history",
    body: "Every score is saved to your dashboard, with your average, your best and your trend.",
  },
];
