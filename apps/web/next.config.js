/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ledzer/ui", "@ledzer/database"],
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': [
        './node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node'
      ],
    },
  },
};

export default nextConfig;