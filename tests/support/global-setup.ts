import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import postgres from "postgres";
import sharp from "sharp";
import { DATABASE_URL } from "./env";
import { PHOTO_FIXTURE } from "./paths";

const ROOT = path.resolve(__dirname, "../..");

async function waitForDatabase() {
  for (let attempt = 0; attempt < 60; attempt++) {
    const sql = postgres(DATABASE_URL, { max: 1, onnotice: () => {} });
    try {
      await sql`select 1`;
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      await sql.end();
    }
  }
  throw new Error(`E2E database never became ready at ${DATABASE_URL}`);
}

/** Drops everything and applies the project's migrations from scratch. */
async function resetDatabase() {
  const sql = postgres(DATABASE_URL, { max: 1, onnotice: () => {} });
  try {
    await sql.unsafe(
      "drop schema if exists public cascade; create schema public;",
    );
    const folder = path.join(ROOT, "drizzle");
    for (const migration of readdirSync(folder).sort()) {
      const file = readFileSync(
        path.join(folder, migration, "migration.sql"),
        "utf8",
      );
      for (const statement of file.split("--> statement-breakpoint")) {
        if (statement.trim()) await sql.unsafe(statement);
      }
    }
  } finally {
    await sql.end();
  }
}

/** A real JPEG with a face in it, made from the marketing photo. */
async function writePhotoFixture() {
  mkdirSync(path.dirname(PHOTO_FIXTURE), { recursive: true });
  const jpeg = await sharp(path.join(ROOT, "public/group_of_friends.webp"))
    .resize(600)
    .jpeg({ quality: 80 })
    .toBuffer();
  writeFileSync(PHOTO_FIXTURE, jpeg);
}

export default async function globalSetup() {
  if (!process.env.E2E_DATABASE_URL) {
    execSync("docker compose -f tests/docker-compose.yml up -d --wait", {
      cwd: ROOT,
      stdio: "inherit",
    });
  }
  await waitForDatabase();
  await resetDatabase();
  await writePhotoFixture();
}
