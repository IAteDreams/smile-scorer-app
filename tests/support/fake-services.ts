/**
 * Stand-ins for the hosted services the app talks to, so end-to-end tests
 * never touch real accounts:
 *
 * - Upstash Redis REST API   POST /redis, /redis/pipeline, /redis/multi-exec
 * - Supabase Storage API     /storage/v1/object/...
 * - SMTP server (emails)      port SMTP_PORT, no TLS or login
 * - Test helpers             GET  /__e2e/emails?to=<address>
 *
 * Everything lives in memory and is lost when the process stops.
 */
import { randomUUID } from "node:crypto";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { simpleParser } from "mailparser";
import { SMTPServer } from "smtp-server";
import { SERVICES_PORT, SMTP_PORT } from "./env";

type Entry = { value: string; expiresAt?: number };
type StoredFile = { bytes: Buffer; contentType: string };
type Email = { to: string[]; subject: string; html: string; sentAt: string };

const redis = new Map<string, Entry>();
const files = new Map<string, StoredFile>();
const emails: Email[] = [];

// --- Redis -----------------------------------------------------------------

function live(key: string) {
  const entry = redis.get(key);
  if (entry?.expiresAt !== undefined && entry.expiresAt <= Date.now()) {
    redis.delete(key);
    return undefined;
  }
  return entry;
}

function runCommand([name, ...args]: (string | number)[]): unknown {
  const key = String(args[0]);
  switch (String(name).toUpperCase()) {
    case "PING":
      return "PONG";
    case "GET":
      return live(key)?.value ?? null;
    case "GETDEL": {
      const value = live(key)?.value ?? null;
      redis.delete(key);
      return value;
    }
    case "SET": {
      const options = args.slice(2).map((arg) => String(arg).toUpperCase());
      const exists = live(key) !== undefined;
      if (options.includes("NX") && exists) return null;
      if (options.includes("XX") && !exists) return null;
      const entry: Entry = { value: String(args[1]) };
      const ex = options.indexOf("EX");
      const px = options.indexOf("PX");
      if (ex >= 0) entry.expiresAt = Date.now() + Number(args[ex + 3]) * 1000;
      if (px >= 0) entry.expiresAt = Date.now() + Number(args[px + 3]);
      if (options.includes("KEEPTTL")) entry.expiresAt = live(key)?.expiresAt;
      redis.set(key, entry);
      return "OK";
    }
    case "DEL":
      return args.filter((arg) => redis.delete(String(arg))).length;
    case "EXISTS":
      return args.filter((arg) => live(String(arg)) !== undefined).length;
    case "INCR":
    case "INCRBY": {
      const step =
        name.toString().toUpperCase() === "INCR" ? 1 : Number(args[1]);
      const current = live(key);
      const value = Number(current?.value ?? 0) + step;
      redis.set(key, { value: String(value), expiresAt: current?.expiresAt });
      return value;
    }
    case "EXPIRE": {
      const current = live(key);
      if (!current) return 0;
      const nx = args
        .slice(2)
        .some((arg) => String(arg).toUpperCase() === "NX");
      if (nx && current.expiresAt !== undefined) return 0;
      current.expiresAt = Date.now() + Number(args[1]) * 1000;
      return 1;
    }
    case "TTL": {
      const current = live(key);
      if (!current) return -2;
      if (current.expiresAt === undefined) return -1;
      return Math.ceil((current.expiresAt - Date.now()) / 1000);
    }
    default:
      throw new Error(`fake redis: unsupported command ${String(name)}`);
  }
}

/** Upstash base64-encodes string results when the client asks for it. */
function encode(value: unknown, base64: boolean): unknown {
  if (!base64) return value;
  if (typeof value === "string") {
    return value === "OK" ? value : Buffer.from(value).toString("base64");
  }
  if (Array.isArray(value)) return value.map((item) => encode(item, base64));
  return value;
}

function handleRedis(path: string, body: unknown, base64: boolean) {
  if (path === "/redis/pipeline" || path === "/redis/multi-exec") {
    return (body as (string | number)[][]).map((command) => {
      try {
        return { result: encode(runCommand(command), base64) };
      } catch (error) {
        return { error: String(error) };
      }
    });
  }
  return { result: encode(runCommand(body as (string | number)[]), base64) };
}

// --- Storage ---------------------------------------------------------------

const STORAGE = "/storage/v1/object";

