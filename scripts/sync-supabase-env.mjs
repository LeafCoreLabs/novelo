import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env");

const password = process.argv[2] ?? process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("Usage: node scripts/sync-supabase-env.mjs <database-password>");
  console.error("Or set SUPABASE_DB_PASSWORD in the environment.");
  process.exit(1);
}

const ref = process.env.SUPABASE_PROJECT_REF ?? "bjvrtepxxkfkymbbuggg";
const encoded = encodeURIComponent(password);
const host = "aws-0-ap-south-1.pooler.supabase.com";
const databaseUrl = `postgresql://postgres.${ref}:${encoded}@${host}:6543/postgres?pgbouncer=true&connection_limit=1`;
const directUrl = `postgresql://postgres.${ref}:${encoded}@${host}:5432/postgres`;

let env = readFileSync(envPath, "utf8");
env = env.replace(/^SUPABASE_DB_PASSWORD=.*$/m, `SUPABASE_DB_PASSWORD=${password}`);
env = env.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=${databaseUrl}`);
env = env.replace(/^DIRECT_URL=.*$/m, `DIRECT_URL=${directUrl}`);

if (!/^STORAGE_PROVIDER=supabase/m.test(env)) {
  env = env.replace(/^STORAGE_PROVIDER=.*$/m, "STORAGE_PROVIDER=supabase");
}

writeFileSync(envPath, env, "utf8");

console.log("Updated .env with Supabase DATABASE_URL, DIRECT_URL, and storage provider.");
