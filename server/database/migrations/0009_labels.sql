CREATE TYPE "public"."label_style" AS ENUM('solid', 'outline', 'soft', 'subtle');--> statement-breakpoint
CREATE TABLE "albumLabels" (
	"albumId" char(24) NOT NULL,
	"labelId" char(24) NOT NULL,
	CONSTRAINT "albumLabels_albumId_labelId_pk" PRIMARY KEY("albumId","labelId")
);
--> statement-breakpoint
CREATE TABLE "label" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"title" varchar(24) NOT NULL,
	"style" "label_style" DEFAULT 'solid' NOT NULL,
	CONSTRAINT "label_title_unique" UNIQUE("title")
);
--> statement-breakpoint
ALTER TABLE "albumLabels" ADD CONSTRAINT "albumLabels_albumId_album_id_fk" FOREIGN KEY ("albumId") REFERENCES "public"."album"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "albumLabels" ADD CONSTRAINT "albumLabels_labelId_label_id_fk" FOREIGN KEY ("labelId") REFERENCES "public"."label"("id") ON DELETE cascade ON UPDATE cascade;