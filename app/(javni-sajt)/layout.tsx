import "../client-site.css";
import { SiteChrome } from "@/components/site/SiteChrome";

export default function JavniSajtLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
