CREATE TYPE "public"."provider" AS ENUM('develop');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('guest', 'publisher', 'admin');--> statement-breakpoint
CREATE TABLE "user" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"role" "user_role" DEFAULT 'guest' NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_provider" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"userId" char(24) NOT NULL,
	"provider" "provider" NOT NULL,
	"providerUserId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"lastSeen" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_provider_userId_provider_unique" UNIQUE("userId","provider"),
	CONSTRAINT "user_provider_provider_providerUserId_unique" UNIQUE("provider","providerUserId")
);
--> statement-breakpoint
ALTER TABLE "user_provider" ADD CONSTRAINT "user_provider_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "user_provider_providerUserId_index" ON "user_provider" USING btree ("providerUserId");