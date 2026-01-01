const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // GitHub Pages repo adı path'i için gereklidir
  basePath: isProd ? '/AdistowLite' : '',
  trailingSlash: true,
  reactStrictMode: false,
  images: {
    domains: ['localhost', 'restqr-storage.s3.amazonaws.com'],
    unoptimized: true
  },
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  env: {
    CUSTOM_KEY: 'restqr-customer',
  },
};

module.exports = withPWA(nextConfig);