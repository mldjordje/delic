import "../client-site.css";
import { SiteChrome } from "@/components/site/SiteChrome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  manifest: "/manifest-client.webmanifest",
};

export default function JavniSajtLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
