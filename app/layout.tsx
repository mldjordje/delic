import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auto Delić — tehnički pregled",
  description: "Online zakazivanje tehničkog pregleda vozila — Niš",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  );
}
