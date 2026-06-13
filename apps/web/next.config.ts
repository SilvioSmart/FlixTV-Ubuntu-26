import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  allowedDevOrigins: [
    "http://localhost:3000",
    "https://www.flixtv.it",
    "https://admin.flixtv.it"
  ],
  transpilePackages: [
    "@stream-9/shared"
  ],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "video.js"
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net"
      },
      {
        protocol: "https",
        hostname: "www.flixtv.it"
      },
      {
        protocol: "https",
        hostname: "admin.flixtv.it"
      },
      {
        protocol: "https",
        hostname: "adsrv.org"
      }
    ]
  }
};

export default nextConfig;
