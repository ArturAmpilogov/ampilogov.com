import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  async redirects() {
    return [
      {
        source: "/read/book/03-tonkoy-onfilogov-1536-1537",
        destination: "/read/book/03-onfilogov-priluki-1536-1537",
        permanent: false,
      },
    ];
  },
  outputFileTracingIncludes: {
    "/archive/[...path]": ["./docs/**/*"],
  },
};

export default nextConfig;
