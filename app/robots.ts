import type { MetadataRoute } from "next";
import { getPublicAppUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = getPublicAppUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog", "/blog/", "/zakazivanje", "/zakazivanje/", "/polovni-automobili", "/polovni-automobili/"],
        disallow: [
          "/admin",
          "/admin/",
          "/nalog",
          "/nalog/",
          "/prijava",
          "/prijava/",
          "/profile",
          "/profile/",
          "/dashboard",
          "/dashboard/",
          "/bookings",
          "/bookings/",
          "/vehicles",
          "/vehicles/",
          "/api",
          "/api/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

