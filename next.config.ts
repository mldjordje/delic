import type { NextConfig } from "next";

const oneYear = 60 * 60 * 24 * 365;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${oneYear}, immutable` }],
      },
      {
        // SW skripta se nikad ne kešira u HTTP kešu → zaglavljeni stari SW na
        // desktopu odmah dobija novu (kill-switch) verziju.
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/", destination: "/index.html" },
    ];
  },
  async redirects() {
    return [
      { source: "/admin/video", destination: "/admin/media", permanent: false },
      { source: "/admin/istorija", destination: "/admin/bookings", permanent: false },
    ];
  },
};

export default nextConfig;
