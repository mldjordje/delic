import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ToastProviderState } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

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
      <body className={inter.className}>
        <ToastProviderState>
          {children}
          <Toaster />
        </ToastProviderState>
      </body>
    </html>
  );
}
