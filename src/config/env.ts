import dotenv from 'dotenv';
dotenv.config();

const devEnv = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  CORS_ORIGIN: process.env.WHITELIST,
  DB: {
    MONGO: process.env.MONGO_URI,
    REDIS: process.env.REDIS_URI
  },
  JWT: {
    VERIFY: process.env.JWT_VERIFY_SECRET,
    ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES,
    REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES,
    FORGOT_PASSWORD: process.env.JWT_FORGOT_PASSWORD
  },
  CLIENT_URL: process.env.CLIENT_URL,
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET
  },
  VDOCIPHER_API_SECRET: process.env.VDOCIPHER_API_SECRET,
  STRIPE: {
    SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    PUBLISH_KEY: process.env.STRIPE_PUBLISH_KEY
  }
};

const prodEnv = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  CORS_ORIGIN: process.env.WHITELIST,
  DB: {
    MONGO: process.env.MONGO_URI,
    REDIS: process.env.REDIS_URI
  },
  JWT: {
    VERIFY: process.env.JWT_VERIFY_SECRET,
    ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES,
    REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES,
    FORGOT_PASSWORD: process.env.JWT_FORGOT_PASSWORD
  },
  CLIENT_URL: process.env.CLIENT_URL,
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET
  },
  VDOCIPHER_API_SECRET: process.env.VDOCIPHER_API_SECRET,
  STRIPE: {
    SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    PUBLISH_KEY: process.env.STRIPE_PUBLISH_KEY
  }
};

const dotenvConfig = {
  development: devEnv,
  production: prodEnv
};
const nodeEnv = (process.env.NODE_ENV as keyof typeof dotenvConfig) || 'development';
const env = dotenvConfig[nodeEnv];

export default env;
