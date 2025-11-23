ALTER TABLE "album" ADD COLUMN "startDate" date;--> statement-breakpoint
ALTER TABLE "album" ADD COLUMN "endDate" date;--> statement-breakpoint
UPDATE "album" SET "startDate" = now(), "endDate" = now();--> statement-breakpoint
ALTER TABLE "album" ALTER COLUMN "startDate" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "album" ALTER COLUMN "endDate" SET NOT NULL;
