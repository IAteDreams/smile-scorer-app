import { defineConfig } from "drizzle-kit";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

// Supabase rejects non-SSL connections
const url = new URL(process.env.DATABASE_URL);
if (!url.searchParams.has("sslmode"))
  url.searchParams.set("sslmode", "require");

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: url.toString(),
  },
});
