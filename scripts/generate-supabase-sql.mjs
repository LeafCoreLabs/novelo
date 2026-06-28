import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sql = execFileSync(
  "npx",
  ["prisma", "migrate", "diff", "--from-empty", "--to-schema-datamodel", "prisma/schema.prisma", "--script"],
  { cwd: root, encoding: "utf8", shell: true },
);

writeFileSync(join(root, "prisma", "supabase-init.sql"), sql, "utf8");
console.log(`Wrote ${sql.length} bytes to prisma/supabase-init.sql`);
