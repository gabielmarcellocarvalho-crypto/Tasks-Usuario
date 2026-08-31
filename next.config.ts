import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // The library stores whole files (templates, full pages) as component
      // code, and the preview image travels in the same multipart body — the
      // 1MB default rejected those saves before the action ever ran.
      bodySizeLimit: "16mb",
    },
  },
};

export default nextConfig;
