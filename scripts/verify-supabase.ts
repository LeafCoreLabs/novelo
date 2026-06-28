import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({
    where: { email: "admin@novelo.local" },
    select: { email: true, role: true },
  });
  const storyCount = await prisma.story.count();
  console.log("Supabase connection OK");
  console.log("Admin:", admin ?? "not found — run seed on Supabase");
  console.log("Stories:", storyCount);
}

main()
  .catch((err) => {
    console.error("Supabase connection failed:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
