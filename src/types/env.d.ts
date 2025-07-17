declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    MONGODB_URL: string;

    CROS_ORIGIN?: string;

    ACCESS_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRY: string;

    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRY: string;

    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  }
}
