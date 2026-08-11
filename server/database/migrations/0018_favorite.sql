CREATE TABLE "favorite" (
	"userId" char(24) NOT NULL,
	"photoId" char(24) NOT NULL,
	"favoritedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_userId_photoId_pk" PRIMARY KEY("userId","photoId")
);
--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_photoId_photo_id_fk" FOREIGN KEY ("photoId") REFERENCES "public"."photo"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "favorite_userId_favoritedAt_index" ON "favorite" USING btree ("userId","favoritedAt");