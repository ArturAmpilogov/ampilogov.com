import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  outputFileTracingIncludes: {
    "/archive/[...path]": ["./docs/**/*"],
  },
};

export default nextConfig;
