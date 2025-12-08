ALTER TABLE "album" ADD COLUMN "published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "album" SET "published" = true;
