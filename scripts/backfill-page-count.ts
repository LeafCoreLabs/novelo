import { prisma } from "@/lib/prisma";
import { countStoryPages } from "@/lib/reader-pages";

async function main() {
  const stories = await prisma.story.findMany({
    where: { deletedAt: null },
    select: { id: true, content: true },
  });

  for (const story of stories) {
    await prisma.story.update({
      where: { id: story.id },
      data: { pageCount: countStoryPages(story.content) },
    });
  }

  console.log(`Updated pageCount for ${stories.length} stories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
