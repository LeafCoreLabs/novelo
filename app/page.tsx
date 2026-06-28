import { About } from "@/components/landing/about";
import { Categories } from "@/components/landing/categories";
import { FaqSection } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HomeInteractiveShell } from "@/components/landing/interactive-stories";
import { Newsletter } from "@/components/landing/newsletter";
import { Stats } from "@/components/landing/stats";
import { StorySection } from "@/components/landing/story-section";
import { Testimonials } from "@/components/landing/testimonials";
import { SiteNav } from "@/components/site/site-nav";
import { getLandingContent } from "@/services/landing.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getLandingContent();

  return (
    <main className="relative">
      <SiteNav />

      <HomeInteractiveShell>
        <Hero hero={content.hero} />

        <Stats stats={content.stats} />
        <StorySection
          id="latest"
          eyebrow="Fresh off the keyboard"
          title="Latest stories."
          description="My most recent work — updated with new chapters every week."
          stories={content.trending}
        />

        <About about={content.about} />

        <StorySection
          id="popular"
          eyebrow="Reader favorites"
          title="The ones readers love most."
          description="The stories my readers return to again and again."
          stories={content.popular}
        />

        <Categories categories={content.categories} />

        <Testimonials testimonials={content.testimonials} />
      </HomeInteractiveShell>

      <FaqSection faqs={content.faqs} />

      <Newsletter newsletter={content.newsletter} />

      <Footer brand={content.brand.name} tagline={content.brand.tagline} />
    </main>
  );
}
