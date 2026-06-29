import {
  AudioLines,
  Book,
  BookOpen,
  BookText,
  Feather,
  FileText,
  Headphones,
  Library,
  type LucideIcon,
  MessageSquare,
  Mic,
  Monitor,
  Music,
  Music2,
  Music4,
  Newspaper,
  NotebookPen,
  PenTool,
  Quote,
  Radio,
  ScrollText,
} from "lucide-react";

type Item = {
  Icon: LucideIcon;
  top: string;
  left: string;
  size: number;
  rotate: number;
  opacity: number;
  blur: number;
  duration: number;
  delay: number;
};

// Scattered crimson line-icons, arranged to mimic the reference wallpaper.
const ITEMS: Item[] = [
  { Icon: Headphones, top: "4%", left: "3%", size: 64, rotate: -18, opacity: 0.5, blur: 0.5, duration: 9, delay: 0 },
  { Icon: Music4, top: "2%", left: "30%", size: 40, rotate: 12, opacity: 0.35, blur: 1, duration: 11, delay: 1.5 },
  { Icon: Headphones, top: "6%", left: "33%", size: 46, rotate: 8, opacity: 0.45, blur: 0.5, duration: 10, delay: 0.6 },
  { Icon: MessageSquare, top: "16%", left: "44%", size: 78, rotate: -10, opacity: 0.5, blur: 0.5, duration: 12, delay: 0.3 },
  { Icon: Monitor, top: "12%", left: "58%", size: 70, rotate: 6, opacity: 0.4, blur: 0.5, duration: 10, delay: 1.1 },
  { Icon: BookOpen, top: "22%", left: "82%", size: 80, rotate: -8, opacity: 0.5, blur: 0.5, duration: 13, delay: 0.9 },
  { Icon: FileText, top: "34%", left: "36%", size: 70, rotate: 4, opacity: 0.45, blur: 0.6, duration: 11, delay: 1.8 },
  { Icon: Monitor, top: "40%", left: "72%", size: 42, rotate: -6, opacity: 0.35, blur: 1, duration: 9, delay: 0.4 },
  { Icon: PenTool, top: "52%", left: "2%", size: 52, rotate: 18, opacity: 0.4, blur: 1, duration: 12, delay: 1.2 },
  { Icon: Feather, top: "50%", left: "12%", size: 62, rotate: -22, opacity: 0.45, blur: 0.5, duration: 10, delay: 0.2 },
  { Icon: Feather, top: "54%", left: "35%", size: 40, rotate: 10, opacity: 0.3, blur: 1.2, duration: 11, delay: 2 },
  { Icon: AudioLines, top: "74%", left: "20%", size: 56, rotate: 0, opacity: 0.45, blur: 0.6, duration: 9, delay: 0.8 },
  { Icon: Music, top: "76%", left: "42%", size: 64, rotate: -8, opacity: 0.5, blur: 0.5, duration: 12, delay: 1.4 },
  { Icon: Radio, top: "70%", left: "88%", size: 50, rotate: 6, opacity: 0.35, blur: 1, duration: 10, delay: 0.5 },
  { Icon: ScrollText, top: "80%", left: "66%", size: 76, rotate: 14, opacity: 0.5, blur: 0.5, duration: 13, delay: 1 },
  { Icon: Mic, top: "84%", left: "92%", size: 48, rotate: -12, opacity: 0.4, blur: 0.8, duration: 11, delay: 1.7 },
  { Icon: Book, top: "44%", left: "90%", size: 44, rotate: 16, opacity: 0.3, blur: 1, duration: 10, delay: 0.7 },
  { Icon: BookText, top: "28%", left: "16%", size: 50, rotate: -14, opacity: 0.35, blur: 1, duration: 12, delay: 1.3 },
  { Icon: Newspaper, top: "62%", left: "54%", size: 46, rotate: 8, opacity: 0.32, blur: 1, duration: 9, delay: 0.9 },
  { Icon: Library, top: "10%", left: "74%", size: 38, rotate: -4, opacity: 0.28, blur: 1.2, duration: 11, delay: 2.2 },
  { Icon: Music2, top: "36%", left: "60%", size: 36, rotate: 20, opacity: 0.3, blur: 1, duration: 10, delay: 1.6 },
  { Icon: NotebookPen, top: "88%", left: "8%", size: 44, rotate: -10, opacity: 0.3, blur: 1, duration: 12, delay: 0.3 },
  { Icon: Quote, top: "20%", left: "6%", size: 34, rotate: 6, opacity: 0.28, blur: 1.2, duration: 9, delay: 1.9 },
];

/**
 * Dark, crimson line-icon "doodle" wallpaper for the WHOLE page.
 * Rendered once as a fixed layer behind all content — pure SVG (lucide) + CSS,
 * no WebGL. A single soft blur + frosted scrim keeps the wallpaper subtle on
 * every device without per-component backdrop-filter cost while scrolling.
 */
export function IconPatternBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ transform: "translateZ(0)" }}
    >
      {/* Wallpaper art — slightly scaled so blur never clips edges. */}
      <div className="absolute inset-0 scale-[1.07] blur-[6px] sm:blur-[8px]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(110% 75% at 50% -10%, rgba(220,20,60,0.22) 0%, rgba(120,12,34,0.10) 32%, rgba(10,6,12,0.97) 62%, #08050a 100%)",
          }}
        />

        {ITEMS.map((item, i) => {
          const { Icon } = item;
          return (
            <div
              key={i}
              className="absolute"
              style={{
                top: item.top,
                left: item.left,
                transform: `rotate(${item.rotate}deg) translateZ(0)`,
                willChange: "transform",
                opacity: item.opacity,
                filter: `drop-shadow(0 0 9px rgba(220,20,60,0.5))${item.blur ? ` blur(${item.blur}px)` : ""}`,
                color: "#d11d3f",
                animation: "var(--animate-float)",
                animationDuration: `${item.duration}s`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <Icon size={item.size} strokeWidth={1.25} />
            </div>
          );
        })}
      </div>

      {/* Frosted scrim — extra softness on mobile + desktop (one fixed layer). */}
      <div
        className="absolute inset-0 backdrop-blur-[10px] sm:backdrop-blur-[12px]"
        style={{
          WebkitBackdropFilter: "blur(10px)",
          backgroundColor: "color-mix(in srgb, var(--color-background) 42%, transparent)",
        }}
      />

      {/* Edge vignette to keep text readable over the whole page. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 50% 40%, transparent 0%, rgba(8,5,10,0.5) 80%)",
        }}
      />
    </div>
  );
}
