ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "follow_up_on" date;
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "follow_up_note" text;
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "follow_up_done" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_follow_up_idx" ON "bookings" ("follow_up_on") WHERE "follow_up_on" IS NOT NULL;
