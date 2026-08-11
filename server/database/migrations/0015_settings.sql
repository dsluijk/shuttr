CREATE TABLE "link" (
	"id" char(24) PRIMARY KEY NOT NULL,
	"icon" text NOT NULL,
	"to" text NOT NULL,
	"label" varchar(32),
	"ordering" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "setting" (
	"id" boolean PRIMARY KEY DEFAULT true NOT NULL,
	"title" varchar(32) NOT NULL,
	"header" varchar(64) NOT NULL,
	"description" varchar(512) NOT NULL,
	"primaryColor" varchar(16) NOT NULL,
	"neutralColor" varchar(16) NOT NULL,
	CONSTRAINT "setting_singleton" CHECK ("setting"."id")
);
--> statement-breakpoint
INSERT INTO "setting" ("id", "title", "header", "description", "primaryColor", "neutralColor") VALUES (true, 'Shuttr', 'Shuttr Photo Gallery', 'Shuttr is a simple to use self-hosted photo gallery for amateurs.', 'blue', 'neutral');--> statement-breakpoint
INSERT INTO "link" ("id", "icon", "to", "label", "ordering") VALUES	('f9yax61fljinouqkpu1mwhgc', 'i-simple-icons-github', 'https://github.com/dsluijk/shuttr', 'Shuttr', 1);
