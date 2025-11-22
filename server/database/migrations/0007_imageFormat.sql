ALTER TABLE "photo" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."photo_type";--> statement-breakpoint
CREATE TYPE "public"."photo_type" AS ENUM('jpeg');--> statement-breakpoint
UPDATE "photo" SET "type" = 'jpeg';--> statement-breakpoint
ALTER TABLE "photo" ALTER COLUMN "type" SET DATA TYPE "public"."photo_type" USING "type"::"public"."photo_type";
