"use client";

import { Lock } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function UnlockButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      <Lock className="h-4 w-4" />
      {pending ? "Processing payment…" : label}
    </Button>
  );
}
