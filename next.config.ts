import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase this to 50mb if you plan on longer videos
    },
  },
  
  // ⚠️ FIX: This bakes the environment variables into the build
  // so the server can access them on Amplify.
  env: {
    // DynamoDB Credentials (Fixes the "credential object not valid" error)
    AUTH_DYNAMODB_ID: process.env.AUTH_DYNAMODB_ID,
    AUTH_DYNAMODB_SECRET: process.env.AUTH_DYNAMODB_SECRET,
    AUTH_DYNAMODB_REGION: process.env.AUTH_DYNAMODB_REGION,
    AUTH_DYNAMODB_TABLE: process.env.AUTH_DYNAMODB_TABLE,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,

    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,

    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
  },
};

export default nextConfig;