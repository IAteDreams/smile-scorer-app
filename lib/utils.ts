export { cn } from "cn";

const BYTES_PER_UNIT = 1024;
const BYTE_UNITS = ["B", "KB", "MB", "GB"] as const;

export const megabytes = (n: number) => n * BYTES_PER_UNIT * BYTES_PER_UNIT;

export function formatBytes(bytes: number) {
  let value = bytes;
  let unit = 0;
  while (value >= BYTES_PER_UNIT && unit < BYTE_UNITS.length - 1) {
    value /= BYTES_PER_UNIT;
    unit++;
  }
  return `${Math.round(value * 10) / 10} ${BYTE_UNITS[unit]}`;
}
