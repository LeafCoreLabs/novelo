-- Add denormalized reader page count for story cards and listings.
ALTER TABLE "Story" ADD COLUMN IF NOT EXISTS "pageCount" INTEGER NOT NULL DEFAULT 1;
