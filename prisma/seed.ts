import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

import { slugify } from "../lib/utils";

const prisma = new PrismaClient();

const GENRES = [
  "Fantasy",
  "Science Fiction",
  "Romance",
  "Mystery",
  "Thriller",
  "Literary",
  "Horror",
  "Adventure",
];

/** Bootstrap only — no sample stories or demo users. */
async function main() {
  console.log("🌱 Bootstrapping Novelo database…");

  await prisma.setting.upsert({
    where: { key: "site" },
    update: {},
    create: { key: "site", value: { name: "Novelo", tagline: "Read between the worlds." } },
  });

  const sections = [
    { key: "hero", title: "Read brilliantly.", order: 0 },
    { key: "latest", title: "Latest stories", order: 1 },
    { key: "about", title: "About the author", order: 2 },
    { key: "popular", title: "Reader favorites", order: 3 },
  ];
  for (const s of sections) {
    await prisma.homepageSection.upsert({
      where: { key: s.key },
      update: { title: s.title, order: s.order },
      create: { ...s, enabled: true },
    });
  }

  for (const name of GENRES) {
    await prisma.genre.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  const legacyAdmin = await prisma.user.findUnique({ where: { email: "admin@nobelo.local" } });
  if (legacyAdmin) {
    await prisma.user.update({
      where: { email: "admin@nobelo.local" },
      data: { email: "admin@novelo.local" },
    });
  }

  await prisma.user.upsert({
    where: { email: "admin@novelo.local" },
    update: {
      role: Role.ADMIN,
      passwordHash,
      profile: {
        upsert: {
          create: {
            displayName: "Ravi Ranjan",
            handle: "ravi",
            bio: "Indian Story Writer. Every story on Novelo is written and published here.",
            avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80",
          },
          update: {
            displayName: "Ravi Ranjan",
            handle: "ravi",
            bio: "Indian Story Writer. Every story on Novelo is written and published here.",
            avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80",
          },
        },
      },
    },
    create: {
      email: "admin@novelo.local",
      passwordHash,
      role: Role.ADMIN,
      emailVerified: new Date(),
      profile: {
        create: {
          displayName: "Ravi Ranjan",
          handle: "ravi",
          bio: "Indian Story Writer. Every story on Novelo is written and published here.",
          avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80",
        },
      },
    },
  });

  console.log("✓ Admin: admin@novelo.local (password123)");
  console.log("✅ Bootstrap complete — add stories via /admin.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
