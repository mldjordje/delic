ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "plate_number" varchar(16);
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "vin" varchar(32);
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "fuel_type" varchar(32);
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "color" varchar(32);
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "model" varchar(120);

