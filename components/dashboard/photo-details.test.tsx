import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import type { PhotoDetailsData } from "@/types/photo";

import { PhotoDetails } from "./photo-details";

const PHOTO: PhotoDetailsData = {
  id: "1",
  fileName: "beach-day.jpg",
  uploaded: "Today, 2:14 PM",
  photoUrl: "/group_of_friends.webp",
  score: 92,
  label: "Beaming",
  comparison: "11 points above your average. Your best score so far.",
  faceCount: 4,
  faceConfidence: "99.9%",
  boundingBox: { left: 0.32, top: 0.445, width: 0.14, height: 0.11 },
  attributes: [
    { name: "Smile", value: "Yes", confidence: "99.2%" },
    { name: "Top emotion", value: "Happy", confidence: "98.1%" },
  ],
};

const setup = (
  overrides: Partial<ComponentProps<typeof PhotoDetails>> = {},
) => {
  const props = {
    photo: PHOTO,
    open: true,
    onOpenChange: vi.fn(),
    onFlightStart: vi.fn(),
    onClosed: vi.fn(),
    onPhotoError: vi.fn(async () => false),
    downloading: false,
    onDownload: vi.fn(),
    ...overrides,
  };
  render(<PhotoDetails {...props} />);
  return props;
};

describe("PhotoDetails", () => {
  it("opens as a dialog named after the photo", () => {
    setup();
    const dialog = screen.getByRole("dialog", { name: "beach-day.jpg" });
    expect(dialog).toHaveAccessibleDescription(PHOTO.comparison);
    expect(within(dialog).getByText("Today, 2:14 PM")).toBeInTheDocument();
  });

  it("shows the photo large with the scored face outlined", () => {
    setup();
    expect(
      screen.getByRole("img", { name: "Photo beach-day.jpg" }),
    ).toBeInTheDocument();
    const tag = screen.getByText("FACE · 99.9%");
    expect(tag.parentElement).toHaveStyle({
      left: "32%",
      top: "44.5%",
      width: "14.000000000000002%",
    });
  });

  it("shows the score and what Rekognition saw", () => {
    setup();
    expect(screen.getByText("92")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Beaming" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Top emotion").parentElement).toHaveTextContent(
      "Top emotionHappy98.1%",
    );
    expect(
      screen.getByText(/4 faces found; the score is for the largest one/),
    ).toBeInTheDocument();
  });

  it("leaves out the face count for a single face", () => {
    setup({ photo: { ...PHOTO, faceCount: 1 } });
    expect(screen.queryByText(/faces found/)).not.toBeInTheDocument();
  });

  it("shows the details only after the photo has flown in", async () => {
    const { onFlightStart } = setup();
    const image = screen.getByRole("img", { name: "Photo beach-day.jpg" });
    const panel = screen.getByTestId("photo-details-panel");
    expect(image.parentElement).toHaveClass("opacity-0");
    expect(panel).toHaveClass("opacity-0");

    fireEvent.load(image);
    await waitFor(() => expect(panel).not.toHaveClass("opacity-0"));
    expect(onFlightStart).toHaveBeenCalledTimes(1);
    expect(image.parentElement).not.toHaveClass("opacity-0");
  });

  it("waits for a fresh URL when the photo link has expired", async () => {
    const onPhotoError = vi.fn(async () => true);
    const { onFlightStart } = setup({ onPhotoError });
    fireEvent.error(screen.getByRole("img", { name: "Photo beach-day.jpg" }));

    await waitFor(() => expect(onPhotoError).toHaveBeenCalledTimes(1));
    expect(onFlightStart).not.toHaveBeenCalled();
    expect(screen.getByTestId("photo-details-panel")).toHaveClass("opacity-0");
  });

  it("opens anyway when the photo cannot be refreshed", async () => {
    const { onFlightStart } = setup({ onPhotoError: vi.fn(async () => false) });
    fireEvent.error(screen.getByRole("img", { name: "Photo beach-day.jpg" }));

    await waitFor(() =>
      expect(screen.getByTestId("photo-details-panel")).not.toHaveClass(
        "opacity-0",
      ),
    );
    expect(onFlightStart).toHaveBeenCalled();
  });

  it("shows the details at once when there is no photo to fly", () => {
    setup({ photo: { ...PHOTO, photoUrl: null } });
    expect(screen.getByTestId("photo-details-panel")).not.toHaveClass(
      "opacity-0",
    );
  });

  it("falls back when the photo is missing", () => {
    setup({ photo: { ...PHOTO, photoUrl: null } });
    expect(screen.getByText("Photo unavailable")).toBeInTheDocument();
  });

  it.each(["Close", "Done"])(
    "closes with %s after flying back",
    async (name) => {
      const { onOpenChange } = setup();
      fireEvent.click(screen.getByRole("button", { name }));
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
      expect(onOpenChange).toHaveBeenCalledTimes(1);
    },
  );

  it("renders nothing while closed", () => {
    setup({ open: false, photo: null });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("downloads the photo", () => {
    const { onDownload } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Download" }));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it("shows the download in progress", () => {
    setup({ downloading: true });
    expect(screen.getByRole("button", { name: "Downloading…" })).toBeDisabled();
  });

  it("hides the download when the photo is unavailable", () => {
    setup({ photo: { ...PHOTO, photoUrl: null } });
    expect(
      screen.queryByRole("button", { name: "Download" }),
    ).not.toBeInTheDocument();
  });
});
