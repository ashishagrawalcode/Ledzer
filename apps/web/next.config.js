/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ledzer/ui", "@ledzer/database"],
  outputFileTracing: true, // Ensure this is true
};

export default nextConfig;