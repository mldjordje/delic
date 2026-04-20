import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "Auto Delić — tehnički pregled",
  description: "Online zakazivanje tehničkog pregleda vozila — Niš",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
