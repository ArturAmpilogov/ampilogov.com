import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  async headers() {
    return [
      {
        source: "/archive/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/read/book/03-tonkoy-onfilogov-1536-1537",
        destination: "/read/book/04-onfilogov-priluki-1536-1537",
        permanent: false,
      },
      {
        source: "/read/book/00-overview",
        destination: "/read/book/01-overview",
        permanent: true,
      },
      {
        source: "/read/book/01-greek-amphilochus",
        destination: "/read/book/02-greek-amphilochus",
        permanent: true,
      },
      {
        source: "/read/book/02-christian-amphilochius",
        destination: "/read/book/03-christian-amphilochius",
        permanent: true,
      },
      {
        source: "/read/book/03-onfilogov-priluki-1536-1537",
        destination: "/read/book/04-onfilogov-priluki-1536-1537",
        permanent: true,
      },
      {
        source: "/read/book/04-orel-1594-1596",
        destination: "/read/book/05-orel-1594-1596",
        permanent: true,
      },
      {
        source: "/read/book/05-orel-1625-1645",
        destination: "/read/book/06-orel-1625-1645",
        permanent: true,
      },
      {
        source: "/read/book/06-sergey-kursk-oboyan-1636-1651",
        destination: "/read/book/07-sergey-kursk-oboyan-1636-1651",
        permanent: true,
      },
      {
        source: "/read/book/07-anpilogovo-anpilovka",
        destination: "/read/book/08-anpilogovo-anpilovka",
        permanent: true,
      },
      {
        source: "/read/book/07-anpilovka-stary-oskol",
        destination: "/read/book/09-anpilovka-stary-oskol",
        permanent: true,
      },
      {
        source: "/read/book/07-bazdyrevo-shchigry-1697",
        destination: "/read/book/10-bazdyrevo-shchigry-1697",
        permanent: true,
      },
      {
        source: "/read/book/08-nobility-1788-1887",
        destination: "/read/book/11-nobility-1788-1887",
        permanent: true,
      },
      {
        source: "/read/book/09-chernozem-taurida",
        destination: "/read/book/12-chernozem-taurida",
        permanent: true,
      },
      {
        source: "/read/book/10-taurida-crimea",
        destination: "/read/book/13-taurida-crimea",
        permanent: true,
      },
      {
        source: "/read/book/90-method",
        destination: "/read/book/14-method",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
