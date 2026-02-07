/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 增加 API 请求体大小限制（支持大视频上传）
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb', // 允许上传最大 500MB
    },
  },
}

export default nextConfig
