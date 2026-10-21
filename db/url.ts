const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function withoutSupaParam(url: string) {
  const parsed = new URL(url);
  parsed.searchParams.delete("supa");
  return parsed.toString();
}

/** Hosted databases need SSL; a local one (tests, Docker) usually has none. */
export function isLocalDatabase(url: string) {
  return LOCAL_HOSTS.has(new URL(url).hostname);
}
