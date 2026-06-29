/** Shared content types for the landing page (sourced from CMS in later phases). */

export interface Story {
  id: string;
  slug?: string;
  title: string;
  author: string;
  genre: string;
  cover: string;
  rating: number;
  reads: number;
  pageCount: number;
  chapters: number;
  excerpt: string;
  priceCents?: number;
  trending?: boolean;
}

/** The single author who owns this personal website. */
export interface AboutAuthor {
  name: string;
  penName: string;
  role: string;
  avatar: string;
  portrait: string;
  bioLong: string;
  highlights: string[];
  socials: { label: string; href: string }[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  accent: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface Stat {
  id: string;
  label: string;
  value: number;
  suffix?: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface HeroSnippet {
  id: string;
  kind: "quote" | "shayari";
  text: string;
  attribution?: string;
  gradient: string;
}

export interface LandingContent {
  brand: { name: string; tagline: string };
  nav: NavItem[];
  hero: {
    eyebrow: string;
    titleLines: string[];
    subtitle: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    featuredStories: Story[];
    snippets: HeroSnippet[];
  };
  trending: Story[];
  popular: Story[];
  about: AboutAuthor;
  categories: Category[];
  stats: Stat[];
  testimonials: Testimonial[];
  faqs: Faq[];
  newsletter: { title: string; subtitle: string };
}
