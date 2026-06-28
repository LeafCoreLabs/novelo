import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sql = readFileSync(join(root, "prisma/supabase-init.sql"), "utf8");
const chunks = sql.split(/\n(?=-- )/).filter(Boolean);
const outDir = join(root, "prisma/supabase-chunks");
mkdirSync(outDir, { recursive: true });

chunks.forEach((chunk, i) => {
  const name = chunk.match(/^-- (\w+)/)?.[1] ?? `part_${i}`;
  writeFileSync(join(outDir, `${String(i).padStart(2, "0")}_${name}.sql`), chunk.trim() + "\n", "utf8");
});

console.log(`Wrote ${chunks.length} chunks to prisma/supabase-chunks/`);
