/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/dashboard", destination: "/app/dashboard", permanent: true },
      { source: "/my-tasks", destination: "/app/my-tasks", permanent: true },
      { source: "/today", destination: "/app/today", permanent: true },
      { source: "/team", destination: "/app/team", permanent: true },
      { source: "/activity", destination: "/app/activity", permanent: true },
      { source: "/notifications", destination: "/app/notifications", permanent: true },
      { source: "/search", destination: "/app/search", permanent: true },
      { source: "/projects/:path*", destination: "/app/projects/:path*", permanent: true },
      { source: "/settings/:path*", destination: "/app/settings/:path*", permanent: true },
    ];
  },
};

export default nextConfig;

