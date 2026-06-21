-- ============================================================================
-- Auto Delić — kompletna shema za Neon (Postgres)
-- Idempotentno: bezbedno za pokretanje na praznoj ILI postojećoj bazi.
-- Pokreni ceo fajl u Neon SQL editoru. Konsoliduje migracije 0000–0004.
-- ============================================================================

-- ---- ENUM tipovi ----------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."role" AS ENUM('client', 'staff', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."inspection_result" AS ENUM('passed', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ---- Korisnici / profili / OTP --------------------------------------------
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(255) NOT NULL,
  "phone" varchar(32),
  "role" "role" DEFAULT 'client' NOT NULL,
  "last_login_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "full_name" varchar(255),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "otp_codes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "identifier" varchar(255) NOT NULL,
  "user_id" uuid,
  "code_hash" varchar(255) NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "used_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ---- Radnici / podešavanja / video ----------------------------------------
CREATE TABLE IF NOT EXISTS "employees" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "full_name" varchar(255) NOT NULL,
  "slug" varchar(100) NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "garage_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "auto_confirm_bookings" boolean DEFAULT true NOT NULL,
  "slot_minutes" integer DEFAULT 30 NOT NULL,
  "booking_window_days" integer DEFAULT 31 NOT NULL,
  "workday_start" varchar(5) DEFAULT '08:00' NOT NULL,
  "workday_end" varchar(5) DEFAULT '17:00' NOT NULL,
  "saturday_start" varchar(5) DEFAULT '08:00' NOT NULL,
  "saturday_end" varchar(5) DEFAULT '14:00' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "garage_settings" ADD COLUMN IF NOT EXISTS "auto_confirm_bookings" boolean DEFAULT true NOT NULL;

CREATE TABLE IF NOT EXISTS "video_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "youtube_url" text NOT NULL,
  "title" varchar(255) NOT NULL,
  "is_published" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ---- Vozila ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "vehicles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "make" varchar(120) NOT NULL,
  "engine_cc" integer,
  "power_kw" numeric(6, 2),
  "year" smallint NOT NULL,
  "registration_expires_on" date NOT NULL,
  "has_lpg_or_methane" boolean DEFAULT false NOT NULL,
  "lpg_methane_certificate_expires_on" date,
  "plate_number" varchar(16),
  "vin" varchar(32),
  "fuel_type" varchar(32),
  "color" varchar(32),
  "model" varchar(120),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ---- Usluge ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "services" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "duration_min" integer NOT NULL,
  "price_rsd" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "calendar_enabled" boolean DEFAULT true NOT NULL,
  "slug" varchar(255),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
-- za postojeće baze gde su kolone dodate kasnije:
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "calendar_enabled" boolean DEFAULT true NOT NULL;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "slug" varchar(255);
CREATE UNIQUE INDEX IF NOT EXISTS "services_slug_unique" ON "services" ("slug");

-- Podrazumevana usluga „Tehnički pregled” (potrebna za zakazivanje/kalendar)
INSERT INTO "services" ("name", "description", "duration_min", "price_rsd", "is_active", "sort_order", "calendar_enabled", "slug")
SELECT 'Tehnički pregled', 'Redovan tehnički pregled vozila', 30, 0, true, 0, true, 'tehnicki-pregled'
WHERE NOT EXISTS (SELECT 1 FROM "services" WHERE "name" = 'Tehnički pregled');

UPDATE "services" SET "slug" = 'tehnicki-pregled', "calendar_enabled" = true
WHERE "name" = 'Tehnički pregled' AND ("slug" IS NULL OR "slug" = '');

-- ---- Polovni automobili ----------------------------------------------------
CREATE TABLE IF NOT EXISTS "used_car_listings" (
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

-- ---- Termini ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "bookings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "employee_id" uuid NOT NULL,
  "vehicle_id" uuid NOT NULL,
  "service_id" uuid,
  "starts_at" timestamp with time zone NOT NULL,
  "ends_at" timestamp with time zone NOT NULL,
  "status" "booking_status" DEFAULT 'pending' NOT NULL,
  "total_duration_min" integer DEFAULT 30 NOT NULL,
  "total_price_rsd" integer DEFAULT 0 NOT NULL,
  "worker_notes" text,
  "client_notes" text,
  "inspection_result" "inspection_result",
  "inspection_note" text,
  "follow_up_on" date,
  "follow_up_note" text,
  "follow_up_done" boolean DEFAULT false NOT NULL,
  "cancellation_reason" text,
  "cancelled_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
-- za postojeće baze:
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "service_id" uuid;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "inspection_result" "inspection_result";
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "inspection_note" text;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "follow_up_on" date;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "follow_up_note" text;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "follow_up_done" boolean DEFAULT false NOT NULL;

-- poveži postojeće/nove termine sa podrazumevanom uslugom
UPDATE "bookings" SET "service_id" = (SELECT "id" FROM "services" WHERE "name" = 'Tehnički pregled' ORDER BY "created_at" LIMIT 1)
WHERE "service_id" IS NULL;

CREATE TABLE IF NOT EXISTS "booking_status_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "booking_id" uuid NOT NULL,
  "previous_status" "booking_status",
  "next_status" "booking_status" NOT NULL,
  "changed_by_user_id" uuid,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "blocked_slots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "employee_id" uuid NOT NULL,
  "starts_at" timestamp with time zone NOT NULL,
  "ends_at" timestamp with time zone NOT NULL,
  "reason" text,
  "created_by_user_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ---- Blog ------------------------------------------------------------------
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

-- ---- Strani ključevi (idempotentno) ---------------------------------------
DO $$ BEGIN ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "bookings" ADD CONSTRAINT "bookings_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE restrict ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "bookings" ADD CONSTRAINT "bookings_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE restrict ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "booking_status_log" ADD CONSTRAINT "booking_status_log_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "booking_status_log" ADD CONSTRAINT "booking_status_log_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "blocked_slots" ADD CONSTRAINT "blocked_slots_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE restrict ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "blocked_slots" ADD CONSTRAINT "blocked_slots_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ---- Indeksi ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "bookings_employee_starts_idx" ON "bookings" ("employee_id","starts_at");
CREATE INDEX IF NOT EXISTS "bookings_user_idx" ON "bookings" ("user_id");
CREATE INDEX IF NOT EXISTS "bookings_vehicle_idx" ON "bookings" ("vehicle_id");
CREATE INDEX IF NOT EXISTS "bookings_service_id_idx" ON "bookings" ("service_id");
CREATE INDEX IF NOT EXISTS "bookings_follow_up_idx" ON "bookings" ("follow_up_on") WHERE "follow_up_on" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "employees_slug_unique" ON "employees" ("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_user_id_unique" ON "profiles" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_phone_unique" ON "users" ("phone");
CREATE INDEX IF NOT EXISTS "vehicles_user_id_idx" ON "vehicles" ("user_id");
CREATE INDEX IF NOT EXISTS "blocked_slots_employee_starts_idx" ON "blocked_slots" ("employee_id","starts_at");
CREATE UNIQUE INDEX IF NOT EXISTS "blog_posts_slug_unique" ON "blog_posts" ("slug");
CREATE INDEX IF NOT EXISTS "blog_posts_published_idx" ON "blog_posts" ("is_published", "created_at");

-- ---- Početni podaci: bar jedan radnik (za zakazivanje) ---------------------
INSERT INTO "employees" ("full_name", "slug", "is_active")
SELECT 'Auto Delić', 'auto-delic', true
WHERE NOT EXISTS (SELECT 1 FROM "employees");

-- ---- Bitno: termin se na bazi vezuje za uslugu -----------------------------
-- Ako je tabela bookings nova/prazna, postavi service_id kao NOT NULL:
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM "bookings" WHERE "service_id" IS NULL) THEN
    ALTER TABLE "bookings" ALTER COLUMN "service_id" SET NOT NULL;
  END IF;
EXCEPTION WHEN others THEN null; END $$;
