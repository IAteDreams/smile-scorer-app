import { renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SERVER_TIME_ZONE, useTimeZone } from "./use-time-zone";

function TimeZone() {
  return <>{useTimeZone()}</>;
}

describe("useTimeZone", () => {
  it("uses the browser's time zone", () => {
    const { result } = renderHook(() => useTimeZone());
    expect(result.current).toBe(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
  });

  it("renders UTC on the server so hydration matches", () => {
    expect(SERVER_TIME_ZONE).toBe("UTC");
    expect(renderToString(<TimeZone />)).toBe("UTC");
  });
});
