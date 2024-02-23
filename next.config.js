/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    env: {
      OPENAI_API_KEY: "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",
      MONGODB_URI: "mongodb://localhost:27017/aiquiz",
      },
}

module.exports = nextConfig
