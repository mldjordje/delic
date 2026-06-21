"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarClock, Car, LayoutDashboard, LogOut, UserRound, Video } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Pregled", icon: LayoutDashboard },
  { href: "/bookings/new", label: "Zakaži", icon: CalendarClock },
  { href: "/bookings", label: "Termini", icon: CalendarClock },
  { href: "/vehicles", label: "Vozila", icon: Car },
  { href: "/profile", label: "Profil", icon: UserRound },
  { href: "/video", label: "Video", icon: Video },
];

// Skraćena navigacija (mobilni donji bar) — najčešće akcije za stalne korisnike
// koji se često vraćaju da zakažu pregled za neko od svojih vozila.
const MOBILE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Pregled", icon: LayoutDashboard },
  { href: "/bookings", label: "Termini", icon: CalendarClock },
  { href: "/bookings/new", label: "Zakaži", icon: CalendarClock },
  { href: "/vehicles", label: "Vozila", icon: Car },
  { href: "/profile", label: "Profil", icon: UserRound },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Brza navigacija"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActivePath(pathname, href);
          const primary = href === "/bookings/new";
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 touch-manipulation select-none flex-col items-center gap-0.5 px-1 py-2 text-[11px] transition-colors active:opacity-70",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-200 active:scale-90",
                    primary
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className={cn(primary && "font-medium text-foreground")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavLink({ href, label, icon: Icon }: NavItem) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "text-foreground" : "text-muted-foreground")} />
      <span>{label}</span>
    </Link>
  );
}

export function PortalShell({
  children,
  userLabel,
}: {
  children: React.ReactNode;
  userLabel: string;
}) {
  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/0.20),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,theme(colors.white/0.07),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

      {/* Mobilni gornji bar — branding + odjava (puni sidebar skriven na mobilnom) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-md md:hidden">
        <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
          Auto Delić
        </Link>
        <form action="/api/auth/logout" method="post">
          <Button type="submit" variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-muted-foreground">
            <LogOut className="h-4 w-4" />
            Odjava
          </Button>
        </form>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 pb-24 md:grid-cols-[260px_1fr] md:gap-8 md:px-6 md:py-10 md:pb-10">
        <aside className="glass hidden rounded-2xl p-4 md:sticky md:top-6 md:block md:self-start">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
              Auto Delić
            </Link>
            <span className="rounded-md border bg-background/40 px-2 py-1 text-xs text-muted-foreground">
              Klijent
            </span>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">Prijavljeni kao</p>
          <p className="text-sm font-medium">{userLabel}</p>

          <Separator className="my-4" />

          <nav className="grid gap-1">
            {NAV.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>

          <Separator className="my-4" />

          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="outline" className="w-full justify-start">
              <LogOut className="h-4 w-4" />
              Odjavi se
            </Button>
          </form>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>

      <MobileNav />
    </div>
  );
}

