import { execSync } from "node:child_process";
import path from "node:path";

/** Stops the Docker Postgres that global setup started (CI brings its own). */
export default function globalTeardown() {
  if (process.env.E2E_DATABASE_URL) return;
  execSync("docker compose -f tests/docker-compose.yml down", {
    cwd: path.resolve(__dirname, "../.."),
    stdio: "inherit",
  });
}
