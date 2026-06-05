/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@prisma/client',
      '@ledzer/database'
    ]
  }
}

export default nextConfig