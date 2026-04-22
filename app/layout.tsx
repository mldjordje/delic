import type { Metadata } from "next";
import "./globals.css";
import { Open_Sans } from "next/font/google";
import { ToastProviderState } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegistrar } from "@/components/pwa/PwaRegistrar";

export const metadata: Metadata = {
  title: "Auto Delić — tehnički pregled",
  description: "Online zakazivanje tehničkog pregleda vozila — Niš",
};

const openSans = Open_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
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
