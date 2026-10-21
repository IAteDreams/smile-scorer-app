import { defineConfig } from "drizzle-kit";
import { loadEnvConfig } from "@next/env";
import { withoutSupaParam } from "./db/url";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is missing");
}

const url = new URL(withoutSupaParam(process.env.POSTGRES_URL));
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
