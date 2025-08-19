import dotenv from "dotenv";

dotenv.config();

export const logDirectory = process.env.LOG_DIR;

export const environment = process.env.NODE_ENV;
