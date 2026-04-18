import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/admin/video", destination: "/admin/media", permanent: false },
      { source: "/admin/istorija", destination: "/admin/bookings", permanent: false },
    ];
  },
};

export default nextConfig;
