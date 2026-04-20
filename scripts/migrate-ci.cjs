/**
 * Na Vercelu pokreće drizzle migracije pre build-a ako postoji connection string.
 * Lokalno bez .env — preskače (next build i dalje prolazi).
 */
const { execSync } = require("child_process");

function hasDbUrl() {
  return Boolean(
    process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL
  );
}

if (!hasDbUrl()) {
  console.log("[migrate-ci] POSTGRES_URL/DATABASE_URL nije postavljen — preskačem migracije.");
  process.exit(0);
}

console.log("[migrate-ci] Pokrećem drizzle-kit migrate…");
execSync("npx drizzle-kit migrate", { stdio: "inherit", env: process.env });
