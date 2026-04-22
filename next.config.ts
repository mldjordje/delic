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
