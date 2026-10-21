import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scoreEntry, TEST_NOW } from "@/lib/__fixtures__/score-entry";
import { ERRORS } from "@/lib/error";
import type { ScorePage } from "@/types/score";

import { useHistory } from "./use-history";

const { toast } = vi.hoisted(() => ({ toast: { error: vi.fn() } }));

vi.mock("sonner", () => ({ toast }));

const OPTIONS = { now: TEST_NOW, timeZone: "UTC" };

const page = (
  fileNames: string[],
  overrides: Partial<ScorePage> = {},
): ScorePage => ({
  items: fileNames.map((fileName, i) =>
    scoreEntry({ id: `photo-${fileName}`, fileName, daysAgo: i }),
  ),
  total: 9,
  page: 0,
  pageSize: 6,
  ...overrides,
});

const FIRST = page(["a.jpg", "b.jpg", "c.jpg", "d.jpg", "e.jpg", "f.jpg"]);

const respond = (data: ScorePage) =>
  vi
    .mocked(fetch)
    .mockResolvedValueOnce(Response.json({ success: true, data }));

const requested = () =>
  vi.mocked(fetch).mock.calls.map(([url]) => {
    const params = new URL(String(url), "http://localhost").searchParams;
    return Object.fromEntries(params);
  });

const fileNames = (items: { fileName: string }[]) =>
  items.map((item) => item.fileName);

describe("useHistory", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    vi.stubGlobal("fetch", vi.fn());
    toast.error.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("starts with the page the server rendered", () => {
    const { result } = renderHook(() => useHistory(FIRST, OPTIONS));
    expect(result.current.query).toBe("");
    expect(result.current.sort).toBe("newest");
    expect(result.current.loading).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.pagination).toMatchObject({
      total: 9,
      start: 1,
      end: 6,
      hasPrevious: false,
      hasNext: true,
    });
  });

  it("formats the page as table rows", () => {
    const { result } = renderHook(() => useHistory(FIRST, OPTIONS));
    expect(result.current.rows).toHaveLength(6);
    expect(result.current.rows[0]).toMatchObject({
      id: "photo-a.jpg",
      fileName: "a.jpg",
      thumbnailUrl: "/photos/photo-a.jpg.thumb.webp",
      uploaded: expect.stringMatching(/^Today, /),
      emotion: "Happy",
    });
  });

  it("fetches the next page", async () => {
    respond(page(["g.jpg", "h.jpg", "i.jpg"], { page: 1 }));
    const { result } = renderHook(() => useHistory(FIRST, OPTIONS));

    await act(async () => result.current.pagination.onNext());

    expect(requested()).toEqual([{ q: "", sort: "newest", page: "1" }]);
    expect(fileNames(result.current.pagination.items)).toEqual([
      "g.jpg",
      "h.jpg",
      "i.jpg",
    ]);
    expect(result.current.pagination).toMatchObject({
      start: 7,
      end: 9,
      hasPrevious: true,
      hasNext: false,
    });
  });

  it("sorts on the server from the first page", async () => {
    respond(page(["best.jpg"], { total: 1 }));
    const { result } = renderHook(() => useHistory(FIRST, OPTIONS));

    await act(async () => result.current.onSortChange("highest"));

    expect(result.current.sort).toBe("highest");
    expect(requested()).toEqual([{ q: "", sort: "highest", page: "0" }]);
    expect(fileNames(result.current.pagination.items)).toEqual(["best.jpg"]);
  });

  it("waits for the user to stop typing before searching", async () => {
    respond(page(["beach-day.jpg"], { total: 1 }));
    const { result } = renderHook(() => useHistory(FIRST, OPTIONS));

    act(() => result.current.onQueryChange("bea"));
    act(() => result.current.onQueryChange("beach"));
    expect(result.current.query).toBe("beach");
    expect(fetch).not.toHaveBeenCalled();

    await act(async () => vi.advanceTimersByTimeAsync(250));

    expect(requested()).toEqual([{ q: "beach", sort: "newest", page: "0" }]);
    expect(fileNames(result.current.pagination.items)).toEqual([
      "beach-day.jpg",
    ]);
  });

  it("keeps the sort while searching", async () => {
    respond(page([], { total: 0 }));
    respond(page([], { total: 0 }));
    const { result } = renderHook(() => useHistory(FIRST, OPTIONS));

    await act(async () => result.current.onSortChange("lowest"));
    act(() => result.current.onQueryChange("day"));
    await act(async () => vi.advanceTimersByTimeAsync(250));

    expect(requested().at(-1)).toEqual({ q: "day", sort: "lowest", page: "0" });
  });

  it("ignores an older response that arrives last", async () => {
    let finishSlow!: (response: Response) => void;
    vi.mocked(fetch).mockReturnValueOnce(
      new Promise((resolve) => {
        finishSlow = resolve;
      }),
    );
    respond(page(["new.jpg"], { total: 1 }));
    const { result } = renderHook(() => useHistory(FIRST, OPTIONS));

    act(() => result.current.pagination.onNext());
    await act(async () => result.current.onSortChange("highest"));
    await act(async () => {
      finishSlow(Response.json({ success: true, data: page(["old.jpg"]) }));
    });

    expect(fileNames(result.current.pagination.items)).toEqual(["new.jpg"]);
    expect(result.current.loading).toBe(false);
  });

  it("reloads the newest photos with no search after an upload", async () => {
    respond(page([], { total: 0 }));
    respond(page(["fresh.jpg", "a.jpg"], { total: 10 }));
    const { result } = renderHook(() => useHistory(FIRST, OPTIONS));
    await act(async () => result.current.onSortChange("oldest"));

    await act(() => result.current.reload());

    expect(result.current.sort).toBe("newest");
    expect(result.current.query).toBe("");
    expect(requested().at(-1)).toEqual({ q: "", sort: "newest", page: "0" });
    expect(result.current.pagination.items[0].fileName).toBe("fresh.jpg");
  });

  it.each([
    [
      "the API refuses",
      () =>
        vi
          .mocked(fetch)
          .mockResolvedValueOnce(
            Response.json({ success: false, error: { message: "nope" } }),
          ),
    ],
    [
      "the network fails",
      () => vi.mocked(fetch).mockRejectedValueOnce(new Error("offline")),
    ],
  ])("keeps the current page and shows a toast when %s", async (_, fail) => {
    fail();
    const { result } = renderHook(() => useHistory(FIRST, OPTIONS));

    await act(async () => result.current.pagination.onNext());

    expect(toast.error).toHaveBeenCalledWith(ERRORS.history.loadFailed);
    expect(result.current.pagination.start).toBe(1);
    expect(result.current.loading).toBe(false);
  });
});
