import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
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
      }
    ]
  }
};

export default nextConfig;
