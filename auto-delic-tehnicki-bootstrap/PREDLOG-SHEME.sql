-- PREDLOG šeme za projekat "Auto Delić — tehnički pregled"
-- Prilagoditi imenima migracija / Drizzle schema.js u novom projektu.
-- Pretpostavlja postojeće tabele users i bookings iz Dr Igić šeme.

-- 1) Vozila po korisniku
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  make VARCHAR(120) NOT NULL,
  engine_cc INTEGER,
  power_kw NUMERIC(6, 2),
  year SMALLINT NOT NULL,
  registration_expires_on DATE NOT NULL,
  has_lpg_or_methane BOOLEAN NOT NULL DEFAULT FALSE,
  lpg_methane_certificate_expires_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS vehicles_user_id_idx ON vehicles (user_id);

-- 2) Veza rezervacije sa vozilom + napomena radnika posle pregleda
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES vehicles (id) ON DELETE SET NULL;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS worker_notes TEXT;

CREATE INDEX IF NOT EXISTS bookings_vehicle_id_idx ON bookings (vehicle_id);

-- 3) Fiksni slot od 30 min (podesiti i kroz clinic_settings u aplikaciji)
-- UPDATE clinic_settings SET slot_minutes = 30 WHERE ... ;

-- 4) Opciono: uloga "radnik" umesto samo admin
-- U Postgres-u proširenje enum-a zahteva pažnju; u Drizzle često dodajete novu vrednost u migraciji:
-- ALTER TYPE role ADD VALUE IF NOT EXISTS 'staff';
