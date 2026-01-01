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

const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: false, // Disable strict mode to prevent double rendering errors
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

module.exports = withPWA(withNextIntl(nextConfig));