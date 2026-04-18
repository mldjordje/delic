"use client";

/**
 * Pojednostavljen admin okvir za Auto Delić (tehnički pregled).
 * Ne zavisi od LocaleProvider / i18n — srpski tekstovi u kodu.
 * Zameni import u app/admin/layout.jsx: AdminShellAutoDelic umesto AdminShell.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AdminNotificationsBell from "@/components/admin/AdminNotificationsBell";

const NAV = [
  { href: "/admin/kalendar", label: "Kalendar" },
  { href: "/admin/dashboard", label: "Kontrolna tabla" },
  { href: "/admin/bookings", label: "Termini" },
  { href: "/admin/klijenti", label: "Klijenti" },
  { href: "/admin/analitika", label: "Analitika" },
  { href: "/admin/media", label: "Video (YouTube)" },
  { href: "/admin/podesavanja", label: "Podešavanja" },
];

const QUICK = [{ href: "/booking", label: "Forma za zakazivanje (javna)" }];

export default function AdminShellAutoDelic({ children }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("autodelic-pwa-admin-start", "1");
      document.cookie = "autodelic-pwa-admin-start=1; path=/; max-age=31536000; SameSite=Lax";
    } catch {
      // optional
    }
  }, []);

  const activeTitle = useMemo(() => {
    const hit = NAV.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    );
    return hit?.label || "Admin";
  }, [pathname]);

  return (
    <div className="admin-template-root">
      <aside className={`admin-template-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="admin-template-brand">
          <h1>Auto Delić</h1>
          <p>Tehnički pregled — admin</p>
        </div>

        <div className="admin-template-group">
          <p className="admin-template-group-title">Moduli</p>
          <nav className="admin-template-nav">
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                (item.href === "/admin/kalendar" && pathname === "/admin");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-template-nav-item ${active ? "is-active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="admin-template-group">
          <p className="admin-template-group-title">Brzi linkovi</p>
          <nav className="admin-template-nav">
            {QUICK.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="admin-template-nav-item"
                onClick={() => setMenuOpen(false)}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {menuOpen ? (
        <button
          type="button"
          className="admin-template-sidebar-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-label="Zatvori meni"
        />
      ) : null}

      <div className="admin-template-main">
        <header className="admin-template-topbar">
          <div className="admin-template-topbar-left">
            <button
              type="button"
              className="admin-template-menu-btn"
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Otvori meni"
            >
              <span />
              <span />
              <span />
            </button>
            <div>
              <h2>{activeTitle}</h2>
              <p>Administracija servisa</p>
            </div>
          </div>
          <div className="admin-template-topbar-actions">
            <AdminNotificationsBell />
            <Link href="/admin/kalendar" className="admin-template-link-btn">
              Kalendar
            </Link>
            <Link href="/admin/klijenti" className="admin-template-link-btn">
              Klijenti
            </Link>
          </div>
        </header>
        <main className="admin-template-content">{children}</main>
      </div>
    </div>
  );
}
