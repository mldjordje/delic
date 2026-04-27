import type { MetadataRoute } from "next";
import { getPublicAppUrl } from "@/lib/env";

const PUBLIC_ALLOW = [
  "/",
  "/blog",
  "/blog/",
  "/zakazivanje",
  "/zakazivanje/",
  "/polovni-automobili",
  "/polovni-automobili/",
];

const PRIVATE_DISALLOW = [
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
];

export default function robots(): MetadataRoute.Robots {
  const base = getPublicAppUrl();
  return {
    rules: [
      // Standard crawlers — full public access
      {
        userAgent: "*",
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // OpenAI GPTBot — allow public content for AI-powered search
      {
        userAgent: "GPTBot",
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // Anthropic ClaudeBot — allow public content
      {
        userAgent: "ClaudeBot",
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // Perplexity AI
      {
        userAgent: "PerplexityBot",
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // Google Extended (used for Bard/Gemini AI training)
      {
        userAgent: "Google-Extended",
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // Common Crawl (used by many AI research projects)
      {
        userAgent: "CCBot",
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // Meta AI
      {
        userAgent: "FacebookBot",
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // Apple Applebot (Siri, Spotlight)
      {
        userAgent: "Applebot",
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // Block all bots from private areas entirely
      {
        userAgent: "*",
        disallow: PRIVATE_DISALLOW,
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

