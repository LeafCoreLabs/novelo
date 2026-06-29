"use client";

import { cn } from "@/lib/utils";

import { FORM_STEPS } from "@/components/admin/story-form/constants";

export function StoryFormStepper({
  step,
  onStep,
}: {
  step: number;
  onStep: (index: number) => void;
}) {
  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-1 md:hidden">
      {FORM_STEPS.map((item, index) => {
        const active = index === step;
        const done = index < step;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onStep(index)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                : done
                  ? "bg-white/10 text-[var(--color-foreground)]"
                  : "bg-white/5 text-[var(--color-muted)]",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
