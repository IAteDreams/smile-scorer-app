/** Where the end-to-end stack runs. Nothing here points at a real service. */
export const APP_PORT = 3100;
export const SERVICES_PORT = 4010;

export const APP_URL = `http://localhost:${APP_PORT}`;
export const SERVICES_URL = `http://localhost:${SERVICES_PORT}`;

export const DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  "postgres://smile:smile@localhost:54329/smile_e2e";

export const PHOTO_BUCKET = "e2e-photos";

/** Environment for the app under test: every service is local or fake. */
export const APP_ENV = {
  NEXT_DIST_DIR: ".next-e2e",
  NEXT_TELEMETRY_DISABLED: "1",
  BETTER_AUTH_SECRET: "e2e-only-secret-that-is-at-least-32-characters",
  BETTER_AUTH_URL: APP_URL,
  RESEND_API_KEY: "re_e2e_fake",
  RESEND_BASE_URL: SERVICES_URL,
  POSTGRES_URL: DATABASE_URL,
  KV_REST_API_URL: `${SERVICES_URL}/redis`,
  KV_REST_API_TOKEN: "e2e-fake-token",
  NEXT_PUBLIC_SUPABASE_URL: SERVICES_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_e2e_fake",
  SUPABASE_SECRET_KEY: "sb_secret_e2e_fake",
  SUPABASE_PHOTO_BUCKET: PHOTO_BUCKET,
  AWS_ACCESS_KEY_ID: "e2e-fake",
  AWS_SECRET_ACCESS_KEY: "e2e-fake",
  AWS_REGION: "us-east-1",
  USE_MOCK_SCORER: "true",
};
