import { useSyncExternalStore } from "react";

export const SERVER_TIME_ZONE = "UTC";

const subscribe = () => () => {};

const getTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export function useTimeZone(): string {
  return useSyncExternalStore(subscribe, getTimeZone, () => SERVER_TIME_ZONE);
}
