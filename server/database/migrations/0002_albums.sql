CREATE TYPE "public"."album_visibility" AS ENUM('public', 'authenticated', 'private');--> statement-breakpoint
CREATE TABLE "album" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"slug" varchar(128) NOT NULL,
	"title" varchar(64) NOT NULL,
	"description" varchar(512) NOT NULL,
	"visibility" "album_visibility" NOT NULL,
	"sharingAllowed" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "album_slug_unique" UNIQUE("slug"),
	CONSTRAINT "album_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE INDEX "album_slug_index" ON "album" USING btree ("slug");