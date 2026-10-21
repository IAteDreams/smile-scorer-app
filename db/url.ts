export function withoutSupaParam(url: string) {
  const parsed = new URL(url);
  parsed.searchParams.delete("supa");
  return parsed.toString();
}
