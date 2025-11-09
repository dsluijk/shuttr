CREATE TYPE "public"."photo_type" AS ENUM('JPEG');--> statement-breakpoint
CREATE TABLE "photo" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"album" char(24) NOT NULL,
	"type" "photo_type" NOT NULL,
	"originalDigest" text NOT NULL,
	"thumbHash" text NOT NULL,
	"size" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"dateTime" timestamp NOT NULL,
	"offsetTime" text NOT NULL,
	"uploadedAt" timestamp DEFAULT now() NOT NULL,
	"cameraMake" text,
	"cameraModel" text,
	"lens" text,
	"flash" text,
	"iso" integer,
	"focalLength" text,
	"fNumber" text,
	"exposureTime" text,
	"software" text,
	"copyright" text,
	"location" geometry(point),
	CONSTRAINT "photo_album_originalDigest_unique" UNIQUE("album","originalDigest")
);
--> statement-breakpoint
ALTER TABLE "photo" ADD CONSTRAINT "photo_album_album_id_fk" FOREIGN KEY ("album") REFERENCES "public"."album"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "photo_album_index" ON "photo" USING btree ("album");--> statement-breakpoint
CREATE INDEX "photo_dateTime_index" ON "photo" USING btree ("dateTime");