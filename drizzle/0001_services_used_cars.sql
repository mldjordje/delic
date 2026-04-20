CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"duration_min" integer NOT NULL,
	"price_rsd" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "used_car_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"make" varchar(120),
	"year" smallint,
	"price_rsd" integer NOT NULL,
	"mileage_km" integer,
	"description" text,
	"image_url" text,
	"contact_phone" varchar(32),
	"is_published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "services" ("name", "description", "duration_min", "price_rsd", "is_active", "sort_order")
SELECT 'Tehnički pregled', 'Redovan tehnički pregled vozila', 30, 0, true, 0
WHERE NOT EXISTS (SELECT 1 FROM "services" WHERE "name" = 'Tehnički pregled');
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "service_id" uuid;
--> statement-breakpoint
UPDATE "bookings" SET "service_id" = (SELECT "id" FROM "services" WHERE "name" = 'Tehnički pregled' ORDER BY "created_at" LIMIT 1) WHERE "service_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "service_id" SET NOT NULL;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_service_id_idx" ON "bookings" ("service_id");
