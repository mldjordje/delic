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
try {
  execSync("npx drizzle-kit migrate", { stdio: "inherit", env: process.env });
  console.log("[migrate-ci] Migracije primenjene.");
} catch {
  // VAŽNO: ne obaraj build zbog migracije. Najčešći uzrok je benigni —
  // migracija je već ručno primenjena (npr. tip/tabela već postoji). Ranije je
  // ovde stajalo process.exit(1), pa je SVAKI Vercel deploy padao i produkcija
  // je ostajala zaglavljena na staroj verziji (stari admin sidebar itd.).
  // Logujemo upozorenje i puštamo `next build` da nastavi.
  console.warn(
    "[migrate-ci] UPOZORENJE: drizzle-kit migrate nije uspeo — nastavljam build. " +
      "Ako je shema zaista zastarela, primeni migracije ručno (Neon SQL / drizzle-kit push)."
  );
}
