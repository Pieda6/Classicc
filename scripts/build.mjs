// Production build: migrate the database, seed it if empty, then build Next.js.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { applyDbEnv, dbEnvNames } from "./db-env.mjs";

// Load a local .env (Vercel injects env vars directly, so there isn't one there).
if (existsSync(".env")) process.loadEnvFile(".env");
applyDbEnv();

if (!process.env.DATABASE_URL) {
  const names = dbEnvNames();
  console.error(
    [
      "",
      "✖ No database configured.",
      `  Deployment environment: ${process.env.VERCEL_ENV ?? "local"}${process.env.VERCEL_GIT_COMMIT_REF ? ` (branch ${process.env.VERCEL_GIT_COMMIT_REF})` : ""}`,
      `  Database-related variables visible to this build: ${names.length ? names.join(", ") : "none"}`,
      "  Fix: Vercel project → Storage → Create Database → Neon → connect it to this project with",
      "  the environment shown above ticked (and no custom prefix), or add DATABASE_URL in",
      "  Settings → Environment Variables for that environment. Then redeploy.",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

const run = (cmd) => execSync(cmd, { stdio: "inherit", env: process.env });
run("prisma generate");
run("prisma migrate deploy");
run("tsx prisma/seed.ts");
run("next build");
