/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@ledzer/database'
    ]
  }
}

export default nextConfig