import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_INTERNAL_URL || "http://localhost:3000"}/api/:path*`,
      },
      {
        // Google OAuth request phase (OmniAuth lives at /auth on the API)
        source: "/auth/:path*",
        destination: `${process.env.API_INTERNAL_URL || "http://localhost:3000"}/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
