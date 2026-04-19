import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/", destination: "/index.html" },
    ];
  },
  async redirects() {
    return [
      // Jedan host za OAuth i session cookie (izbegni www vs apex probleme).
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.autodelic.com" }],
        destination: "https://autodelic.com/:path*",
        permanent: true,
      },
      { source: "/admin/video", destination: "/admin/media", permanent: false },
      { source: "/admin/istorija", destination: "/admin/bookings", permanent: false },
    ];
  },
};

export default nextConfig;
