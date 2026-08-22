import type { Metadata } from "next";
import "./globals.css";
import { Open_Sans } from "next/font/google";
import { ToastProviderState } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegistrar } from "@/components/pwa/PwaRegistrar";
import { getPublicAppUrl } from "@/lib/env";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL(getPublicAppUrl()),
  title: {
    default: "Auto Delić — tehnički pregled vozila",
    template: "%s | Auto Delić",
  },
  description: "Tehnički pregled vozila, servis, polovni automobili — Niš. Online nalog, zakazivanje tehničkog pregleda.",
  openGraph: {
    siteName: "Auto Delić",
    type: "website",
    locale: "sr_RS",
    url: "/",
    images: [
      {
        url: "/assets/images/logonovi.png",
        width: 512,
        height: 512,
        alt: "Auto Delić",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Auto Delić — tehnički pregled vozila",
    description: "Tehnički pregled vozila, servis, polovni automobili — Niš. Online nalog, zakazivanje tehničkog pregleda.",
    images: ["/assets/images/logonovi.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/auto-delic-icon-black.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/auto-delic-icon-black.png", type: "image/png", sizes: "512x512" }],
  },
};

const openSans = Open_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
  variable: "--font-open-sans",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" className={`dark ${openSans.variable}`}>
      <body className={`${openSans.className} antialiased`}>
        <ToastProviderState>
          {children}
          <Toaster />
          <PwaRegistrar />
        </ToastProviderState>
        <Analytics />
      </body>
    </html>
  );
}
