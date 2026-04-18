"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AdminNotificationsBell from "@/components/admin/AdminNotificationsBell";
import { LogoutButton } from "@/components/LogoutButton";

type Role = "admin" | "staff" | "client";

const NAV_OWNER = [
  { href: "/admin/kalendar", label: "Kalendar" },
  { href: "/admin/dashboard", label: "Kontrolna tabla" },
  { href: "/admin/bookings", label: "Termini" },
  { href: "/admin/klijenti", label: "Klijenti" },
  { href: "/admin/analitika", label: "Analitika" },
  { href: "/admin/media", label: "Video (YouTube)" },
  { href: "/admin/podesavanja", label: "Podešavanja" },
];

const NAV_STAFF = [
  { href: "/admin/kalendar", label: "Kalendar" },
  { href: "/admin/bookings", label: "Termini" },
];

const QUICK = [{ href: "/zakazivanje", label: "Javno zakazivanje" }];

export default function AdminShellAutoDelic({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/admin/me", { credentials: "include" });
      const j = await r.json().catch(() => null);
      if (r.ok && j?.user?.role) {
        setRole(j.user.role as Role);
      }
    })();
  }, []);

  const nav = useMemo(() => {
    if (!role) {
      return NAV_OWNER;
    }
    if (role === "staff") {
      return NAV_STAFF;
    }
    return NAV_OWNER;
  }, [role]);

  const activeTitle = useMemo(() => {
    const hit = nav.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    );
    return hit?.label || "Admin";
  }, [pathname, nav]);

  const isOwner = role === "admin";

  return (
    <div className="admin-template-root">
      <aside className={`admin-template-sidebar ${menuOpen ? "is-open" : ""}`}>
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
    </div>
  );
}