const notFound = {
  statusCode: "404",
  error: "not_found",
  message: "Object not found",
};

function signedPath(bucket: string, path: string) {
  return `/object/sign/${bucket}/${path}?token=${randomUUID()}`;
}

function handleStorage(
  req: IncomingMessage,
  url: URL,
  raw: Buffer,
  res: ServerResponse,
) {
  const segments = url.pathname
    .slice(STORAGE.length + 1)
    .split("/")
    .map(decodeURIComponent);

  if (segments[0] === "sign") {
    const [, bucket, ...rest] = segments;
    const path = rest.join("/");

    if (req.method === "GET") {
      const file = files.get(`${bucket}/${path}`);
      if (!file) return send(res, 404, notFound);
      const download = url.searchParams.get("download");
      res.writeHead(200, {
        "content-type": file.contentType,
        ...(download !== null && {
          "content-disposition": `attachment; filename="${download || rest.at(-1)}"`,
        }),
      });
      return res.end(file.bytes);
    }

    const body = JSON.parse(raw.toString() || "{}");
    if (!path) {
      return send(
        res,
        200,
        (body.paths as string[]).map((item) =>
          files.has(`${bucket}/${item}`)
            ? { path: item, signedURL: signedPath(bucket, item), error: null }
            : { path: item, signedURL: null, error: "Object not found" },
        ),
      );
    }
    if (!files.has(`${bucket}/${path}`)) return send(res, 400, notFound);
    return send(res, 200, { signedURL: signedPath(bucket, path) });
  }

  const [bucket, ...rest] = segments;
  if (req.method === "DELETE") {
    const { prefixes } = JSON.parse(raw.toString()) as { prefixes: string[] };
    const removed = prefixes.filter((item) =>
      files.delete(`${bucket}/${item}`),
    );
    return send(
      res,
      200,
      removed.map((name) => ({ name })),
    );
  }

  if (req.method === "POST" || req.method === "PUT") {
    const key = `${bucket}/${rest.join("/")}`;
    if (
      req.method === "POST" &&
      req.headers["x-upsert"] !== "true" &&
      files.has(key)
    ) {
      return send(res, 400, {
        statusCode: "409",
        error: "Duplicate",
        message: "The resource already exists",
      });
    }
    files.set(key, {
      bytes: raw,
      contentType: String(
        req.headers["content-type"] ?? "application/octet-stream",
      ),
    });
    return send(res, 200, { Key: key, Id: randomUUID() });
  }

  return send(res, 405, { error: "method not allowed" });
}

// --- Server ----------------------------------------------------------------

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://localhost:${SERVICES_PORT}`);
    const raw = await readBody(req);

    if (url.pathname === "/health") return send(res, 200, { ok: true });

    if (url.pathname.startsWith("/redis")) {
      const base64 = req.headers["upstash-encoding"] === "base64";
      return send(
        res,
        200,
        handleRedis(url.pathname, JSON.parse(raw.toString()), base64),
      );
    }

    if (url.pathname.startsWith(STORAGE)) {
      return handleStorage(req, url, raw, res);
    }

    if (url.pathname === "/__e2e/emails") {
      const to = url.searchParams.get("to");
      return send(
        res,
        200,
        emails.filter((email) => !to || email.to.includes(to)),
      );
    }

    if (url.pathname === "/__e2e/files") {
      return send(res, 200, [...files.keys()]);
    }

    return send(res, 404, {
      error: `no fake for ${req.method} ${url.pathname}`,
    });
  } catch (error) {
    console.error("[fake-services]", error);
    return send(res, 500, { error: String(error) });
  }
});

server.listen(SERVICES_PORT, () => {
  console.log(`[fake-services] listening on ${SERVICES_PORT}`);
});

// Accepts whatever the app's mailer sends and keeps it for /__e2e/emails.
const smtp = new SMTPServer({
  authOptional: true,
  disabledCommands: ["STARTTLS"],
  logger: false,
  onData(stream, session, callback) {
    simpleParser(stream).then((mail) => {
      emails.push({
        to: session.envelope.rcptTo.map((recipient) => recipient.address),
        subject: mail.subject ?? "",
        html: typeof mail.html === "string" ? mail.html : "",
        sentAt: new Date().toISOString(),
      });
      callback();
    }, callback);
  },
});

smtp.listen(SMTP_PORT, () => {
  console.log(`[fake-services] SMTP listening on ${SMTP_PORT}`);
});
