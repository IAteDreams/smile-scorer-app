import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UploadState } from "@/types/upload";

import { UploadDialog } from "./upload-dialog";

const setup = (overrides: Partial<UploadState> = {}) => {
  const upload: UploadState = {
    open: true,
    onOpenChange: vi.fn(),
    show: vi.fn(),
    photo: null,
    onPhotoChange: vi.fn(),
    consent: false,
    onConsentChange: vi.fn(),
    dragging: false,
    onDragOver: vi.fn(),
    onDragLeave: vi.fn(),
    onDrop: vi.fn(),
    pending: false,
    error: null,
    canSubmit: false,
    onSubmit: vi.fn(),
    ...overrides,
  };
  render(<UploadDialog upload={upload} />);
  return upload;
};

const PHOTO = { name: "beach-day.jpg", size: "2.4 MB", previewUrl: "blob:x" };

describe("UploadDialog", () => {
  it("asks for a JPG or PNG up to the real limit", () => {
    setup();
    expect(
      screen.getByRole("dialog", { name: "Upload a photo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("JPG or PNG, up to 4 MB. One face works best."),
    ).toBeInTheDocument();
  });

  it("passes a browsed file on", () => {
    const { onPhotoChange } = setup();
    const file = new File(["x"], "beach.jpg", { type: "image/jpeg" });
    const input =
      document.querySelector<HTMLInputElement>('input[type="file"]')!;
    expect(input).toHaveAttribute("accept", "image/jpeg,image/png");

    fireEvent.change(input, { target: { files: [file] } });
    expect(onPhotoChange).toHaveBeenCalledWith(file);
  });

  it("shows the chosen photo and lets the user remove it", () => {
    const { onPhotoChange } = setup({ photo: PHOTO });
    expect(screen.getByText("beach-day.jpg")).toBeInTheDocument();
    expect(screen.getByText("2.4 MB")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Remove beach-day.jpg" }),
    );
    expect(onPhotoChange).toHaveBeenCalledWith(null);
  });

  it("asks for consent, linking to the privacy policy", () => {
    const { onConsentChange } = setup();
    expect(
      screen.getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "/privacy");
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onConsentChange).toHaveBeenCalledWith(true);
  });

  it("only scores once it is ready", () => {
    setup();
    expect(screen.getByRole("button", { name: "Score smile" })).toBeDisabled();
  });

  it("scores when ready", () => {
    const { onSubmit } = setup({
      photo: PHOTO,
      consent: true,
      canSubmit: true,
    });
    fireEvent.click(screen.getByRole("button", { name: "Score smile" }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it("shows progress and errors", () => {
    setup({ pending: true, error: "We couldn't find a face." });
    expect(screen.getByRole("button", { name: "Scoring…" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't find a face.",
    );
  });
});
