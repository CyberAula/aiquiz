/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    env: {
      OPENAI_API_KEY: "sk-2y...TODO_FILL_IN_YOUR_OPENAI_KEY_HERE",
      MONGODB_URI: "mongodb://localhost:27017/aiquiz",
      },
}

module.exports = nextConfig
