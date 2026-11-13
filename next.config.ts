import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.100.29"],
  experimental: {
    serverActions: {
      bodySizeLimit: "64mb",
    },
  },
};

export default nextConfig;
