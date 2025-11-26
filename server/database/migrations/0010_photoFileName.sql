ALTER TABLE "photo" ADD COLUMN "fileName" text;--> statement-breakpoint
UPDATE "photo" SET "fileName" = 'unknown.jpg';--> statement-breakpoint
ALTER TABLE "photo" ALTER COLUMN "fileName" SET NOT NULL;
