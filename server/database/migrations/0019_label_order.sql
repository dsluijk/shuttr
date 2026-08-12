ALTER TABLE "label" ADD COLUMN "ordering" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "label" SET "ordering" = ordered.ordering FROM (SELECT "id", row_number() OVER (ORDER BY "title") - 1 AS ordering FROM "label") AS ordered WHERE "label"."id" = ordered."id";
