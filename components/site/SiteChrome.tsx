"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { InstallPwaButton } from "@/components/pwa/InstallPwaButton";

const NAV_BG = [
  "/assets/images/tehnicki2.jpg",
  "/assets/images/tehnicki3.jpg",
  "/assets/images/tehnickiunutra4.jpg",
  "/assets/images/tehnickiunutra4.jpg",
  "/assets/images/tehnicki2.jpg",
  "/assets/images/tehnickiunutra5.jpg",
  "/assets/images/tehnicki2.jpg",
  "/assets/images/tehnicki3.jpg",
  "/assets/images/tehnickinocu.jpg",
  "/assets/images/znak2.jpg",
  "/assets/images/znak3.jpg",
];

type NavItem = { href: string; label: string };

const NAV: NavItem[] = [
  { href: "/", label: "Početna" },
  { href: "/about.html", label: "O nama" },
  { href: "/services.html", label: "Usluge" },
  { href: "/zakazivanje", label: "Online zakazivanje" },
  { href: "/polovni-automobili", label: "Polovni automobili" },
  { href: "/blog", label: "Blog" },
  { href: "/video-public", label: "Video" },
  { href: "/prijava", label: "Prijava" },
  { href: "/nalog", label: "Moj nalog" },
  { href: "/nalog#vozila", label: "Moja vozila" },
  { href: "/contact.html", label: "Kontakt" },
];

function pathMatches(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/nalog#")) return pathname === "/nalog";
  if (href.endsWith(".html")) return pathname === href || pathname.endsWith(href.replace(/^\//, ""));
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  /* Staticki sajt dodaje ove klase posle animsition (main.js). Bez njih: body ostaje
     overflow:hidden, logo i hamburger su nevidljivi dok body nema .active/.in */
  useEffect(() => {
    document.body.classList.add("active", "in");
    return () => {
      document.body.classList.remove("active", "in");
    };
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  return (
    <div className="autodelic-client-site">
      <header className="fixed-header midnightHeader default">
        <div className="header-flex-box">
          <Link href="/" className="logo pointer-large animsition-link">
            <div className="logo-img-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="logo-white" src="/assets/images/logonovi.png" alt="Auto Delić" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="logo-black" src="/assets/images/logonovi.png" alt="" aria-hidden />
            </div>
          </Link>

          <button
            type="button"
            className={`menu-open pointer-large${navOpen ? " active" : ""}`}
            aria-label="Meni"
            onClick={() => setNavOpen(true)}
          >
            <span className="hamburger" />
          </button>
        </div>
      </header>

      <nav className={`nav-container dark-bg-1${navOpen ? " active" : ""}`}>
        <div className="nav-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/images/logonovi.png" alt="" />
        </div>

        <button
          type="button"
          className="menu-close pointer-large"
          aria-label="Zatvori meni"
          onClick={() => setNavOpen(false)}
        />

        <div className="dropdown-close-box">
          <button type="button" className="dropdown-close pointer-large" aria-hidden onClick={() => setNavOpen(false)}>
            <span />
          </button>
        </div>

        <ul className="nav-menu dark-bg-1">
          <li className="nav-box nav-bg-change">
            <div className="nav-link" style={{ padding: "18px 0" }}>
              <InstallPwaButton
                className="border-btn pointer-large"
                label="Instaliraj aplikaciju"
              />
            </div>
            <div className="nav-bg" style={{ backgroundImage: `url(${NAV_BG[0]})` }} />
          </li>
          {NAV.map((item, i) => {
            const active = pathMatches(pathname, item.href);
            return (
              <li
                key={item.href}
                className={`nav-box nav-bg-change${active ? " active dropdown-open" : ""}`}
              >
                <Link href={item.href} className="animsition-link pointer-large nav-link" onClick={() => setNavOpen(false)}>
                  <span className={`nav-btn${active ? " active" : ""}`} data-text={item.label}>
                    {item.label}
                  </span>
                </Link>
                <div className="nav-bg" style={{ backgroundImage: `url(${NAV_BG[i] ?? NAV_BG[0]})` }} />
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="client-site-content">{children}</div>
    </div>
  );
}
