/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@prisma/client',
      '@prisma/engines',
      '@ledzer/database',
    ],
  },
}

export default nextConfig