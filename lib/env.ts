import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
  POSTGRES_URL: z.string().url().optional(),
  POSTGRES_PRISMA_URL: z.string().url().optional(),
  AUTH_JWT_SECRET: z.string().min(32).optional(),
  AUTH_OTP_SALT: z.string().min(8).optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().min(3).default("Auto Delić <onboarding@resend.dev>"),
  RESEND_REPLY_TO: z.string().optional(),
  ADMIN_BOOKING_NOTIFY_EMAIL: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().optional(),
  SMTP_SECURE: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().optional(),
  MAIL_ADMIN_TO: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  /** Zarezom odvojeni origin-i za CORS (npr. https://stari-cpanel.rs) */
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  GARAGE_DEFAULT_EMPLOYEE_SLUG: z.string().default("auto-delic-lane-1"),
  CLINIC_WORKDAY_START: z.string().default("08:00"),
  CLINIC_WORKDAY_END: z.string().default("17:00"),
  CLINIC_SATURDAY_START: z.string().default("08:00"),
  CLINIC_SATURDAY_END: z.string().default("14:00"),
  CLINIC_SLOT_MINUTES: z.coerce.number().int().min(15).max(120).default(30),
  CLINIC_BOOKING_WINDOW_DAYS: z.coerce.number().int().min(1).max(90).default(31),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

const base = parsed.data;
const databaseUrl = base.POSTGRES_URL || base.DATABASE_URL || base.POSTGRES_PRISMA_URL || "";

if (!databaseUrl && typeof window === "undefined" && process.env.NODE_ENV === "development") {
  console.warn(
    "[auto-delic] POSTGRES_URL / DATABASE_URL nije postavljen — API koji koristi bazu će baciti grešku pri pozivu."
  );
}

export const env = {
  ...base,
  DATABASE_URL_RESOLVED: databaseUrl,
};

export function getPublicAppUrl() {
  return (
    base.NEXT_PUBLIC_APP_URL ||
    base.APP_URL ||
    base.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  );
}
