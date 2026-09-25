/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    compress: true,
    experimental: {
        optimizePackageImports: ["lucide-react", "recharts"],
    },
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "**" },
        ],
    },
};

module.exports = nextConfig;