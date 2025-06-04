/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable hot reloading, without the build step
  transpilePackages: ["@workspace/ui", "@workspace/api", "@workspace/db"],
}

export default nextConfig
