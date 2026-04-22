import type { Metadata } from "next";
import "./globals.css";
import { Open_Sans } from "next/font/google";
import { ToastProviderState } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegistrar } from "@/components/pwa/PwaRegistrar";
import { getPublicAppUrl } from "@/lib/env";

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
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
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
      </body>
    </html>
  );
}
