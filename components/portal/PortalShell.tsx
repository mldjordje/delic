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

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 md:grid-cols-[260px_1fr] md:gap-8 md:px-6 md:py-10">
        <aside className="glass rounded-2xl p-4 md:sticky md:top-6 md:self-start">
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
    </div>
  );
}

