/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ledzer/ui", "@ledzer/database"],
  experimental: {
    outputFileTracingIncludes: {
      "/api/**/*": ["./node_modules/.prisma/client/*.node"],
    },
  },
};

export default nextConfig;