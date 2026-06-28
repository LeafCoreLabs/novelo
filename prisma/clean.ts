import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Wipe all application data. Schema is preserved. */
async function main() {
  console.log("🧹 Clearing Novelo database…");

  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "Purchase",
      "Bookmark",
      "Like",
      "Rating",
      "Review",
      "Comment",
      "ReadingHistory",
      "StoryTag",
      "Chapter",
      "Story",
      "Notification",
      "Follow",
      "AuditLog",
      "Collection",
      "NewsletterSubscriber",
      "ContactMessage",
      "Report",
      "Announcement",
      "Banner",
      "MediaLibrary",
      "Page",
      "SiteStatistic",
      "Profile",
      "User",
      "Genre",
      "Category",
      "Tag",
      "HomepageSection",
      "Setting"
    RESTART IDENTITY CASCADE;
  `);

  console.log("✅ Database cleared.");
}

main()
  .catch((e) => {
    console.error("❌ Clean failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
