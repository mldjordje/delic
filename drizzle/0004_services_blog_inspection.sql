CREATE TYPE "public"."inspection_result" AS ENUM('passed', 'failed');
--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "calendar_enabled" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "slug" varchar(255);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "services_slug_unique" ON "services" ("slug");
--> statement-breakpoint
UPDATE "services" SET "slug" = 'tehnicki-pregled', "calendar_enabled" = true WHERE "name" = 'Tehnički pregled' AND ("slug" IS NULL OR "slug" = '');
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "inspection_result" "inspection_result";
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "inspection_note" text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"image_urls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "blog_posts_slug_unique" ON "blog_posts" ("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blog_posts_published_idx" ON "blog_posts" ("is_published", "created_at");
