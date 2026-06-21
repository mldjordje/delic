import type { MetadataRoute } from "next";
import { getPublicAppUrl } from "@/lib/env";

// Privatni delovi (portal/admin/API) — ne indeksirati.
const DISALLOW = [
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

// AI / LLM kroleri — eksplicitno dozvoljeni da sajt bude vidljiv u AI pretrazi
// (ChatGPT, Claude, Perplexity, Google AI, itd.).
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "Amazonbot",
  "Bytespider",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "cohere-ai",
  "YouBot",
  "DuckAssistBot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  const base = getPublicAppUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
