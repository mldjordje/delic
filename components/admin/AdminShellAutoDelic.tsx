"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { CalendarDays, ClipboardList, Globe2, Menu } from "lucide-react";
import AdminNotificationsBell from "@/components/admin/AdminNotificationsBell";
import { LogoutButton } from "@/components/LogoutButton";
import { InstallPwaButton } from "@/components/pwa/InstallPwaButton";

type Role = "admin" | "staff" | "client";

const NAV_OWNER = [
  { href: "/admin/kalendar", label: "Kalendar" },
  { href: "/admin/dashboard", label: "Kontrolna tabla" },
  { href: "/admin/bookings", label: "Termini" },
  { href: "/admin/notes", label: "Napomene (TP)" },
  { href: "/admin/usluge", label: "Usluge" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/klijenti", label: "Klijenti" },
  { href: "/admin/radnici", label: "Radnici" },
  { href: "/admin/polovni", label: "Polovni automobili" },
  { href: "/admin/analitika", label: "Analitika" },
  { href: "/admin/media", label: "Video (YouTube)" },
  { href: "/admin/podesavanja", label: "Podešavanja" },
];

const NAV_STAFF = [
  { href: "/admin/kalendar", label: "Kalendar" },
  { href: "/admin/bookings", label: "Termini" },
];

const QUICK = [{ href: "/zakazivanje", label: "Javno zakazivanje" }];

export default function AdminShellAutoDelic({
  children,
  role,
}: {
  children: React.ReactNode;
  // Uloga stiže sa servera (admin/layout.tsx) — autoritativna, bez klijentskog
  // fetch-a koji je service worker (admin PWA) umeo da posluži keširan/zastareo
  // i tako srušio sidebar na staff meni (samo Kalendar + Termini).
  role: Role;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = useMemo(() => (role === "staff" ? NAV_STAFF : NAV_OWNER), [role]);

  const activeTitle = useMemo(() => {
    const hit = nav.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    );
    return hit?.label || "Admin";
  }, [pathname, nav]);

  const isOwner = role === "admin";

  return (
    <div className="admin-template-root">
      <aside id="admin-sidebar" className={`admin-template-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="admin-template-brand">
          <h1>Auto Delić</h1>
          <p>
            Tehnički pregled — {role === "staff" ? "radnik" : "administracija"}
          </p>
        </div>

        <div className="admin-template-group">
          <p className="admin-template-group-title">Moduli</p>
          <nav className="admin-template-nav">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href === "/admin/kalendar" && pathname === "/admin");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-template-nav-item ${active ? "is-active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
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
              <p>
                {isOwner
                  ? "Pun pristup — termini, klijenti, podešavanja"
                  : "Dnevni rad — kalendar i lista termina"}
              </p>
            </div>
          </div>
          <div className="admin-template-topbar-actions">
            <AdminNotificationsBell />
            <InstallPwaButton className="admin-template-link-btn" label="Instaliraj admin app" />
            <Link href="/admin/kalendar" className="admin-template-link-btn">
              Kalendar
            </Link>
            {isOwner ? (
              <Link href="/admin/klijenti" className="admin-template-link-btn">
                Klijenti
              </Link>
            ) : null}
            <LogoutButton />
          </div>
        </header>
        <main className="admin-template-content">{children}</main>
      </div>

      <nav className="admin-mobile-nav" aria-label="Brza navigacija">
        <Link
          href="/admin/kalendar"
          className={`admin-mobile-nav-item ${pathname === "/admin" || pathname.startsWith("/admin/kalendar") ? "is-active" : ""}`}
          aria-current={pathname === "/admin" || pathname.startsWith("/admin/kalendar") ? "page" : undefined}
        >
          <CalendarDays aria-hidden="true" />
          <span>Kalendar</span>
        </Link>
        <Link
          href="/admin/bookings"
          className={`admin-mobile-nav-item ${pathname.startsWith("/admin/bookings") ? "is-active" : ""}`}
          aria-current={pathname.startsWith("/admin/bookings") ? "page" : undefined}
        >
          <ClipboardList aria-hidden="true" />
          <span>Termini</span>
        </Link>
        <Link href="/zakazivanje" className="admin-mobile-nav-item">
          <Globe2 aria-hidden="true" />
          <span>Javni sajt</span>
        </Link>
        <button
          type="button"
          className={`admin-mobile-nav-item ${menuOpen ? "is-active" : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="admin-sidebar"
        >
          <Menu aria-hidden="true" />
          <span>Meni</span>
        </button>
      </nav>
    </div>
  );
}
