export const COVER_STORAGE_KEY = "novelo_cover_url";
export const PUBLISHED_SLUG_KEY = "novelo_published_slug";
export const PUBLISHED_AT_KEY = "novelo_published_at";

export const FORM_STEPS = [
  { id: "cover", label: "Cover" },
  { id: "details", label: "Details" },
  { id: "write", label: "Write" },
  { id: "publish", label: "Publish" },
] as const;

export type FormStepId = (typeof FORM_STEPS)[number]["id"];
