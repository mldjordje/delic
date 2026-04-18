import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  numeric,
  smallint,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const roleEnum = pgEnum("role", ["client", "staff", "admin"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 32 }),
    role: roleEnum("role").default("client").notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
    phoneUnique: uniqueIndex("users_phone_unique").on(table.phone),
  })
);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fullName: varchar("full_name", { length: 255 }),
    ...timestamps,
  },
  (table) => ({
    userUnique: uniqueIndex("profiles_user_id_unique").on(table.userId),
  })
);

export const employees = pgTable(
  "employees",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (table) => ({
    slugUnique: uniqueIndex("employees_slug_unique").on(table.slug),
  })
);

/** Jedna „traka“ za tehnički pregled (jedan lift / jedan termin u isto vreme). */
export const garageSettings = pgTable("garage_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  slotMinutes: integer("slot_minutes").default(30).notNull(),
  bookingWindowDays: integer("booking_window_days").default(31).notNull(),
  workdayStart: varchar("workday_start", { length: 5 }).default("08:00").notNull(),
  workdayEnd: varchar("workday_end", { length: 5 }).default("17:00").notNull(),
  saturdayStart: varchar("saturday_start", { length: 5 }).default("08:00").notNull(),
  saturdayEnd: varchar("saturday_end", { length: 5 }).default("14:00").notNull(),
  ...timestamps,
});

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    make: varchar("make", { length: 120 }).notNull(),
    engineCc: integer("engine_cc"),
    powerKw: numeric("power_kw", { precision: 6, scale: 2 }),
    year: smallint("year").notNull(),
    registrationExpiresOn: date("registration_expires_on").notNull(),
    hasLpgOrMethane: boolean("has_lpg_or_methane").default(false).notNull(),
    lpgMethaneCertificateExpiresOn: date("lpg_methane_certificate_expires_on"),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("vehicles_user_id_idx").on(table.userId),
  })
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "restrict" }),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "restrict" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: bookingStatusEnum("status").default("pending").notNull(),
    totalDurationMin: integer("total_duration_min").default(30).notNull(),
    totalPriceRsd: integer("total_price_rsd").default(0).notNull(),
    workerNotes: text("worker_notes"),
    clientNotes: text("client_notes"),
    cancellationReason: text("cancellation_reason"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    employeeStartsIdx: index("bookings_employee_starts_idx").on(table.employeeId, table.startsAt),
    userIdx: index("bookings_user_idx").on(table.userId),
    vehicleIdx: index("bookings_vehicle_idx").on(table.vehicleId),
  })
);

export const bookingStatusLog = pgTable("booking_status_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  previousStatus: bookingStatusEnum("previous_status"),
  nextStatus: bookingStatusEnum("next_status").notNull(),
  changedByUserId: uuid("changed_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const videoLinks = pgTable("video_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  youtubeUrl: text("youtube_url").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  ...timestamps,
});

export const otpCodes = pgTable("otp_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  codeHash: varchar("code_hash", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
