"use client";

import { useFormStatus } from "react-dom";

import { deleteStoryAction } from "@/actions/story";
import { Button } from "@/components/ui/button";

export function DeleteStoryButton({ storyId, title }: { storyId: string; title: string }) {
  return (
    <form
      action={deleteStoryAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete “${title}”? This removes it from the site. This cannot be undone.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="storyId" value={storyId} />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button variant="ghost" size="sm" type="submit" disabled={pending} className="text-red-300 hover:text-red-200">
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}
